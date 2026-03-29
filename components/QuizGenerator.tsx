
import React, { useState, useEffect } from 'react';
import { Play, HelpCircle, Check, X, RefreshCw, Trophy, Star, ChevronRight, Zap } from 'lucide-react';
import { Document, Quiz } from '../types';
import { generateQuiz } from '../services/gemini';
import { saveQuiz, getQuizzesByDocumentId } from '../services/storage';

interface QuizGeneratorProps {
  document: Document;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ document }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Quiz Taking State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const load = async () => {
      const saved = await getQuizzesByDocumentId(document.id);
      setQuizzes(saved);
    };
    load();
  }, [document.id]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        // Quizzes generate faster usually, so faster increment
        return prev + Math.floor(Math.random() * 5) + 2;
      });
    }, 300);

    try {
      const newQuiz = await generateQuiz(document, difficulty);
      
      clearInterval(interval);
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await saveQuiz(newQuiz);
      setQuizzes(prev => [newQuiz, ...prev]);
      startQuiz(newQuiz);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to generate quiz. Check API Key.");
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    if (index === activeQuiz?.questions[currentQuestionIndex].correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  return (
    <div className="h-full flex gap-6">
       {/* Sidebar */}
       <div className="w-72 flex-shrink-0 flex flex-col gap-4 animate-slide-up">
         <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-lg">
           <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Difficulty Level</label>
           <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
              {['easy', 'medium', 'hard'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d as any)}
                  className={`flex-1 py-2 text-xs font-bold capitalize rounded-lg transition-all ${difficulty === d ? 'bg-white text-gray-800 shadow-sm transform scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {d}
                </button>
              ))}
           </div>
           
           <button
             onClick={handleGenerate}
             disabled={isGenerating}
             className="w-full flex flex-col justify-center min-h-[60px] bg-gray-900 hover:bg-gray-800 text-white px-4 rounded-xl transition-all text-sm font-bold shadow-md hover:scale-[1.02] active:scale-95 disabled:opacity-100 disabled:cursor-wait relative overflow-hidden"
           >
             {isGenerating ? (
               <div className="w-full relative z-10 py-3">
                 <div className="flex justify-between items-center mb-2 text-[10px] font-black uppercase tracking-widest text-blue-300">
                    <span className="flex items-center gap-1"><RefreshCw size={10} className="animate-spin" /> Cooking</span>
                    <span>{progress}%</span>
                 </div>
                 <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-400 transition-all duration-300 ease-out" 
                      style={{ width: `${progress}%` }}
                    ></div>
                 </div>
               </div>
             ) : (
               <div className="flex items-center justify-center gap-2 py-3">
                  <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                  New Quiz
               </div>
             )}
           </button>
         </div>

         <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {quizzes.length === 0 ? (
               <div className="text-center py-8 opacity-50 animate-fade-in">
                  <Trophy className="w-10 h-10 mx-auto mb-2" />
                  <p className="font-bold text-sm">No quizzes yet</p>
               </div>
            ) : (
              quizzes.map((quiz, idx) => (
                <button
                  key={quiz.id}
                  onClick={() => startQuiz(quiz)}
                  style={{ animationDelay: `${idx * 100}ms` }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 animate-slide-up ${
                    activeQuiz?.id === quiz.id
                      ? 'bg-white border-blue-200 shadow-md shadow-blue-100 scale-[1.02]'
                      : 'bg-white/40 border-transparent hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <p className="text-sm font-bold text-gray-800 truncate">{quiz.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-md">{quiz.questions.length} Qs</span>
                  </div>
                </button>
              ))
            )}
         </div>
       </div>

       {/* Quiz Area */}
       <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/60 flex flex-col overflow-hidden relative animate-scale-in">
         {!activeQuiz ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-fade-in">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg animate-float-delayed">
                <Trophy size={48} className="text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-2xl font-black text-gray-700">Ready to play?</p>
              <p className="font-medium text-gray-500">Generate a quiz to test your brain!</p>
            </div>
         ) : quizCompleted ? (
           <div className="flex flex-col items-center justify-center h-full p-8 animate-pop-in">
             <div className="relative mb-8">
               <div className="absolute inset-0 bg-yellow-200 blur-2xl opacity-50 rounded-full animate-pulse"></div>
               <div className="w-32 h-32 bg-gradient-to-br from-yellow-300 to-orange-400 text-white rounded-3xl rotate-6 flex items-center justify-center shadow-2xl relative z-10 animate-bounce">
                 <Trophy size={64} fill="currentColor" />
               </div>
             </div>
             
             <h2 className="text-4xl font-black text-gray-900 mb-2">Epic Job!</h2>
             <p className="text-xl font-medium text-gray-500 mb-8">You scored <span className="text-gray-900 font-bold">{score}</span> / {activeQuiz.questions.length}</p>
             
             <div className="w-full max-w-sm bg-gray-100 rounded-full h-6 mb-10 p-1">
               <div 
                 className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-1000 shadow-sm relative" 
                 style={{ width: `${(score / activeQuiz.questions.length) * 100}%` }}
               >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full mr-1 animate-ping"></div>
               </div>
             </div>

             <button 
               onClick={() => startQuiz(activeQuiz)}
               className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-200 transition-all hover:scale-105 active:scale-95"
             >
               Play Again
             </button>
           </div>
         ) : (
           <div key={currentQuestionIndex} className="flex flex-col h-full animate-fade-in">
              {/* Header */}
              <div className="p-8 pb-4 flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</span>
                    <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 transition-all duration-500 ease-out" style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100 animate-pulse">
                     <Star size={16} className="text-yellow-400 fill-yellow-400" />
                     <span className="font-bold text-yellow-700 text-sm">{score} pts</span>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto px-8 pb-8 max-w-4xl mx-auto w-full">
                 <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-10 leading-snug animate-slide-up">
                   {activeQuiz.questions[currentQuestionIndex].question}
                 </h2>

                 <div className="grid gap-4">
                   {activeQuiz.questions[currentQuestionIndex].options.map((option, idx) => {
                     const isSelected = selectedAnswer === idx;
                     const isCorrect = idx === activeQuiz.questions[currentQuestionIndex].correctAnswerIndex;
                     const showCorrectness = selectedAnswer !== null;

                     let btnClass = "bg-white border-2 border-gray-100 hover:border-blue-300 hover:bg-blue-50/30 hover:scale-[1.01]";
                     let icon = <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex-shrink-0" />;

                     if (showCorrectness) {
                       if (isCorrect) {
                         btnClass = "bg-green-50 border-green-400 text-green-800 ring-2 ring-green-100 scale-[1.01]";
                         icon = <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center animate-pop-in"><Check size={14} strokeWidth={3} /></div>;
                       }
                       else if (isSelected && !isCorrect) {
                         btnClass = "bg-red-50 border-red-400 text-red-800 opacity-60";
                         icon = <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center animate-pop-in"><X size={14} strokeWidth={3} /></div>;
                       }
                       else btnClass = "bg-gray-50 border-transparent opacity-40";
                     } else if (isSelected) {
                       btnClass = "bg-blue-50 border-blue-500 text-blue-700 ring-4 ring-blue-100";
                       icon = <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>;
                     }

                     return (
                       <button
                         key={idx}
                         onClick={() => handleAnswerSelect(idx)}
                         disabled={selectedAnswer !== null}
                         className={`w-full text-left p-5 rounded-2xl transition-all duration-200 flex items-center justify-between group shadow-sm animate-slide-up ${btnClass}`}
                         style={{ animationDelay: `${idx * 100}ms` }}
                       >
                         <span className="font-bold text-lg">{option}</span>
                         {icon}
                       </button>
                     );
                   })}
                 </div>

                 {showExplanation && (
                   <div className="mt-8 p-6 bg-blue-50/80 rounded-3xl border border-blue-200 animate-slide-up">
                     <div className="flex items-start gap-4">
                       <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                         <HelpCircle size={24} />
                       </div>
                       <div>
                         <h4 className="font-bold text-blue-900 mb-1 text-lg">Did you know?</h4>
                         <p className="text-blue-800/80 leading-relaxed font-medium">
                           {activeQuiz.questions[currentQuestionIndex].explanation}
                         </p>
                       </div>
                     </div>
                   </div>
                 )}
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end bg-white/50 backdrop-blur-sm">
                <button
                  onClick={nextQuestion}
                  disabled={selectedAnswer === null}
                  className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold shadow-lg shadow-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:-translate-y-1 active:scale-95"
                >
                  {currentQuestionIndex === activeQuiz.questions.length - 1 ? 'See Results' : 'Next'}
                  <ChevronRight size={20} />
                </button>
              </div>
           </div>
         )}
       </div>
    </div>
  );
};

export default QuizGenerator;
