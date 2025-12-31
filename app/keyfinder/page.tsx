"use client";
import React, { useState, useRef } from "react";
import { usePitchDetection } from "../../lib/audioUtils";

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

const MAJOR_SCALES = NOTE_NAMES.map((root, rootIndex) => {
  const scaleNotes = MAJOR_SCALE_INTERVALS.map((interval) => {
    return NOTE_NAMES[(rootIndex + interval) % 12];
  });
  return { root, notes: scaleNotes };
});

export default function KeyFinder() {
  const [isRecording, setIsRecording] = useState(false);
  const [detectedNotes, setDetectedNotes] = useState<Set<string>>(new Set());
  const [likelyKey, setLikelyKey] = useState<string | null>(null);

  // UI State for the "Processing" note
  const [pendingNote, setPendingNote] = useState<string | null>(null);

  const { createPitchDetector } = usePitchDetection();
  const detectorRef = useRef<any>(null);

  // --- STABILITY REFS ---
  const lastNoteRef = useRef<string | null>(null);
  const stabilityCountRef = useRef(0);
  const LOCK_THRESHOLD = 15; // Requires holding note for ~300-400ms

  const calculateKey = (notesSet: Set<string>) => {
    if (notesSet.size < 3) return null;
    const notesArr = Array.from(notesSet);
    let bestKey = null;
    let maxMatches = 0;

    MAJOR_SCALES.forEach((scale) => {
      const matches = notesArr.filter((note) =>
        scale.notes.includes(note)
      ).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        bestKey = scale.root;
      }
    });
    return bestKey;
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop
      if (detectorRef.current) detectorRef.current.stopDetection();
      setIsRecording(false);
      setPendingNote(null);
      const result = calculateKey(detectedNotes);
      setLikelyKey(result);
    } else {
      // Start
      setDetectedNotes(new Set());
      setLikelyKey(null);
      setPendingNote(null);

      // Reset Refs
      lastNoteRef.current = null;
      stabilityCountRef.current = 0;

      const detector = createPitchDetector(
        (note: any, pitch: number) => {
          // Filter weak signals
          if (note && pitch > 80) {
            // --- LOGIC: DEBOUNCING / STABILIZATION ---
            if (note.name === lastNoteRef.current) {
              stabilityCountRef.current++;
            } else {
              lastNoteRef.current = note.name;
              stabilityCountRef.current = 0;
              setPendingNote(note.name); // Update UI to show "Analyzing X..."
            }

            // Only "Lock" the note if held stable for threshold
            if (stabilityCountRef.current > LOCK_THRESHOLD) {
              setDetectedNotes((prev) => {
                const newSet = new Set(prev);
                newSet.add(note.name);
                return newSet;
              });
              setPendingNote(null); // Clear pending since it's now locked
              stabilityCountRef.current = 0; // Reset to avoid re-adding continuously
            }
          } else {
            // Silence or noise resets the counter
            stabilityCountRef.current = 0;
            setPendingNote(null);
          }
        },
        () => {}
      );

      await detector.startDetection();
      detectorRef.current = detector;
      setIsRecording(true);
    }
  };

  return (
    <div className="text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center">Key Finder</h1>
        <p className="text-gray-400 text-center mb-8">
          Sing a melody (Do-Re-Mi...) clearly. We'll ignore the shaky notes.
        </p>

        {/* Visualization of Recorded Notes */}
        <div className="bg-[#1A2C26] rounded-2xl p-6 min-h-[200px] mb-8 border border-[#2A4C46] flex flex-col justify-between">
          {/* Locked Notes Area */}
          <div className="flex flex-wrap content-start gap-2 mb-4">
            {detectedNotes.size === 0 && !pendingNote ? (
              <span className="text-gray-600 italic w-full text-center mt-4">
                {isRecording
                  ? "Sing and hold a note..."
                  : "Tap Start to begin..."}
              </span>
            ) : (
              Array.from(detectedNotes).map((note) => (
                <span
                  key={note}
                  className="px-4 py-2 bg-green-500 text-black rounded-full text-lg font-bold shadow-lg animate-in zoom-in duration-200"
                >
                  {note}
                </span>
              ))
            )}
          </div>

          {/* Pending Note Indicator (The "Ghost" Note) */}
          {isRecording && (
            <div className="h-12 border-t border-gray-700 flex items-center justify-center">
              {pendingNote ? (
                <div className="flex items-center gap-2 text-yellow-500 animate-pulse">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="font-mono text-sm">
                    Identifying {pendingNote}...
                  </span>
                </div>
              ) : (
                <span className="text-gray-600 text-xs uppercase tracking-widest">
                  Listening
                </span>
              )}
            </div>
          )}
        </div>

        {/* Result Display */}
        {likelyKey && !isRecording && (
          <div className="text-center mb-8 animate-in slide-in-from-bottom duration-500">
            <div className="text-gray-400 text-sm uppercase tracking-widest mb-2">
              Detected Key
            </div>
            <div className="text-6xl font-black text-white bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              {likelyKey} <span className="text-2xl text-gray-500">Major</span>
            </div>
            {/*  - Diagram of the major scale for the detected key */}
          </div>
        )}

        {/* Control Button */}
        <button
          onClick={toggleRecording}
          className={`w-full py-5 rounded-2xl font-bold text-xl shadow-lg transition-all transform active:scale-95 ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
              : "bg-green-500 hover:bg-green-400 text-black"
          }`}
        >
          {isRecording ? "Stop Listening" : "Start Finding Key"}
        </button>
      </div>
    </div>
  );
}
