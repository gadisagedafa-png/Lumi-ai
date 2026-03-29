
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import DocumentUpload from './components/DocumentUpload';
import ChatInterface from './components/ChatInterface';
import NotesGenerator from './components/NotesGenerator';
import QuizGenerator from './components/QuizGenerator';
import FlashcardGenerator from './components/FlashcardGenerator';
import { getCurrentUser, loginUser, logoutUser, saveDocument, getDocuments, getDocumentById } from './services/storage';
import { User, AppView, Document } from './types';
import { Cloud, ArrowRight, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const storedUser = getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
        setShowLanding(false);
      }
      await refreshDocuments();
      setIsLoading(false);
    };
    init();
  }, []);

  // Update active document object when ID changes
  useEffect(() => {
    const fetchDoc = async () => {
      if (activeDocumentId) {
        const doc = await getDocumentById(activeDocumentId);
        setActiveDocument(doc || null);
      } else {
        setActiveDocument(null);
      }
    };
    fetchDoc();
  }, [activeDocumentId]);

  const refreshDocuments = async () => {
    const docs = await getDocuments();
    setDocuments(docs);
    if (docs.length > 0 && !activeDocumentId) {
      setActiveDocumentId(docs[0].id);
    }
  };

  const handleLogin = async (email: string, name: string) => {
    const newUser = await loginUser(email, name);
    setUser(newUser);
    setShowLanding(false);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setShowLanding(true);
  };

  const handleUpload = async (file: File) => {
    try {
      const newDoc = await saveDocument(file);
      setDocuments(prev => [...prev, newDoc]);
      setActiveDocumentId(newDoc.id);
      setCurrentView(AppView.NOTES);
    } catch (e) {
      console.error("Upload failed", e);
      alert("Failed to save document. It might be too large.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff0f3]">
         <div className="relative animate-pop-in">
            <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <Sparkles size={20} className="text-rose-500 animate-pulse" />
            </div>
         </div>
      </div>
    );
  }

  // Render Logic
  if (showLanding && !user) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Layout
      user={user}
      currentView={currentView}
      onNavigate={setCurrentView}
      onLogout={handleLogout}
      onUploadClick={() => setIsUploadOpen(true)}
    >
      {/* View Routing with Animations */}
      {currentView === AppView.DASHBOARD && (
        <div key="dashboard" className="p-4 lg:p-10 animate-slide-up">
          <div className="mb-10">
             <div className="inline-block bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/60 mb-4 animate-float">
                <span className="text-sm font-bold text-gray-500">✨ Ready to learn?</span>
             </div>
             <h1 className="text-4xl lg:text-5xl font-black text-gray-800 mb-3 animate-fade-in stagger-1 opacity-0">Hi, {user.name}</h1>
             <p className="text-gray-500 font-medium text-lg animate-fade-in stagger-2 opacity-0">Pick a document to start your session.</p>
          </div>

          {documents.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-md rounded-[3rem] p-16 text-center border-2 border-dashed border-gray-300/60 hover:border-rose-300 transition-all duration-300 group animate-scale-in">
              <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Cloud className="text-rose-400" size={48} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-3">Your library is empty</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto font-medium">Upload your first PDF and watch Lumi turn it into magic study material.</p>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold shadow-xl shadow-rose-100 transition-all hover:-translate-y-1 active:scale-95"
              >
                Upload First PDF
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in stagger-3 opacity-0">
              {documents.map((doc, idx) => (
                <div 
                  key={doc.id} 
                  style={{ animationDelay: `${idx * 100}ms` }}
                  className={`group relative bg-white/70 backdrop-blur-md rounded-[2.5rem] p-8 border transition-all cursor-pointer hover:shadow-xl hover:-translate-y-2 active:scale-[0.98] duration-300 animate-slide-up ${activeDocumentId === doc.id ? 'border-rose-400 ring-4 ring-rose-100 shadow-lg shadow-rose-100' : 'border-white/50 hover:border-rose-200'}`}
                  onClick={() => setActiveDocumentId(doc.id)}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-orange-100 text-rose-500 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-inner">
                      <Cloud size={28} strokeWidth={2.5} />
                    </div>
                    {activeDocumentId === doc.id && (
                      <span className="text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white px-3 py-1 rounded-full shadow-md animate-pop-in">Active</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 truncate mb-2">{doc.title}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-8">Added {new Date(doc.uploadDate).toLocaleDateString()}</p>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveDocumentId(doc.id); setCurrentView(AppView.CHAT); }}
                      className="flex-1 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                      Chat
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveDocumentId(doc.id); setCurrentView(AppView.NOTES); }}
                      className="flex-1 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                      Notes
                    </button>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => setIsUploadOpen(true)}
                className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] p-6 border-2 border-dashed border-gray-300 hover:border-rose-400 hover:bg-rose-50/50 transition-all flex flex-col items-center justify-center text-gray-400 hover:text-rose-500 min-h-[240px] group animate-slide-up hover:scale-[1.02] active:scale-[0.98]"
                style={{ animationDelay: `${documents.length * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-full bg-white border-2 border-current flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  <span className="text-3xl font-light pb-1">+</span>
                </div>
                <span className="font-bold text-lg">Add New</span>
              </button>
            </div>
          )}
        </div>
      )}

      {currentView !== AppView.DASHBOARD && !activeDocument && (
        <div key="empty" className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Cloud size={40} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Nothing selected</h2>
          <p className="text-gray-500 font-medium mb-6">Select a document from the library to start.</p>
          <button 
            onClick={() => setCurrentView(AppView.DASHBOARD)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all hover:scale-105 active:scale-95"
          >
            Go to Library <ArrowRight size={16} />
          </button>
        </div>
      )}

      {activeDocument && (
        <div key={currentView} className="h-full animate-slide-up">
          {currentView === AppView.CHAT && <ChatInterface document={activeDocument} />}
          {currentView === AppView.NOTES && <NotesGenerator document={activeDocument} />}
          {currentView === AppView.QUIZ && <QuizGenerator document={activeDocument} />}
          {currentView === AppView.FLASHCARDS && <FlashcardGenerator document={activeDocument} />}
        </div>
      )}

      {isUploadOpen && (
        <DocumentUpload 
          onUpload={handleUpload} 
          onClose={() => setIsUploadOpen(false)} 
        />
      )}
    </Layout>
  );
};

export default App;
