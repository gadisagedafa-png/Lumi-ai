
import React, { useState, useEffect } from 'react';
import { Layers, Sparkles, RefreshCw, ChevronLeft, ChevronRight, RotateCw, Plus } from 'lucide-react';
import { Document, FlashcardSet } from '../types';
import { generateFlashcards } from '../services/gemini';
import { saveFlashcardSet, getFlashcardSetsByDocumentId } from '../services/storage';

interface FlashcardGeneratorProps {
  document: Document;
}

const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({ document }) => {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [activeSet, setActiveSet] = useState<FlashcardSet | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Card Game State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const load = async () => {
      const saved = await getFlashcardSetsByDocumentId(document.id);
      setSets(saved);
      if (saved.length > 0) setActiveSet(saved[0]);
    };
    load();
  }, [document.id]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [activeSet]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    const interval = setInterval(() => setProgress(p => Math.min(p + 10, 90)), 200);

    try {
      const newSet = await generateFlashcards(document);
      clearInterval(interval);
      setProgress(100);
      await new Promise(r => setTimeout(r, 500));
      
      await saveFlashcardSet(newSet);
      setSets(prev => [newSet, ...prev]);
      setActiveSet(newSet);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to generate flashcards.");
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const nextCard = () => {
    if (!activeSet) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSet.cards.length);
    }, 200);
  };

  const prevCard = () => {
    if (!activeSet) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + activeSet.cards.length) % activeSet.cards.length);
    }, 200);
  };

  return (
    <div className="h-full flex gap-6 relative">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-4 animate-slide-up">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-white hover:bg-gray-50 text-gray-800 py-4 px-6 rounded-2xl shadow-lg border border-white/60 transition-all font-bold group flex flex-col items-center justify-center min-h-[80px] hover:scale-[1.02] active:scale-95"
        >
          {isGenerating ? (
            <div className="flex flex-col items-center w-full">
               <div className="flex items-center gap-2 text-rose-500 mb-2">
                 <RefreshCw className="animate-spin" size={18} />
                 <span className="text-xs font-black uppercase tracking-widest">Brewing...</span>
               </div>
               <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-rose-400 transition-all duration-300" style={{width: `${progress}%`}}></div>
               </div>
            </div>
          ) : (
             <div className="flex items-center gap-2">
                <Layers className="text-purple-400" />
                <span>New Flashcards</span>
             </div>
          )}
        </button>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {sets.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <Layers className="w-12 h-12 mx-auto mb-2" />
              <p className="font-bold text-sm">No decks yet</p>
            </div>
          ) : (
            sets.map((set, idx) => (
              <button
                key={set.id}
                onClick={() => setActiveSet(set)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 animate-slide-up ${
                  activeSet?.id === set.id
                    ? 'bg-white border-purple-200 shadow-md scale-[1.02] active:scale-[0.98]'
                    : 'bg-white/40 border-transparent hover:bg-white hover:shadow-md hover:scale-[1.02] active:scale-95'
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{set.cards.length} Cards</span>
                </div>
                <p className="font-bold text-sm text-gray-800 truncate">{set.title}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 bg-[#fffdf0] rounded-[2.5rem] shadow-xl border border-[#f0e6d2] flex flex-col relative overflow-hidden animate-scale-in">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" 
             style={{backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

        {!activeSet ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-fade-in">
             <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg animate-float">
                <Layers size={40} className="text-purple-400" />
             </div>
             <p className="font-hand text-2xl text-gray-600">Generate a deck to start flipping!</p>
          </div>
        ) : (
          <div className="flex flex-col h-full items-center justify-center p-8 z-10">
            {/* Header / Progress */}
            <div className="absolute top-8 w-full px-12 flex justify-between items-center">
              <h2 className="font-bold text-gray-800 text-lg opacity-60 truncate max-w-md">{activeSet.title}</h2>
              <div className="bg-white/80 backdrop-blur px-4 py-1 rounded-full border border-gray-200 font-mono text-sm font-bold text-gray-600 shadow-sm">
                 {currentIndex + 1} / {activeSet.cards.length}
              </div>
            </div>

            {/* Card Container */}
            <div className="relative w-full max-w-2xl aspect-[3/2] perspective-1000 group">
              <div 
                className={`w-full h-full relative transition-all duration-700 preserve-3d cursor-pointer hover:scale-[1.01] ${isFlipped ? 'rotate-y-180' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                 {/* Front */}
                 <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-2xl border border-white/60 flex flex-col items-center justify-center p-12 text-center hover:shadow-purple-100/50 transition-shadow">
                    <span className="absolute top-6 left-6 text-xs font-black text-purple-400 uppercase tracking-widest">Question</span>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                       {activeSet.cards[currentIndex].front}
                    </h3>
                    <div className="absolute bottom-6 text-gray-400 text-sm font-bold flex items-center gap-2 animate-pulse">
                       <RotateCw size={14} /> Click to flip
                    </div>
                 </div>

                 {/* Back */}
                 <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-12 text-center">
                    <span className="absolute top-6 left-6 text-xs font-black text-purple-300 uppercase tracking-widest">Answer</span>
                    <p className="text-xl md:text-2xl font-medium leading-relaxed">
                       {activeSet.cards[currentIndex].back}
                    </p>
                 </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-10 flex items-center gap-6">
               <button 
                 onClick={prevCard}
                 className="p-4 bg-white rounded-full text-gray-600 hover:text-gray-900 shadow-lg hover:scale-110 active:scale-95 transition-all"
               >
                 <ChevronLeft size={24} />
               </button>
               
               <button 
                 onClick={() => setIsFlipped(!isFlipped)}
                 className="px-8 py-3 bg-purple-100 text-purple-600 rounded-xl font-bold hover:bg-purple-200 transition-colors"
               >
                 Flip Card
               </button>

               <button 
                 onClick={nextCard}
                 className="p-4 bg-white rounded-full text-gray-600 hover:text-gray-900 shadow-lg hover:scale-110 active:scale-95 transition-all"
               >
                 <ChevronRight size={24} />
               </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default FlashcardGenerator;
