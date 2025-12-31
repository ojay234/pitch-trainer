"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePitchDetection } from "../../lib/audioUtils";

export default function PitchPlayground() {
  const [currentNote, setCurrentNote] = useState<{
    name: string;
    freq: number;
  } | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const { createPitchDetector } = usePitchDetection();
  const detectorRef = useRef<any>(null);

  useEffect(() => {
    const detector = createPitchDetector(
      (note: any, pitch: number) => {
        if (pitch > 50 && note) {
          setCurrentNote({ name: note.name, freq: pitch });

          // Add to history if different from last note (throttled)
          setHistory((prev) => {
            const last = prev[prev.length - 1];
            if (last !== note.name) {
              return [...prev.slice(-7), note.name]; // Keep last 8 notes
            }
            return prev;
          });
        }
      },
      () => {}
    );

    detector.startDetection();
    detectorRef.current = detector;

    return () => detector.stopDetection();
  }, []);

  return (
    <div className="text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500 rounded-full blur-[100px]"></div>
      </div>

      <h1 className="text-xl font-bold text-gray-500 mb-12 uppercase tracking-[0.2em] z-10">
        Pitch Playground
      </h1>

      {/* Main Display */}
      <div className="relative z-10 mb-12 text-center">
        <div className="text-[10rem] font-black leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-600 transition-all duration-100">
          {currentNote ? currentNote.name : "..."}
        </div>
        <div className="text-2xl font-mono text-green-500 mt-4">
          {currentNote ? `${currentNote.freq.toFixed(1)} Hz` : "Sing to start"}
        </div>
      </div>

      {/* Note Trail (History) */}
      <div className="flex gap-4 items-center h-24 z-10">
        {history.map((note, i) => (
          <div
            key={i}
            className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 font-bold animate-in slide-in-from-right duration-300"
            style={{ opacity: (i + 1) / history.length }}
          >
            {note}
          </div>
        ))}
      </div>

      <p className="mt-12 text-gray-600 text-sm z-10">
        Just sing freely. We'll visualize it.
      </p>
    </div>
  );
}
