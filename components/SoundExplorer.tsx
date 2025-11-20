'use client';
import { useState, useCallback } from 'react';
import { useAudioPlayer, NOTES } from '../lib/audioUtils';

export default function SoundExplorer() {
  const [selectedNote, setSelectedNote] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { playNote } = useAudioPlayer();

  const playSound = useCallback((note) => {
    if (isPlaying) return;
    
    setSelectedNote(note);
    setIsPlaying(true);
    
    playNote(note.frequency, 2000);
    
    setTimeout(() => {
      setIsPlaying(false);
    }, 1500);
  }, [isPlaying, playNote]);

  const playAllNotes = useCallback(async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    // Play each note sequentially with a short delay
    for (let i = 0; i < NOTES.length; i++) {
      setSelectedNote(NOTES[i]);
      playNote(NOTES[i].frequency, 800);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setSelectedNote(null);
    setIsPlaying(false);
  }, [isPlaying, playNote]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Sound Explorer</h2>
        <p className="text-gray-600">
          Listen to all notes and familiarize yourself with their sounds
        </p>
      </div>

      {/* Quick Play Controls */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={playAllNotes}
            disabled={isPlaying}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-green-300 disabled:to-emerald-400 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
          >
            {isPlaying ? (
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-5 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>Playing Notes...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎵</span>
                <span>Play All Notes</span>
              </div>
            )}
          </button>
          
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600">
              Listen to all 12 notes in sequence
            </p>
          </div>
        </div>
      </div>

      {/* Currently Playing Indicator */}
      {selectedNote && isPlaying && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-center">
          <div className="flex items-center justify-center space-x-3">
            <div className="flex space-x-1">
              <div className="w-2 h-6 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-6 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-6 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-lg font-semibold text-blue-800">
              Now Playing: {selectedNote.name}
            </span>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {NOTES.map((note, index) => (
          <button
            key={note.name}
            onClick={() => playSound(note)}
            disabled={isPlaying}
            className={`p-6 rounded-xl border-2 text-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
              selectedNote?.name === note.name && isPlaying
                ? 'bg-blue-100 border-blue-500 text-blue-700 shadow-lg scale-105'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md'
            } ${isPlaying ? 'opacity-90' : ''}`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">
                {selectedNote?.name === note.name && isPlaying ? '🔊' : '🎵'}
              </div>
              <div className="text-xl font-bold">{note.name}</div>
              <div className="text-sm text-gray-500 mt-1">
                {Math.round(note.frequency)} Hz
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Practice Tips */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          🎯 Practice Tips
        </h3>
        <ul className="text-gray-600 space-y-2">
          <li>• Listen carefully to the unique character of each note</li>
          <li>• Pay attention to the relationships between adjacent notes</li>
          <li>• Try to hum along with each note to internalize the pitch</li>
          <li>• Notice how sharps have a slightly brighter, more tense sound</li>
        </ul>
      </div>

      {/* Quick Reference */}
      <div className="mt-6 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          📋 Note Reference
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Natural Notes</h4>
            <div className="text-gray-600">C, D, E, F, G, A, B</div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Sharp Notes</h4>
            <div className="text-gray-600">C#, D#, F#, G#, A#</div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Frequency Range</h4>
            <div className="text-gray-600">261.63 Hz - 493.88 Hz</div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Total Notes</h4>
            <div className="text-gray-600">12 (Chromatic Scale)</div>
          </div>
        </div>
      </div>
    </div>
  );
}