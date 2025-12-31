"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePitchDetection, useAudioPlayer, NOTES } from "../../lib/audioUtils";

export default function VocalLesson() {
  const [targetNote, setTargetNote] = useState(NOTES[0]); // Default C4
  const [userFreq, setUserFreq] = useState(0);
  const [userNoteName, setUserNoteName] = useState<string>("---");
  const [displayCents, setDisplayCents] = useState(0);
  const [matchStatus, setMatchStatus] = useState<"neutral" | "close" | "match">(
    "neutral"
  );
  const [octaveDiff, setOctaveDiff] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState("Sing to start...");

  const { createPitchDetector } = usePitchDetection();
  const { playNote } = useAudioPlayer();
  const detectorRef = useRef<any>(null);

  useEffect(() => {
    startListening();
    return () => stopListening();
  }, [targetNote]);

  const getNoteNumber = (freq: number) => 12 * Math.log2(freq / 440) + 69;

  const handleNoteDetected = (note: any, pitch: number) => {
    if (!pitch || pitch < 50) return;

    setUserFreq(pitch);

    const targetNum = getNoteNumber(targetNote.frequency);
    const userNum = getNoteNumber(pitch);
    const diff = userNum - targetNum;
    const roundedDiff = Math.round(diff);

    const isCorrectNoteClass = Math.abs(roundedDiff) % 12 === 0;
    const centsOff = (diff - roundedDiff) * 100; // True distance from perfect pitch

    if (note && note.name) setUserNoteName(note.name);

    if (isCorrectNoteClass) {
      const currentOctaveDiff = Math.round(diff / 12);
      setOctaveDiff(currentOctaveDiff);

      // --- THE FIX: MAGNETIC SNAP ---
      // If within the "Win Zone" (40 cents), force visual to 0 (Center)
      if (Math.abs(centsOff) <= 40) {
        setMatchStatus("match");
        setFeedbackMsg("Perfect! Hold it steady.");
        setDisplayCents(0); // <--- FORCE CENTER
      } else {
        setMatchStatus("close");
        // Show true deviation so they know which way to move
        setDisplayCents(centsOff);

        if (centsOff < 0) setFeedbackMsg("Too Low! Push Up ↑");
        else setFeedbackMsg("Too High! Relax Down ↓");
      }
    } else {
      setMatchStatus("neutral");
      setDisplayCents(centsOff); // Show true deviation
      setOctaveDiff(0);
      setFeedbackMsg(`Try to match ${targetNote.name}`);
    }
  };

  const startListening = async () => {
    if (detectorRef.current) return;
    detectorRef.current = createPitchDetector(handleNoteDetected, () => {});
    await detectorRef.current.startDetection();
  };

  const stopListening = () => {
    if (detectorRef.current) {
      detectorRef.current.stopDetection();
      detectorRef.current = null;
    }
  };

  const needleRotation = Math.max(-45, Math.min(45, displayCents));

  return (
    <div className="text-white p-4 flex flex-col items-center">
      <div className="w-full max-w-md mb-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Vocal Gym</h1>

        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x">
          {NOTES.map((n) => (
            <button
              key={n.name}
              onClick={() => setTargetNote(n)}
              className={`flex-shrink-0 w-14 h-14 rounded-2xl font-bold text-lg transition-all snap-center flex items-center justify-center border ${
                targetNote.name === n.name
                  ? "bg-green-500 text-black border-green-400 scale-105 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                  : "bg-[#1A2C26] text-gray-400 border-[#2A4C46] hover:bg-[#253f36]"
              }`}
            >
              {n.name}
            </button>
          ))}
        </div>
      </div>

      {/* --- TUNER UI --- */}
      <div className="relative w-full aspect-square max-w-[280px] mb-8 bg-[#1A2C26] rounded-full border-4 border-[#2A4C46] shadow-2xl flex flex-col items-center justify-center overflow-hidden">
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            matchStatus === "match"
              ? "bg-green-500/20 shadow-[inset_0_0_60px_rgba(34,197,94,0.3)]"
              : ""
          }`}
        ></div>

        <div className="z-10 flex flex-col items-center mt-[-20px]">
          <div className="text-green-500 font-medium tracking-widest text-xs uppercase mb-1">
            Target
          </div>
          <div className="text-8xl font-black text-white flex items-start leading-none drop-shadow-lg">
            {targetNote.name.replace("#", "")}
            {targetNote.name.includes("#") && (
              <span className="text-5xl text-green-500 ml-1 -mt-2">#</span>
            )}
          </div>
          <div className="text-gray-400 font-mono text-xs mt-2">
            {targetNote.frequency.toFixed(0)} Hz
          </div>
        </div>

        {/* Needle Area */}
        <div className="absolute inset-x-0 bottom-6 h-28 flex items-end justify-center">
          <div className="absolute bottom-0 w-64 h-32 border-t border-gray-600/50 rounded-t-full"></div>

          <div className="absolute bottom-0 w-6 h-6 bg-green-500/20 rounded-t-full z-0 blur-sm"></div>
          <div className="absolute bottom-0 w-0.5 h-5 bg-green-500 z-10"></div>

          <div
            className="w-1.5 h-24 origin-bottom rounded-full transition-transform duration-300 ease-out z-20 relative"
            style={{
              backgroundColor: matchStatus === "match" ? "#22c55e" : "#f87171",
              transform: `rotate(${needleRotation}deg)`,
            }}
          >
            <div className="absolute -top-1 -left-1 w-3.5 h-3.5 bg-white rounded-full shadow-md"></div>
          </div>
        </div>
      </div>

      {/* --- FEEDBACK BOX --- */}
      <div
        className={`w-full max-w-md rounded-2xl p-5 border transition-colors duration-300 mb-6 shadow-lg ${
          matchStatus === "match"
            ? "bg-green-900/30 border-green-500/50"
            : "bg-[#11221F] border-[#2A4C46]"
        }`}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-400 text-xs uppercase tracking-wider">
            Your Voice
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              userFreq > 0 ? "bg-red-500 animate-pulse" : "bg-gray-700"
            }`}
          ></span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-white">
              {userNoteName}
            </span>
            {matchStatus !== "neutral" && octaveDiff !== 0 && (
              <span className="px-2 py-0.5 rounded bg-gray-700 text-gray-300 text-xs">
                {octaveDiff > 0 ? `+${octaveDiff} Oct` : `${octaveDiff} Oct`}
              </span>
            )}
          </div>

          <div
            className={`text-right text-sm font-bold ${
              matchStatus === "match"
                ? "text-green-400"
                : matchStatus === "close"
                ? "text-yellow-400"
                : "text-gray-500"
            }`}
          >
            {feedbackMsg}
          </div>
        </div>
      </div>

      <button
        onClick={() => playNote(targetNote.frequency)}
        className="w-full max-w-md bg-[#2A4C46] hover:bg-[#3A5C56] text-white font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
      >
        <span className="text-xl">🔊</span> Hear Reference
      </button>
    </div>
  );
}
