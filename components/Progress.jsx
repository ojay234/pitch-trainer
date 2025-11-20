'use client';
import { useMemo } from 'react';

export default function Progress({ stats }) {
  const accuracy = useMemo(() => 
    stats.total > 0 ? (stats.correct / stats.total) * 100 : 0, 
    [stats.correct, stats.total]
  );

  const getAccuracyColor = (acc) => {
    if (acc >= 90) return 'from-green-500 to-emerald-600';
    if (acc >= 70) return 'from-yellow-500 to-amber-600';
    if (acc >= 50) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-600';
  };

  const getStreakColor = (streak) => {
    if (streak >= 10) return 'from-purple-500 to-pink-600';
    if (streak >= 5) return 'from-blue-500 to-purple-600';
    return 'from-gray-500 to-blue-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Progress</h2>
      
      <div className="space-y-6">
        {/* Accuracy */}
        <div className="text-center">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600 font-medium">Accuracy</span>
            <span className="font-bold text-lg">{accuracy.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-4 rounded-full bg-gradient-to-r ${getAccuracyColor(accuracy)} transition-all duration-1000 ease-out`}
              style={{ width: `${accuracy}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="text-3xl font-bold text-blue-700">{stats.correct}</div>
            <div className="text-sm text-blue-600 font-medium">Correct</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-3xl font-bold text-gray-700">{stats.total}</div>
            <div className="text-sm text-gray-600 font-medium">Total Attempts</div>
          </div>
        </div>

        {/* Streaks */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`text-center p-4 rounded-xl bg-gradient-to-br ${getStreakColor(stats.streak)} text-white`}>
            <div className="text-3xl font-bold">{stats.streak}</div>
            <div className="text-sm opacity-90">Current Streak</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="text-3xl font-bold text-purple-700">{stats.bestStreak}</div>
            <div className="text-sm text-purple-600 font-medium">Best Streak</div>
          </div>
        </div>

        {/* Tips */}
        {stats.total > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="text-lg mr-2">💡</span>
              Improvement Tips
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Practice daily for consistent progress</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Focus on one octave at a time</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Use reference notes to calibrate your ear</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}