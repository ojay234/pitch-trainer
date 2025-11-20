'use client';
import { useState } from 'react';
import PitchDetector from '../components/PitchDetector';
import Quiz from '../components/Quiz';
import PitchQuiz from '../components/PitchQuiz';
import KeyFinder from '../components/KeyFinder';
import SoundExplorer from '../components/SoundExplorer';
import Progress from '../components/Progress';


export default function Home() {
  const [currentView, setCurrentView] = useState('quiz');
  const [stats, setStats] = useState({
    correct: 0,
    total: 0,
    streak: 0,
    bestStreak: 0,
  });

  const updateStats = (isCorrect: any) => {
    setStats(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
      };
    });
  };

// In your main page component, update the trainingModes array:
const trainingModes = [
  {
    id: 'soundExplorer',
    title: 'Sound Explorer',
    description: 'Test and learn all note sounds',
    icon: '🔊',
    component: <SoundExplorer />
  },
  {
    id: 'quiz',
    title: 'Note Identification Quiz',
    description: 'Identify played notes',
    icon: '🎵',
    component: <Quiz onAnswer={updateStats} />
  },
  {
    id: 'pitchQuiz',
    title: 'Pitch Matching Quiz',
    description: 'Sing target notes accurately',
    icon: '🎤',
    component: <PitchQuiz onAnswer={updateStats} />
  },
  {
    id: 'detector',
    title: 'Pitch Detector',
    description: 'See what note you\'re singing',
    icon: '🔍',
    component: <PitchDetector />
  },
  {
    id: 'keyFinder',
    title: 'Song Key Finder',
    description: 'Discover the key of any song',
    icon: '🎼',
    component: <KeyFinder />
  }
];

  const getCurrentComponent = () => {
    const mode = trainingModes.find(m => m.id === currentView);
    return mode ? mode.component : null;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Perfect Pitch Trainer
          </h1>
          <p className="text-gray-600 text-lg">
            Develop your perfect pitch through interactive exercises
          </p>
        </header>
        <div className="bg-white rounded-lg shadow-md p-6 my-6">
              <h3 className="text-lg font-semibold mb-4">Training Modes</h3>
              <div className="space-y-3 lg:flex gap-2">
                {trainingModes.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setCurrentView(mode.id)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                      currentView === mode.id 
                        ? 'bg-blue-100 border-2 border-blue-500 shadow-sm' 
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{mode.icon}</span>
                      <div>
                        <div className="font-medium text-slate-900">{mode.title}</div>
                        <div className="text-sm text-gray-600">{mode.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            {getCurrentComponent()}
          </div>
          
          <div className="space-y-6">
            <Progress stats={stats} />

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3">Today's Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Exercises Completed:</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Streak:</span>
                  <span className="font-semibold text-orange-600">{stats.streak}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Best Streak:</span>
                  <span className="font-semibold text-purple-600">{stats.bestStreak}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}