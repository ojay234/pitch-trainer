'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePitchDetection, NOTES, useAudioPlayer } from '../lib/audioUtils';

export default function PitchQuiz({ onAnswer }) {
  const [targetNote, setTargetNote] = useState(null);
  const [userNote, setUserNote] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  
  const pitchDetectorRef = useRef(null);
  const { createPitchDetector } = usePitchDetection();
  const { playNote } = useAudioPlayer();

  // Generate a random target note
  const generateTargetNote = useCallback(() => {
    const randomNote = NOTES[Math.floor(Math.random() * NOTES.length)];
    setTargetNote(randomNote);
    setUserNote(null);
    setShowResult(false);
    setError(null);
  }, []);

  useEffect(() => {
    generateTargetNote();
  }, [generateTargetNote]);

  const handleNoteDetected = useCallback((note, frequency) => {
    if (note) {
      setUserNote(note);
      // Calculate volume level for visualization (0-100)
      const level = Math.min(100, Math.max(0, (frequency - 50) / 10));
      setVolumeLevel(level);
    } else {
      setUserNote(null);
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
    setUserNote(null);
    setVolumeLevel(0);
    setShowResult(false);

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
    setUserNote(null);
    setVolumeLevel(0);
    setError(null);
  }, []);

  const checkAnswer = useCallback(() => {
    if (!userNote || !targetNote) {
      setError('No note detected. Please try singing again.');
      return;
    }

    stopDetection();
    setShowResult(true);

    const correct = userNote.name === targetNote.name;
    setIsCorrect(correct);

    // Update score
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));

    // Call parent callback if provided
    if (onAnswer) {
      onAnswer(correct);
    }

    // Move to next question after delay
    setTimeout(() => {
      generateTargetNote();
    }, 3000);
  }, [userNote, targetNote, stopDetection, generateTargetNote, onAnswer]);

  // Auto-check answer when user hits the right note
  useEffect(() => {
    if (userNote && targetNote && userNote.name === targetNote.name && isRecording) {
      const timeout = setTimeout(() => {
        checkAnswer();
      }, 1000); // Wait 1 second to confirm stable pitch
      return () => clearTimeout(timeout);
    }
  }, [userNote, targetNote, isRecording, checkAnswer]);

  // Play target note for reference
  const playTargetNote = useCallback(() => {
    if (targetNote) {
      playNote(targetNote.frequency, 3000);
    }
  }, [targetNote, playNote]);

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
      setUserNote({
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

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Pitch Matching Quiz</h2>
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
      <div className="text-center mb-2">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Pitch Matching Quiz</h2>
        <p className="text-gray-600">Sing or hum the target note as accurately as possible</p>
      </div>

      {/* Score Display */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center space-x-4 bg-gray-50 rounded-lg px-4 py-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{score.correct}/{score.total}</div>
            <div className="text-xs text-gray-600">Correct</div>
          </div>
          <div className="h-8 w-px bg-gray-300"></div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getAccuracyColor(accuracy)}`}>
              {accuracy}%
            </div>
            <div className="text-xs text-gray-600">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Target Note Display */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
          <p className="text-gray-600 mb-3 text-lg">Target Note:</p>
          <div className="text-6xl font-bold text-blue-700 mb-2">
            {targetNote?.name}
            <span className="text-4xl text-blue-500 ml-2">{targetNote?.octave}</span>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            Frequency: {targetNote?.frequency.toFixed(1)} Hz
          </p>
          <button
            onClick={playTargetNote}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            🔊 Play Reference Note
          </button>
        </div>
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
          onClick={isRecording ? checkAnswer : startDetection}
          disabled={isInitializing}
          className={`
            ${isRecording 
              ? 'bg-orange-500 hover:bg-orange-600' 
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
              <span>✓ Check Answer</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3 min-w-[200px]">
              <span className="text-xl">🎤</span>
              <span>Start Singing</span>
            </div>
          )}
        </button>
        
        <p className="text-gray-500 mt-3 text-sm">
          {isRecording 
            ? 'Sing the target note into your microphone' 
            : 'Click start and allow microphone access'}
        </p>

        {isRecording && (
          <button
            onClick={stopDetection}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Stop Recording
          </button>
        )}
      </div>

      {/* User's Note Display */}
      {userNote && isRecording && (
        <div className="text-center mb-6">
          <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-300">
            <p className="text-gray-600 mb-2">Your Note:</p>
            <div className="text-4xl font-bold text-gray-800 mb-1">
              {userNote.name}
              <span className="text-2xl text-gray-600 ml-2">{userNote.octave}</span>
            </div>
            <div className="text-sm text-gray-500">
              {userNote.frequency.toFixed(1)} Hz • 
              {userNote.cents > 0 ? '+' : ''}{userNote.cents} cents
            </div>
          </div>
        </div>
      )}

      {/* Result Display */}
      {showResult && (
        <div className={`text-center p-6 rounded-xl border-2 mb-6 transition-all duration-300 ${
          isCorrect 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="text-4xl mb-3">
            {isCorrect ? '🎉' : '💡'}
          </div>
          <h3 className={`text-2xl font-bold mb-2 ${
            isCorrect ? 'text-green-700' : 'text-red-700'
          }`}>
            {isCorrect ? 'Perfect Pitch! 🎵' : 'Almost There!'}
          </h3>
          <p className={`text-lg ${
            isCorrect ? 'text-green-600' : 'text-red-600'
          }`}>
            {isCorrect 
              ? `You correctly sang ${targetNote.name}!` 
              : `You sang ${userNote?.name}, but the target was ${targetNote.name}`}
          </p>
          {!isCorrect && userNote && (
            <div className="mt-3 text-sm text-gray-600">
              You were {Math.abs(userNote.cents)} cents {userNote.cents > 0 ? 'sharp' : 'flat'}
            </div>
          )}
        </div>
      )}

      {isRecording && !userNote && !error && (
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

      {/* Note Reference */}
      {/* <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-lg mb-4 text-center">Note Reference</h3>
        <div className="grid grid-cols-6 gap-2">
          {NOTES.map(note => (
            <div
              key={note.name}
              className={`p-3 rounded text-center transition-all duration-200 font-semibold ${
                targetNote?.name === note.name 
                  ? 'bg-blue-500 text-white shadow-lg scale-105' 
                  : showResult && userNote?.name === note.name
                  ? isCorrect ? 'bg-green-300' : 'bg-red-300'
                  : 'bg-white text-gray-700 shadow'
              } ${note.name.includes('#') ? 'border border-purple-300' : ''}`}
            >
              {note.name}
            </div>
          ))}
        </div>
        <div className="text-center mt-3 text-sm text-gray-500">
          Blue = Target Note • {isCorrect ? 'Green' : 'Red'} = Your Note
        </div>
      </div> */}

      {/* Tips */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
          <span className="text-lg mr-2">💡</span>
          Pitch Matching Tips
        </h4>
        <ul className="text-blue-700 text-sm space-y-2">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span><strong>Listen to the reference note</strong> multiple times before singing</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span><strong>Use a clear, sustained tone</strong> - avoid sliding between notes</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span><strong>Match the vowel sound</strong> that helps you hit the pitch</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span><strong>Watch the cents display</strong> to fine-tune your pitch accuracy</span>
          </li>
        </ul>
      </div>

      {/* Skip Button */}
      <div className="text-center mt-6">
        <button
          onClick={generateTargetNote}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Skip This Note
        </button>
      </div>
    </div>
  );
}