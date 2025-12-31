"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePitchDetection, useAudioPlayer, NOTES } from "../lib/audioUtils";

interface ProducePitchStepProps {
  targetNote: (typeof NOTES)[0];
  onComplete: (isCorrect: boolean) => void;
}

export default function ProducePitchStep({
  targetNote,
  onComplete,
}: ProducePitchStepProps) {
  const [userFreq, setUserFreq] = useState(0);
  const [userNoteName, setUserNoteName] = useState<string>("---");
  const [displayCents, setDisplayCents] = useState(0); // For the needle
  const [matchStatus, setMatchStatus] = useState<"neutral" | "close" | "match">(
    "neutral"
  );
  const [octaveDiff, setOctaveDiff] = useState(0); // Track if they are singing too low/high

  const { createPitchDetector } = usePitchDetection();
  const { playNote } = useAudioPlayer();
  const detectorRef = useRef<any>(null);
  const successTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startListening();
    return () => stopListening();
  }, [targetNote]);

  // Helper: Convert Frequency to Note Number (MIDI style)
  const getNoteNumber = (freq: number) => {
    return 12 * Math.log2(freq / 440) + 69;
  };

  const handleNoteDetected = (note: any, pitch: number) => {
    if (!pitch || pitch < 50) return; // Ignore low noise

    setUserFreq(pitch);

    // 1. Calculate the Note Numbers
    const targetNum = getNoteNumber(targetNote.frequency);
    const userNum = getNoteNumber(pitch);

    // 2. Find difference in semitones
    const diff = userNum - targetNum;
    const roundedDiff = Math.round(diff); // Integer semitone difference

    // 3. Determine if it is the correct "Class" of note (ignoring Octave)
    const isCorrectNoteClass = Math.abs(roundedDiff) % 12 === 0;

    // 4. Calculate Cents relative to the CLOSEST semitone user is singing
    const centsOff = (diff - roundedDiff) * 100;

    // --- FIX 1: Smooth the needle (Averaging) ---
    setDisplayCents((prev) => prev * 0.5 + centsOff * 0.5);

    // 5. Update UI Name
    if (note && note.name) {
      setUserNoteName(note.name);
    }

    // 6. Check for Success
    if (isCorrectNoteClass) {
      const currentOctaveDiff = Math.round(diff / 12);
      setOctaveDiff(currentOctaveDiff);

      // --- FIX 2: Wider Tolerance (40 cents) ---
      if (Math.abs(centsOff) <= 40) {
        setMatchStatus("match");

        // --- FIX 3: Magnetic Snap (Force Center) ---
        setDisplayCents(0);

        // Wait 0.8 seconds to confirm it wasn't a glitch
        if (!successTimer.current) {
          successTimer.current = setTimeout(() => {
            stopListening();
            onComplete(true);
          }, 800);
        }
      } else {
        // Right note, but out of tune
        setMatchStatus("close");
        if (successTimer.current) {
          clearTimeout(successTimer.current);
          successTimer.current = null;
        }
      }
    } else {
      // Wrong note entirely
      setMatchStatus("neutral");
      setOctaveDiff(0);
      if (successTimer.current) {
        clearTimeout(successTimer.current);
        successTimer.current = null;
      }
    }
  };

  const startListening = async () => {
    detectorRef.current = createPitchDetector(handleNoteDetected, (err: any) =>
      console.log(err)
    );
    await detectorRef.current.startDetection();
  };

  const stopListening = () => {
    if (detectorRef.current) detectorRef.current.stopDetection();
    if (successTimer.current) clearTimeout(successTimer.current);
  };

  // Clamp needle for visuals
  const needleRotation = Math.max(-45, Math.min(45, displayCents));

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Sing this note</h2>
      </div>

      {/* --- TUNER UI --- */}
      <div className="relative w-full aspect-square max-w-[280px] mb-8 bg-[#1A2C26] rounded-full border-4 border-[#2A4C46] shadow-2xl flex flex-col items-center justify-center overflow-hidden">
        {/* Glow Effects */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            matchStatus === "match"
              ? "bg-green-500/30 shadow-[inset_0_0_50px_rgba(34,197,94,0.4)]"
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

          {/* Show Target Frequency */}
          <div className="text-gray-400 font-mono text-xs mt-2">
            {targetNote.frequency.toFixed(0)} Hz
          </div>
        </div>

        {/* --- NEEDLE AREA --- */}
        <div className="absolute inset-x-0 bottom-6 h-28 flex items-end justify-center">
          {/* Gauge Background */}
          <div className="absolute bottom-0 w-64 h-32 border-t border-gray-600/50 rounded-t-full"></div>

          {/* Ticks */}
          <div className="absolute bottom-0 w-6 h-6 bg-green-500/20 rounded-t-full z-0 blur-sm"></div>
          <div className="absolute bottom-0 w-0.5 h-5 bg-green-500 z-10"></div>
          <div className="absolute bottom-0 w-0.5 h-3 bg-gray-500 left-16 rotate-[-45deg] origin-bottom"></div>
          <div className="absolute bottom-0 w-0.5 h-3 bg-gray-500 right-16 rotate-[45deg] origin-bottom"></div>

          {/* The Needle */}
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

        <div className="absolute bottom-3 w-full flex justify-between px-10 text-[9px] font-bold text-gray-500 uppercase">
          <span>Flat</span>
          <span className={matchStatus === "match" ? "text-green-400" : ""}>
            Tune
          </span>
          <span>Sharp</span>
        </div>
      </div>

      {/* --- FEEDBACK BAR --- */}
      <div
        className={`w-full rounded-2xl p-5 border transition-colors duration-300 mb-6 shadow-lg ${
          matchStatus === "match"
            ? "bg-green-900/30 border-green-500/50"
            : "bg-[#11221F] border-[#2A4C46]"
        }`}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-400 text-xs uppercase tracking-wider">
            You are singing
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
            {/* Show relative octave if detected */}
            {matchStatus !== "neutral" && octaveDiff !== 0 && (
              <span className="px-2 py-0.5 rounded bg-gray-700 text-gray-300 text-xs">
                {octaveDiff > 0 ? `+${octaveDiff} Oct` : `${octaveDiff} Oct`}
              </span>
            )}
          </div>

          <div className="text-right">
            {matchStatus === "match" ? (
              <span className="text-green-400 font-bold text-lg animate-pulse">
                Perfect! Hold it...
              </span>
            ) : matchStatus === "close" ? (
              <span className="text-yellow-400 font-bold">
                So Close! Tune it...
              </span>
            ) : (
              <span className="text-gray-500 italic text-sm">
                Find the pitch...
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4 w-full">
        <button
          onClick={() => onComplete(false)}
          className="px-8 border border-gray-700 hover:bg-gray-800 text-gray-400 font-bold py-4 rounded-xl transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
