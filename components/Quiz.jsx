'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAudioPlayer, NOTES } from '../lib/audioUtils';

export default function Quiz({ onAnswer }) {
  const [currentNote, setCurrentNote] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const { playNote } = useAudioPlayer();

  const generateQuestion = useCallback(() => {
    const correctNote = NOTES[Math.floor(Math.random() * NOTES.length)];
    const otherNotes = NOTES
      .filter(note => note.name !== correctNote.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [correctNote, ...otherNotes]
      .sort(() => Math.random() - 0.5);
    
    setCurrentNote(correctNote);
    setOptions(allOptions);
    setSelectedNote(null);
    setShowResult(false);
  }, []);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const playCurrentNote = useCallback(() => {
    if (!currentNote || isPlaying) return;
    
    setIsPlaying(true);
    playNote(currentNote.frequency, 3000);
    
    setTimeout(() => {
      setIsPlaying(false);
    }, 1500);
  }, [currentNote, isPlaying, playNote]);

  const handleAnswer = useCallback((note) => {
    if (showResult) return;
    
    setSelectedNote(note);
    setShowResult(true);
    
    const isCorrect = note.name === currentNote.name;
    onAnswer(isCorrect);
    
    setTimeout(() => {
      generateQuestion();
    }, 2000);
  }, [showResult, currentNote, onAnswer, generateQuestion]);

  const handleKeyPress = useCallback((event) => {
    if (event.key >= '1' && event.key <= '4' && !showResult) {
      const index = parseInt(event.key) - 1;
      if (options[index]) {
        handleAnswer(options[index]);
      }
    } else if (event.key === ' ') {
      event.preventDefault();
      playCurrentNote();
    }
  }, [showResult, options, handleAnswer, playCurrentNote]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-2">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Note Identification</h2>
        <p className="text-gray-600">Listen carefully and select the correct note</p>
      </div>

      <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <button
          onClick={playCurrentNote}
          disabled={isPlaying}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-blue-300 disabled:to-purple-400 text-white font-bold py-5 px-12 rounded-full text-xl shadow-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
        >
          {isPlaying ? (
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-6 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span>Playing Note...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎵</span>
              <span>Play Note</span>
            </div>
          )}
        </button>
        <p className="text-gray-500 mt-3 text-sm">
          Press Spacebar to play • Press 1-4 to select answer
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {options.map((note, index) => (
          <button
            key={`${note.name}-${index}`}
            onClick={() => handleAnswer(note)}
            disabled={showResult}
            className={`p-6 rounded-xl border-2 text-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
              showResult
                ? note.name === currentNote.name
                  ? 'bg-green-100 border-green-500 text-green-700 shadow-lg scale-105'
                  : selectedNote && note.name === selectedNote.name
                  ? 'bg-red-100 border-red-500 text-red-700'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
                : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{note.name}</span>
              <span className="text-gray-400 text-sm">({index + 1})</span>
            </div>
          </button>
        ))}
      </div>

      {showResult && (
        <div className={`text-center p-6 rounded-xl border-2 transition-all duration-300 ${
          selectedNote.name === currentNote.name 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-center space-x-3 mb-2">
            <span className="text-3xl">
              {selectedNote.name === currentNote.name ? '🎉' : '💡'}
            </span>
            <h3 className="text-2xl font-bold">
              {selectedNote.name === currentNote.name 
                ? 'Perfect! Correct Note!' 
                : 'Not Quite Right'}
            </h3>
          </div>
          <p className="text-lg">
            {selectedNote.name === currentNote.name 
              ? `You correctly identified ${currentNote.name}` 
              : `The correct note was ${currentNote.name}`}
          </p>
        </div>
      )}

      <div className="text-center mt-8">
        <button
          onClick={generateQuestion}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
        >
          Skip Question
        </button>
      </div>
    </div>
  );
}