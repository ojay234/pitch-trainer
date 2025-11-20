// components/SoundExplorer.js
'use client';
import { useState, useCallback, useRef } from 'react';
import { useAudioPlayer, NOTES } from '../lib/audioUtils';

export default function SoundExplorer() {
  const [selectedNote, setSelectedNote] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const { playNote } = useAudioPlayer();
  const audioContextRef = useRef(null);

  const playSound = useCallback((note) => {
    if (isPlaying) return;
    
    setSelectedNote(note);
    setIsPlaying(true);
    
    // Create a new audio context for each play to ensure user interaction
    playNote(note.frequency, 2000);
    
    setTimeout(() => {
      setIsPlaying(false);
      if (!isPlayingAll) {
        setSelectedNote(null);
      }
    }, 1500);
  }, [isPlaying, isPlayingAll, playNote]);

  const playAllNotes = useCallback(async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setIsPlayingAll(true);
    
    // Create and resume audio context on user interaction
    try {
      // Force audio context creation on user interaction
      const AudioContext = window.AudioContext;
      audioContextRef.current = new AudioContext();
      
      // Resume the context immediately while we have user interaction
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
    } catch (error) {
      console.log('Audio context setup:', error);
    }
    
    // Play each note sequentially with proper timing
    for (let i = 0; i < NOTES.length; i++) {
      setSelectedNote(NOTES[i]);
      
      // Use the playNote function but ensure it uses the active context
      playNote(NOTES[i].frequency, 800);
      
      // Wait for the note to mostly finish before playing next
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsPlaying(false);
    setIsPlayingAll(false);
    setSelectedNote(null);
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [isPlaying, playNote]);

  // Alternative approach: Play all notes with a single user interaction
  const playAllNotesAlternative = useCallback(() => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setIsPlayingAll(true);
    setSelectedNote(NOTES[0]);
    
    // Create a single audio context for the entire sequence
    try {
      const AudioContext = window.AudioContext;
      const audioContext = new AudioContext();
      
      let currentTime = audioContext.currentTime;
      
      // Schedule all notes at once with proper timing
      NOTES.forEach((note, index) => {
        const startTime = currentTime + (index * 1.0); // 1 second between notes
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 2;
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = note.frequency;
        oscillator.type = 'triangle';
        
        // Envelope
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.1, startTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
        
        // Filter envelope
        filter.frequency.setValueAtTime(4000, startTime);
        filter.frequency.exponentialRampToValueAtTime(1000, startTime + 0.8);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.8);
        
        // Update UI at the scheduled time
        setTimeout(() => {
          setSelectedNote(note);
        }, index * 1000);
      });
      
      // Calculate total duration and reset state
      const totalDuration = NOTES.length * 1000;
      setTimeout(() => {
        setIsPlaying(false);
        setIsPlayingAll(false);
        setSelectedNote(null);
        audioContext.close();
      }, totalDuration);
      
    } catch (error) {
      console.error('Error playing all notes:', error);
      setIsPlaying(false);
      setIsPlayingAll(false);
    }
  }, [isPlaying]);

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
        <div className="flex flex-col gap-4 justify-center items-center">
          <button
            onClick={playAllNotesAlternative}
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
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Listen to all 12 notes in sequence
            </p>
            <p className="text-xs text-gray-500">
              {isPlaying && selectedNote ? `Now playing: ${selectedNote.name}` : 'Tap to play the chromatic scale'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress indicator for all notes */}
      {isPlayingAll && (
        <div className="mb-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">
              Progress: {NOTES.findIndex(note => note.name === selectedNote?.name) + 1 || 0}/{NOTES.length}
            </span>
            <span className="text-sm font-semibold text-blue-800">
              {selectedNote?.name || 'Starting...'}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${((NOTES.findIndex(note => note.name === selectedNote?.name) + 1) / NOTES.length) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {NOTES.map((note) => (
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

      {/* Mobile-specific tip */}
      <div className="mt-6 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
        <div className="flex items-start space-x-2">
          <span className="text-yellow-600">📱</span>
          <div>
            <h4 className="font-semibold text-yellow-800 text-sm">Mobile Tip</h4>
            <p className="text-yellow-700 text-xs">
              Ensure your device is not on silent/vibrate mode and volume is turned up for best experience.
            </p>
          </div>
        </div>
      </div>

      {/* Practice Tips */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          🎯 Practice Tips
        </h3>
        <ul className="text-gray-600 space-y-2 text-sm">
          <li>• Listen carefully to the unique character of each note</li>
          <li>• Pay attention to the relationships between adjacent notes</li>
          <li>• Try to hum along with each note to internalize the pitch</li>
          <li>• Notice how sharps have a slightly brighter, more tense sound</li>
        </ul>
      </div>
    </div>
  );
}