import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { playCorrectSound, playIncorrectSound } from '../services/soundService';

interface QuizViewProps {
  questions: QuizQuestion[];
  onQuizEnd: () => void;
  onHighlightCountry: (name: string) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, onQuizEnd, onHighlightCountry }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      playCorrectSound();
      setScore(prev => prev + 1);
      onHighlightCountry(currentQuestion.geoJsonName);
    } else {
      playIncorrectSound();
    }

    const timer = setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setIsFinished(true);
      }
    }, 2500); // Wait 2.5 seconds before next question or finish

    return () => clearTimeout(timer);
  }, [selectedAnswer, currentQuestion, currentQuestionIndex, questions.length, onHighlightCountry]);

  const handleAnswerClick = (answer: string) => {
    if (selectedAnswer) return; // Prevent multiple clicks
    setSelectedAnswer(answer);
  };
  
  const getButtonClass = (option: string) => {
    if (!selectedAnswer) {
      return 'bg-sky-600 hover:bg-sky-500';
    }
    
    const isCorrect = option === currentQuestion.correctAnswer;
    const isSelected = option === selectedAnswer;

    if (isCorrect) {
      return 'bg-emerald-500 scale-105 ring-4 ring-white/50'; // Correct answer is always highlighted green
    }
    if (isSelected && !isCorrect) {
      return 'bg-red-500'; // Selected wrong answer is red
    }
    
    return 'bg-slate-700 opacity-60'; // Other wrong answers are greyed out
  };
  
  const getResultMessage = () => {
    const percentage = score / questions.length;
    if (percentage === 1) return "¡Perfecto! ¡Eres un maestro de la geografía!";
    if (percentage >= 0.7) return "¡Increíble! Sabes muchísimo del mundo.";
    if (percentage >= 0.4) return "¡Buen trabajo! Sigue explorando.";
    return "¡No te preocupes! Cada viaje comienza con un primer paso.";
  };

  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center animate-in fade-in">
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 text-white p-8 rounded-3xl shadow-2xl border-4 border-sky-400 w-full max-w-md text-center">
          <h2 className="text-5xl font-extrabold text-amber-300 drop-shadow-lg">¡Juego Terminado!</h2>
          <p className="text-2xl mt-4">Tu puntuación es:</p>
          <p className="text-7xl font-bold my-4">{score} <span className="text-4xl text-slate-300">/ {questions.length}</span></p>
          <p className="text-xl italic text-sky-200 mb-8">{getResultMessage()}</p>
          <button
            onClick={onQuizEnd}
            className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-4 px-6 rounded-2xl text-2xl transition-transform active:scale-95 shadow-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-2xl text-center">
        <div className="bg-black/20 text-white px-6 py-2 rounded-full inline-block mb-6 border border-white/20">
            <p className="text-xl font-bold">Pregunta {currentQuestionIndex + 1} de {questions.length}</p>
        </div>
        <div className="text-9xl mb-4 transform transition-transform duration-500" key={currentQuestionIndex}>
            {currentQuestion.flag}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 drop-shadow-md">
            ¿A qué país pertenece esta bandera?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswerClick(option)}
              disabled={!!selectedAnswer}
              className={`w-full p-4 rounded-2xl text-2xl font-bold text-white shadow-xl transition-all duration-300 ease-in-out transform disabled:cursor-not-allowed ${getButtonClass(option)}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizView;
