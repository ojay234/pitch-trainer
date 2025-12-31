"use client";
import React, { useState, useEffect } from "react";
import { useAudioPlayer, NOTES } from "../lib/audioUtils";
import { PiMusicNoteSimpleFill, PiSpeakerHighLight } from "react-icons/pi";
import { TiMediaPlay } from "react-icons/ti";

interface IdentifyPitchStepProps {
  targetNote: (typeof NOTES)[0];
  onComplete: (isCorrect: boolean) => void;
}

export default function IdentifyPitchStep({
  targetNote,
  onComplete,
}: IdentifyPitchStepProps) {
  const { playNote } = useAudioPlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNoteName, setSelectedNoteName] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [options, setOptions] = useState<typeof NOTES>([]);

  // Generate random options (1 correct + 3 wrong) whenever targetNote changes
  useEffect(() => {
    // 1. Filter out the correct note to get potential wrong answers
    const otherNotes = NOTES.filter((n) => n.name !== targetNote.name);

    // 2. Shuffle remaining notes and pick 3
    const shuffledOthers = [...otherNotes].sort(() => Math.random() - 0.5);
    const distractors = shuffledOthers.slice(0, 3);

    // 3. Combine correct note + distractors and shuffle them for the UI
    const quizOptions = [targetNote, ...distractors].sort(
      () => Math.random() - 0.5
    );

    setOptions(quizOptions);

    // Play the note automatically on load
    handlePlay();
  }, [targetNote]);

  const handlePlay = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    playNote(targetNote.frequency);
    setTimeout(() => setIsPlaying(false), 1500);
  };

  const handleSelect = (noteName: string) => {
    if (hasAnswered) return;
    setSelectedNoteName(noteName);
    setHasAnswered(true);

    const isCorrect = noteName === targetNote.name;

    // Slight delay to show result before moving on
    setTimeout(() => {
      onComplete(isCorrect);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Robot / Visual Area */}
      <div className="relative mb-8 group cursor-pointer" onClick={handlePlay}>
        <div
          className={`w-48 h-48 bg-gradient-to-b from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center shadow-2xl border border-gray-600 relative overflow-hidden ${
            isPlaying ? "ring-4 ring-green-500/50" : ""
          }`}
        >
          <div className="text-6xl">
            {isPlaying ? <PiSpeakerHighLight /> : <PiMusicNoteSimpleFill />}
          </div>

          {/* Visualizer bars */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 flex items-end justify-center gap-1 pb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-2 bg-green-400 rounded-t-sm transition-all duration-100 ${
                  isPlaying ? "animate-pulse h-8" : "h-2"
                }`}
                style={{ height: isPlaying ? `${Math.random() * 80}%` : "10%" }}
              ></div>
            ))}
          </div>
        </div>

        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
          <button className="bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-6 rounded-full shadow-lg flex items-center gap-2 transition-transform active:scale-95 whitespace-nowrap">
            <span className="my-auto text-xl">
              <TiMediaPlay />
            </span>
            Replay Note
          </button>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">
          Listen closely...
        </h2>
        <p className="text-gray-400">What key is this?</p>
      </div>

      {/* Grid of Note Buttons (2x2 Layout) */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((note) => {
          const isSelected = selectedNoteName === note.name;
          const isTarget = note.name === targetNote.name;

          let btnStyle =
            "bg-[#1A2C26] border border-[#2A4C46] text-white hover:bg-[#2A4C46] hover:scale-[1.02]";

          if (hasAnswered) {
            if (isTarget)
              // Correct answer always turns green
              btnStyle =
                "bg-green-500 text-black border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-105";
            else if (isSelected && !isTarget)
              // Wrong selection turns red
              btnStyle = "bg-red-500 text-white border-red-500 opacity-80";
            // Others fade out
            else
              btnStyle =
                "opacity-40 bg-[#1A2C26] text-gray-500 border-transparent";
          }

          return (
            <button
              key={note.name}
              onClick={() => handleSelect(note.name)}
              disabled={hasAnswered}
              className={`h-20 rounded-2xl text-xl font-bold transition-all duration-200 shadow-lg ${btnStyle}`}
            >
              {note.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
