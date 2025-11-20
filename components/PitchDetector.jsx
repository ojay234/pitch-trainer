'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePitchDetection } from '../lib/audioUtils';

export default function PitchDetector() {
  const [currentNote, setCurrentNote] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  
  const pitchDetectorRef = useRef(null);
  const { createPitchDetector } = usePitchDetection();

  const handleNoteDetected = useCallback((note, frequency) => {
    if (note) {
      setCurrentNote(note);
      // Calculate volume level for visualization (0-100)
      const level = Math.min(100, Math.max(0, (frequency - 50) / 10));
      setVolumeLevel(level);
    } else {
      setCurrentNote(null);
      setVolumeLevel(0);
    }
  }, []);

  const handleError = useCallback((errorMessage) => {
    setError(errorMessage);
    setIsInitializing(false);
    setIsRecording(false);
  }, []);

  const startDetection = useCallback(async () => {
    if (isRecording) return;

    setIsInitializing(true);
    setError(null);
    setCurrentNote(null);
    setVolumeLevel(0);

    try {
      pitchDetectorRef.current = createPitchDetector(handleNoteDetected, handleError);
      const started = await pitchDetectorRef.current.startDetection();
      
      if (started) {
        setIsRecording(true);
        setIsInitializing(false);
      } else {
        setError('Failed to start pitch detection. Please check microphone permissions.');
        setIsInitializing(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to start detection');
      setIsInitializing(false);
    }
  }, [isRecording, createPitchDetector, handleNoteDetected, handleError]);

  const stopDetection = useCallback(() => {
    if (pitchDetectorRef.current) {
      pitchDetectorRef.current.stopDetection();
      pitchDetectorRef.current = null;
    }
    setIsRecording(false);
    setCurrentNote(null);
    setVolumeLevel(0);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pitchDetectorRef.current) {
        pitchDetectorRef.current.stopDetection();
      }
    };
  }, []);

  // Demo mode with simulated detection
  const startDemoMode = useCallback(() => {
    setError(null);
    setIsRecording(true);
    
    const notes = [
      { name: 'C', frequency: 261.63, octave: 4 },
      { name: 'D', frequency: 293.66, octave: 4 },
      { name: 'E', frequency: 329.63, octave: 4 },
      { name: 'F', frequency: 349.23, octave: 4 },
      { name: 'G', frequency: 392.00, octave: 4 },
      { name: 'A', frequency: 440.00, octave: 4 },
      { name: 'B', frequency: 493.88, octave: 4 }
    ];
    
    let noteIndex = 0;
    
    const demoInterval = setInterval(() => {
      if (!isRecording) {
        clearInterval(demoInterval);
        return;
      }
      
      const note = notes[noteIndex % notes.length];
      setCurrentNote({
        ...note,
        fullName: `${note.name}${note.octave}`,
        cents: Math.floor(Math.random() * 50) - 25
      });
      
      setVolumeLevel(50 + Math.random() * 50);
      noteIndex++;
    }, 1500);
    
    return () => clearInterval(demoInterval);
  }, [isRecording]);

  useEffect(() => {
    let demoCleanup;
    if (isRecording && error) {
      demoCleanup = startDemoMode();
    }
    return () => {
      if (demoCleanup) demoCleanup();
    };
  }, [isRecording, error, startDemoMode]);

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Pitch Detector</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="text-4xl mb-4">🎤</div>
          <p className="text-yellow-700 text-lg mb-4">
            {error}
          </p>
          <p className="text-gray-600 mb-4">
            Running in demo mode. For real pitch detection, allow microphone access.
          </p>
          <div className="space-y-3">
            <button
              onClick={startDetection}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors block w-full"
            >
              Try Real Detection Again
            </button>
            <button
              onClick={stopDetection}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors block w-full"
            >
              Stop Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Pitch Detector</h2>
        <p className="text-gray-600">Sing or play a note to see its pitch in real-time</p>
      </div>
      
      {/* Volume Indicator */}
      {isRecording && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Input Level</span>
            <span className="text-sm text-gray-600">{volumeLevel.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-100"
              style={{ width: `${volumeLevel}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <div className="text-center mb-8">
        <button
          onClick={isRecording ? stopDetection : startDetection}
          disabled={isInitializing}
          className={`
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
            } 
            ${isInitializing ? 'opacity-50 cursor-not-allowed' : ''} 
            text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100
          `}
        >
          {isInitializing ? (
            <div className="flex items-center justify-center space-x-3 min-w-[200px]">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span>Starting...</span>
            </div>
          ) : isRecording ? (
            <div className="flex items-center justify-center space-x-3 min-w-[200px]">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span>Stop Detection</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3 min-w-[200px]">
              <span className="text-xl">🎤</span>
              <span>Start Detection</span>
            </div>
          )}
        </button>
        
        <p className="text-gray-500 mt-3 text-sm">
          {isRecording 
            ? 'Sing or play a sustained note into your microphone' 
            : 'Click start and allow microphone access'}
        </p>
      </div>

      {currentNote && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center shadow-lg">
            <div className="text-6xl font-bold mb-2">{currentNote.fullName}</div>
            <div className="text-xl opacity-90 mb-2">
              {currentNote.frequency.toFixed(1)} Hz
            </div>
            {Math.abs(currentNote.cents) > 5 && (
              <div className={`text-lg ${
                Math.abs(currentNote.cents) > 30 ? 'text-red-200' : 'text-yellow-200'
              }`}>
                {currentNote.cents > 0 ? '+' : ''}{currentNote.cents} cents
                <span className="text-sm ml-2">
                  ({currentNote.cents > 0 ? 'sharp' : 'flat'})
                </span>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4 text-center">Note Reference</h3>
            <div className="grid grid-cols-6 gap-2">
              {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(note => (
                <div
                  key={note}
                  className={`p-2 rounded text-center transition-all duration-200 text-sm ${
                    currentNote.name === note 
                      ? 'bg-blue-500 text-white shadow-lg scale-105 font-bold' 
                      : 'bg-white text-gray-700 shadow'
                  } ${note.includes('#') ? 'bg-purple-100 text-purple-700' : ''}`}
                >
                  {note}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isRecording && !currentNote && !error && (
        <div className="text-center py-8">
          <div className="animate-pulse text-gray-500">
            <div className="flex justify-center space-x-1 mb-4">
              {[0, 1, 2, 3, 4].map(i => (
                <div 
                  key={i}
                  className="w-2 h-8 bg-gray-300 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
            <p className="text-lg mb-2">Listening for audio...</p>
            <p className="text-sm text-gray-400">
              Try singing a clear, sustained note like "Ah" or "Oo"
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
          <span className="text-lg mr-2">💡</span>
          Tips for Best Results
        </h4>
        <ul className="text-blue-700 text-sm space-y-2">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span><strong>Use Chrome</strong> for best Web Audio API support</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span><strong>Allow microphone access</strong> when prompted</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span><strong>Sing clear, sustained notes</strong> rather than speaking</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span><strong>Position microphone 6-12 inches</strong> from your mouth</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span><strong>Use a quiet environment</strong> with minimal background noise</span>
          </li>
        </ul>
      </div>

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && currentNote && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <details className="text-xs">
            <summary className="cursor-pointer">Debug Info</summary>
            <div className="mt-2 space-y-1">
              <div>Note: {currentNote.fullName}</div>
              <div>Frequency: {currentNote.frequency.toFixed(2)} Hz</div>
              <div>Cents: {currentNote.cents}</div>
              <div>Volume: {volumeLevel.toFixed(0)}%</div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}