"use client";
import React, { useState, useEffect } from "react";
import { NOTES } from "../../lib/audioUtils";
import IdentifyPitchStep from "../../components/IdentifyPitchStep";
import ProducePitchStep from "../../components/ProducePitchStep";
import { RiArrowLeftSLine } from "react-icons/ri";

const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

type QuestionType = "identify" | "produce";

interface Question {
  id: number;
  type: QuestionType;
  note: (typeof NOTES)[0];
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState({ streak: 5, score: 0 }); // Starting streak 5 per image
  const [isFinished, setIsFinished] = useState(false);

  // Initialize 24 Questions (12 of each)
  useEffect(() => {
    const identifyQs = NOTES.map((note, i) => ({
      id: i,
      type: "identify" as QuestionType,
      note,
    }));

    const produceQs = NOTES.map((note, i) => ({
      id: i + 12,
      type: "produce" as QuestionType,
      note,
    }));

    const allQuestions = shuffleArray([...identifyQs, ...produceQs]);
    setQuestions(allQuestions);
  }, []);

  const handleAnswer = (isCorrect: boolean) => {
    // Update Streak
    setStats((prev) => ({
      streak: isCorrect ? prev.streak + 1 : 0,
      score: isCorrect ? prev.score + 50 : prev.score,
    }));

    // Move to next question after small delay is handled by child
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (questions.length === 0)
    return (
      <div className=" my-8 text-white flex items-center justify-center">
        Loading...
      </div>
    );

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center text-white p-4">
        <h1 className="text-4xl font-bold mb-4">Quiz Complete! 🎉</h1>
        <p className="text-xl text-gray-400">Final Score: {stats.score}</p>
        <p className="text-xl text-gray-400">Best Streak: {stats.streak}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 bg-green-500 text-black px-8 py-3 rounded-full font-bold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="text-white font-sans selection:bg-green-500 selection:text-black">
      <div className="max-w-md mx-auto p-4">
        <h1 className="font-bold text-lg text-center">
          {currentQ.type === "identify" ? "Identify Pitch" : "Produce Pitch"}
        </h1>

        <div className="flex justify-between items-center mb-2 text-sm text-gray-400 font-medium">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-1 px-3 py-1 bg-[#1A2C26] rounded-full border border-[#2A4C46]">
            <span className="text-green-500">🔥</span>
            <span className="text-green-500 uppercase text-xs font-bold tracking-wider">
              Streak: {stats.streak}
            </span>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="h-2 w-full bg-[#1A2C26] rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-500 ease-out"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          ></div>
        </div>

        <div
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          key={currentIndex}
        >
          {currentQ.type === "identify" ? (
            <IdentifyPitchStep
              targetNote={currentQ.note}
              onComplete={handleAnswer}
            />
          ) : (
            <ProducePitchStep
              targetNote={currentQ.note}
              onComplete={handleAnswer}
            />
          )}
        </div>
      </div>
    </div>
  );
}
