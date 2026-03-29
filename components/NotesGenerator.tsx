
import React, { useState, useEffect, useRef } from 'react';
import { FileText, Sparkles, RefreshCw, Copy, Check, Star, Gamepad2, Youtube, X, Play, Minimize2, Maximize2, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Document, Note } from '../types';
import { generateStudyNotes } from '../services/gemini';
import { saveNote, getNotesByDocumentId } from '../services/storage';

// --- SUB-COMPONENTS FOR GAMES & ENTERTAINMENT ---

// 1. MEMORY GAME
const MemoryGame = () => {
  const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
  const [cards, setCards] = useState<{id: number, emoji: string, flipped: boolean, matched: boolean}[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, flipped: false, matched: false }));
    setCards(shuffled);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    const cardIndex = cards.findIndex(c => c.id === id);
    if (cards[cardIndex].flipped || cards[cardIndex].matched) return;

    const newCards = [...cards];
    newCards[cardIndex].flipped = true;
    setCards(newCards);
    
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const card1 = newCards.find(c => c.id === newFlipped[0]);
      const card2 = newCards.find(c => c.id === newFlipped[1]);
      
      if (card1?.emoji === card2?.emoji) {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            newFlipped.includes(c.id) ? { ...c, matched: true } : c
          ));
          setFlippedCards([]);
          setMatches(m => m + 1);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            newFlipped.includes(c.id) ? { ...c, flipped: false } : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center animate-fade-in w-full h-full justify-center">
      <div className="flex justify-between w-full max-w-sm mb-4 px-2 items-center">
        <div className="text-gray-600 font-bold text-sm">Matches: {matches}/8</div>
        <button onClick={resetGame} className="text-xs bg-rose-100 hover:bg-rose-200 text-rose-600 px-3 py-1 rounded-full font-bold transition-colors">Restart</button>
      </div>
      <div className="grid grid-cols-4 gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`w-14 h-14 sm:w-16 sm:h-16 text-3xl flex items-center justify-center rounded-xl transition-all duration-500 transform perspective-1000 ${
              card.flipped || card.matched 
                ? 'bg-gradient-to-br from-rose-100 to-orange-100 rotate-y-180 scale-105' 
                : 'bg-gray-800 rotate-y-0 hover:bg-gray-700'
            }`}
          >
            <span className={`transition-opacity duration-300 ${(card.flipped || card.matched) ? 'opacity-100' : 'opacity-0'}`}>
              {card.emoji}
            </span>
            {!(card.flipped || card.matched) && <span className="text-gray-500 text-lg opacity-50">?</span>}
          </button>
        ))}
      </div>
      {matches === 8 && (
        <div className="mt-6 text-center animate-bounce">
          <p className="text-xl font-black text-gray-800">You Won! 🎉</p>
          <p className="text-sm text-gray-500">In {moves} moves</p>
        </div>
      )}
    </div>
  );
};

// 2. BUBBLE POP GAME
const BubblePopGame = () => {
  const [bubbles, setBubbles] = useState<{id: number, x: number, y: number, color: string, size: number}[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (bubbles.length < 12) {
        setBubbles(prev => [
          ...prev, 
          { 
            id: Date.now(), 
            x: Math.random() * 80 + 10, 
            y: 110, 
            color: ['#fda4af', '#93c5fd', '#86efac', '#fde047', '#c4b5fd'][Math.floor(Math.random() * 5)],
            size: Math.random() * 30 + 30
          }
        ]);
      }
    }, 600);

    const moveInterval = setInterval(() => {
      setBubbles(prev => prev.map(b => ({...b, y: b.y - 1.5})).filter(b => b.y > -20));
    }, 50);

    return () => { clearInterval(spawnInterval); clearInterval(moveInterval); };
  }, [bubbles.length]);

  const popBubble = (id: number) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setScore(s => s + 1);
  };

  return (
    <div className="w-full h-[400px] bg-gradient-to-b from-blue-50 to-white rounded-3xl relative overflow-hidden border border-blue-100 shadow-inner cursor-crosshair">
       <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-4 py-2 rounded-xl font-black text-blue-500 text-xl z-10 shadow-sm border border-blue-100">
         Score: {score}
       </div>
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <Star size={100} />
       </div>
       {bubbles.map(b => (
         <button
           key={b.id}
           onClick={() => popBubble(b.id)}
           style={{ left: `${b.x}%`, top: `${b.y}%`, backgroundColor: b.color, width: b.size, height: b.size }}
           className="absolute rounded-full shadow-lg border-2 border-white/50 active:scale-150 transition-transform duration-100 flex items-center justify-center hover:brightness-110"
         >
           <div className="w-1/3 h-1/3 bg-white/40 rounded-full absolute top-2 left-2"></div>
         </button>
       ))}
       <div className="absolute bottom-4 left-0 w-full text-center text-blue-300 text-sm font-bold pointer-events-none uppercase tracking-widest">
         Pop the bubbles!
       </div>
    </div>
  );
};

// 3. VIDEO PLAYER
const VideoPlayer = () => {
  // Safe, fun, distracting videos. Using embed URL format.
  const videos = [
    { id: '5dsGWM5XGdg', title: 'Kinetic Sand' },
    { id: 'qC_IM1yB630', title: 'Lofi Girl' },
    { id: 'j5a0jTc9S10', title: 'Funny Cats' }, 
  ];
  const [activeVideo, setActiveVideo] = useState(0);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
       <div className="w-full relative pt-[56.25%] bg-black rounded-2xl overflow-hidden shadow-xl mb-6 ring-4 ring-gray-100">
         <iframe 
           className="absolute top-0 left-0 w-full h-full"
           src={`https://www.youtube.com/embed/${videos[activeVideo].id}?autoplay=1`} 
           title="Entertainment"
           frameBorder="0" 
           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
           allowFullScreen
         />
       </div>
       <div className="flex gap-3 overflow-x-auto pb-2 w-full justify-center">
         {videos.map((v, idx) => (
           <button 
             key={v.id} 
             onClick={() => setActiveVideo(idx)}
             className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all transform hover:scale-105 ${activeVideo === idx ? 'bg-gray-900 text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
           >
             {v.title}
           </button>
         ))}
       </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

interface NotesGeneratorProps {
  document: Document;
}

const NotesGenerator: React.FC<NotesGeneratorProps> = ({ document }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Ref for PDF generation
  const notesContentRef = useRef<HTMLDivElement>(null);

  // Entertainment State
  const [showEntertainment, setShowEntertainment] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [activeEntertainment, setActiveEntertainment] = useState<'none' | 'memory' | 'bubble' | 'video'>('none');

  useEffect(() => {
    const load = async () => {
      const savedNotes = await getNotesByDocumentId(document.id);
      setNotes(savedNotes);
      if (savedNotes.length > 0) {
        setActiveNote(savedNotes[0]);
      }
    };
    load();
  }, [document.id]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setShowEntertainment(true); // Open modal immediately
    setMinimized(false);
    setActiveEntertainment('none'); // Start at menu
    
    // We use a local variable to clear the interval properly in the finally block
    // or we can use a ref. Since we are in an async function, local let is fine.
    let intervalId: any = null;
    
    intervalId = setInterval(() => {
      setProgress(prev => {
        // Cap strictly at 95% until true completion
        if (prev >= 95) return 95;
        
        // Dynamic increment: starts fast, slows down significantly as it approaches 95%
        let increment = 0;
        if (prev < 20) increment = 3;
        else if (prev < 50) increment = 1;
        else if (prev < 80) increment = 0.5;
        else increment = 0.1; // Very slow crawl for the last mile
        
        return Math.min(prev + increment, 95);
      });
    }, 400);

    try {
      const newNote = await generateStudyNotes(document);
      
      // Generation successful!
      if (intervalId) clearInterval(intervalId);
      setProgress(100);
      
      // Small delay to let user see 100%
      await new Promise(resolve => setTimeout(resolve, 600));
      
      await saveNote(newNote);
      setNotes(prev => [newNote, ...prev]);
      setActiveNote(newNote);
      setShowEntertainment(false); // Close entertainment
      setActiveEntertainment('none');
    } catch (error: any) {
      console.error(error);
      setShowEntertainment(false); // Close modal on error
      alert(error.message || "Failed to generate notes. Please check API key.");
    } finally {
      if (intervalId) clearInterval(intervalId);
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const copyToClipboard = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(activeNote.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPdf = () => {
    if (!activeNote || !notesContentRef.current) return;
    setIsDownloading(true);

    const element = notesContentRef.current;
    
    // We clone the element to modify styles slightly for print (e.g. removing scroll, ensuring bg)
    // Actually html2pdf takes the element as is. The wrapper div has bg-[#fffdf0] so it should be fine.
    
    const opt = {
      margin: [10, 10, 10, 10], // top, left, bottom, right
      filename: `Lumi-Notes-${activeNote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#fffdf0', // Ensure paper color background
        logging: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Use window.html2pdf provided by the script tag
    // @ts-ignore
    if (typeof window.html2pdf !== 'undefined') {
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save().then(() => {
        setIsDownloading(false);
      }).catch((err: any) => {
        console.error("PDF generation failed", err);
        setIsDownloading(false);
        alert("Sorry, could not generate PDF. Please try again.");
      });
    } else {
      console.error("html2pdf library not loaded");
      alert("PDF library not loaded. Please refresh the page.");
      setIsDownloading(false);
    }
  };

  return (
    <div className="h-full flex gap-6 relative">
      {/* Waiting Room / Entertainment Modal */}
      {showEntertainment && !minimized && (
        <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#fdfbf7] rounded-[2.5rem] shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden relative border border-white/50 flex flex-col animate-scale-in">
             
             {/* Header */}
             <div className="p-6 pb-2 flex justify-between items-start bg-white border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center animate-spin-slow">
                     <RefreshCw className="text-rose-500 animate-spin" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-800">
                       {progress > 90 ? "Finalizing notes..." : "Analyzing document & generating notes..."}
                    </h2>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-wide">
                      {Math.floor(progress)}% Complete
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setMinimized(true)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors" title="Minimize">
                    <Minimize2 size={20} />
                  </button>
                </div>
             </div>
             
             {/* Progress Bar Line */}
             <div className="w-full h-1.5 bg-gray-100">
                <div className="h-full bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 transition-all duration-300" style={{width: `${Math.min(progress, 100)}%`}}></div>
             </div>

             {/* Entertainment Content */}
             <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f8f9fa]">
                {activeEntertainment === 'none' ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="mb-8">
                      <h3 className="text-3xl font-black text-gray-800 mb-3">While you wait...</h3>
                      <p className="text-gray-500 font-medium text-lg">
                        Creating deep, comprehensive notes takes a bit of time (up to a minute or two depending on document size). <br/>
                        Why not relax with a game or watch a video while we do the heavy lifting?
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                       <button onClick={() => setActiveEntertainment('memory')} className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all border border-gray-100 group text-center flex flex-col items-center">
                          <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner"><Gamepad2 size={32} /></div>
                          <h3 className="font-bold text-xl text-gray-800">Memory Match</h3>
                          <p className="text-sm text-gray-500 mt-2 font-medium">Test your recall</p>
                       </button>
                       <button onClick={() => setActiveEntertainment('bubble')} className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all border border-gray-100 group text-center flex flex-col items-center">
                          <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner"><Star size={32} /></div>
                          <h3 className="font-bold text-xl text-gray-800">Bubble Pop</h3>
                          <p className="text-sm text-gray-500 mt-2 font-medium">Stress relief</p>
                       </button>
                       <button onClick={() => setActiveEntertainment('video')} className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all border border-gray-100 group text-center flex flex-col items-center">
                          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner"><Youtube size={32} /></div>
                          <h3 className="font-bold text-xl text-gray-800">Chill Zone</h3>
                          <p className="text-sm text-gray-500 mt-2 font-medium">Watch clips</p>
                       </button>
                    </div>
                  </div>
                ) : (
                   <div className="h-full flex flex-col">
                      <button 
                        onClick={() => setActiveEntertainment('none')}
                        className="self-start mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold transition-colors px-4 py-2 bg-white rounded-full shadow-sm"
                      >
                         <X size={16} /> Back to Menu
                      </button>
                      
                      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center justify-center relative overflow-hidden">
                          {activeEntertainment === 'memory' && <MemoryGame />}
                          {activeEntertainment === 'bubble' && <BubblePopGame />}
                          {activeEntertainment === 'video' && <VideoPlayer />}
                      </div>
                   </div>
                )}
             </div>
          </div>
        </div>
      )}
      
      {/* Minimized Progress Indicator */}
      {showEntertainment && minimized && (
        <div className="fixed bottom-6 right-6 z-[100] bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 w-80 animate-slide-up flex flex-col gap-3">
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <RefreshCw className="text-rose-500 animate-spin" size={16} />
                 <span className="font-bold text-gray-800 text-sm">
                    {progress > 90 ? "Almost ready..." : "Generating notes (this may take a minute)..."}
                 </span>
              </div>
              <button onClick={() => setMinimized(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                 <Maximize2 size={16} />
              </button>
           </div>
           <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
               <div className="h-full bg-rose-500 transition-all duration-300" style={{width: `${Math.min(progress, 100)}%`}}></div>
           </div>
        </div>
      )}

      {/* Sidebar List */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-4 animate-slide-up">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full relative overflow-hidden bg-white hover:bg-gray-50 text-gray-800 py-4 px-6 rounded-2xl shadow-lg shadow-gray-100 border border-white/60 transition-all font-bold disabled:opacity-100 disabled:cursor-wait group hover:scale-[1.02] active:scale-95 flex flex-col justify-center min-h-[80px]`}
        >
            <div className="flex items-center justify-center gap-3">
               <Sparkles size={20} className="text-yellow-400 fill-yellow-400 group-hover:rotate-12 transition-transform" />
               <span>Create Deep Notes</span>
            </div>
        </button>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {notes.length === 0 ? (
            <div className="text-center py-10 opacity-50 animate-fade-in">
                <FileText className="w-12 h-12 mx-auto mb-2" />
                <p className="font-bold text-sm">No notes found</p>
            </div>
          ) : (
            notes.map((note, idx) => (
              <button
                key={note.id}
                onClick={() => setActiveNote(note)}
                style={{ animationDelay: `${idx * 100}ms` }}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group animate-slide-up ${
                  activeNote?.id === note.id
                    ? 'bg-white border-rose-200 shadow-md shadow-rose-100 scale-[1.02] active:scale-[0.98]'
                    : 'bg-white/40 border-transparent hover:bg-white hover:shadow-md hover:scale-[1.02] active:scale-95'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className={`p-2 rounded-lg transition-colors ${activeNote?.id === note.id ? 'bg-rose-100 text-rose-500' : 'bg-gray-100 text-gray-400'}`}>
                      <FileText size={16} />
                  </div>
                  <span className="font-bold text-xs text-gray-400 uppercase tracking-wide">{new Date(note.createdAt).toLocaleDateString()}</span>
                </div>
                <p className={`font-bold text-sm truncate transition-colors ${activeNote?.id === note.id ? 'text-gray-800' : 'text-gray-600'}`}>{note.title}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content (Paper Look) */}
      <div className="flex-1 bg-[#fffdf0] rounded-[2rem] shadow-xl shadow-gray-200/50 flex flex-col overflow-hidden relative border border-[#f0e6d2] animate-scale-in">
        {/* Paper Texture Decor */}
        <div className="absolute top-0 left-0 w-full h-8 bg-repeat-x opacity-20 z-10" style={{backgroundImage: 'linear-gradient(135deg, #000 5%, transparent 5%), linear-gradient(-135deg, #000 5%, transparent 5%)', backgroundSize: '10px 10px'}}></div>

        {activeNote ? (
          <>
            <div className="px-8 py-6 border-b border-[#e6dec8] flex items-center justify-between bg-[#fffef5] z-20 relative">
              <h2 className="font-hand text-3xl font-bold text-gray-800 truncate animate-fade-in">{activeNote.title}</h2>
              <div className="flex gap-2">
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-all hover:scale-105 active:scale-95 px-4 py-2 rounded-full hover:bg-[#f0e6d2]"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button 
                  onClick={downloadPdf}
                  disabled={isDownloading}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-gray-900 hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 px-4 py-2 rounded-full shadow-md"
                >
                  {isDownloading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Download size={16} />
                  )}
                  {isDownloading ? 'Saving...' : 'PDF'}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {/* 
                   Wrapper div for html2pdf to target. 
                   Includes bg color and padding to ensure PDF looks exactly like the view.
                   Min-h-full ensures it fills space but expands for PDF capture.
                */}
                <div ref={notesContentRef} className="p-12 bg-[#fffdf0] min-h-full font-hand text-xl leading-loose text-gray-800 animate-fade-in">
                  <ReactMarkdown 
                    components={{
                       h1: ({node, ...props}) => (
                         <div className="mb-10 text-center relative animate-slide-up">
                            <Star className="absolute top-0 left-0 text-yellow-300 fill-yellow-300 w-8 h-8 -translate-x-full -translate-y-1/2 animate-spin-slow" />
                            <h1 className="font-sans text-5xl font-black text-gray-900 leading-tight" {...props} />
                            <Star className="absolute bottom-0 right-0 text-rose-300 fill-rose-300 w-6 h-6 translate-x-full translate-y-1/2 animate-spin-slow" />
                            <div className="w-24 h-2 bg-rose-200 mx-auto mt-4 rounded-full"></div>
                         </div>
                       ),
                       h2: ({node, ...props}) => (
                         <div className="mt-12 mb-6 animate-slide-up">
                            <h2 className="font-sans text-2xl font-bold text-gray-800 flex items-center gap-3 bg-yellow-100/50 px-4 py-2 rounded-xl border-l-4 border-yellow-400 w-fit transform -rotate-1 hover:rotate-0 transition-transform" {...props} />
                         </div>
                       ),
                       h3: ({node, ...props}) => <h3 className="font-sans text-lg font-bold text-rose-500 mt-8 mb-3 uppercase tracking-wider flex items-center gap-2" {...props} />,
                       p: ({node, ...props}) => <p className="mb-6 leading-loose text-gray-700" {...props} />,
                       ul: ({node, ...props}) => <ul className="list-none pl-2 space-y-4 mb-8" {...props} />,
                       li: ({node, ...props}) => (
                          <li className="flex gap-3 items-start group" {...props}>
                             <span className="text-rose-400 mt-1.5 transform scale-125 group-hover:scale-150 transition-transform">◦</span>
                             <span className="flex-1">{props.children}</span>
                          </li>
                       ),
                       strong: ({node, ...props}) => <span className="font-bold text-gray-900 bg-rose-100/60 px-1 rounded box-decoration-clone" {...props} />,
                       blockquote: ({node, children, ...props}) => (
                         <blockquote className="relative p-6 my-8 bg-[#fff9c4] text-gray-800 shadow-sm rounded-xl transform rotate-1 hover:rotate-0 transition-transform border border-yellow-200 duration-500" {...props}>
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-yellow-200/50 opacity-50 rotate-[-2deg]"></div>
                            <span className="block font-bold text-xs uppercase tracking-widest text-yellow-600 mb-2">Definition / Note</span>
                            <div className="italic font-medium">
                                {children}
                            </div>
                         </blockquote>
                       ),
                       code: ({node, ...props}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-rose-500 font-bold" {...props} />
                    }}
                  >
                    {activeNote.content}
                  </ReactMarkdown>
                </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 animate-fade-in">
            <div className="w-20 h-20 bg-[#f7f3e8] rounded-full flex items-center justify-center mb-6 animate-float">
              <FileText size={40} className="opacity-50" />
            </div>
            <p className="font-hand text-2xl">Pick a note to read!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesGenerator;
