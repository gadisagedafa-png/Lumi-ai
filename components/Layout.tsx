
import React from 'react';
import { BookOpen, MessageCircle, PenTool, Trophy, LogOut, Menu, X, Plus, Layers } from 'lucide-react';
import { User, AppView } from '../types';
import LumiLogo from './LumiLogo';

interface LayoutProps {
  user: User;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  children: React.ReactNode;
  onUploadClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  user, 
  currentView, 
  onNavigate, 
  onLogout, 
  children,
  onUploadClick
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { view: AppView.DASHBOARD, icon: BookOpen, label: 'Library' },
    { view: AppView.CHAT, icon: MessageCircle, label: 'Chat' },
    { view: AppView.NOTES, icon: PenTool, label: 'Notes' },
    { view: AppView.FLASHCARDS, icon: Layers, label: 'Flashcards' },
    { view: AppView.QUIZ, icon: Trophy, label: 'Quiz' },
  ];

  return (
    <div className="min-h-screen flex bg-[#fdf6f6] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-rose-200/40 rounded-full blur-[100px] pointer-events-none animate-blob"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px] pointer-events-none animate-blob [animation-delay:2s]"></div>
      <div className="fixed top-[40%] left-[30%] w-[400px] h-[400px] bg-purple-200/30 rounded-full blur-[100px] pointer-events-none animate-blob [animation-delay:4s]"></div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 glass-panel border-b-0 z-30 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-3">
           <LumiLogo className="h-8 w-auto" />
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white rounded-full shadow-sm text-gray-600 active:scale-95 transition-transform">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar (Desktop: Floating Glass Panel) */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-20 w-72 lg:w-80 p-4 lg:p-6 transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) lg:transform-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full glass-panel rounded-[2.5rem] flex flex-col p-6 shadow-xl shadow-rose-100/50 relative overflow-hidden animate-slide-up">
          {/* Decorative Gradient inside Sidebar */}
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/50 to-transparent pointer-events-none"></div>

          <div className="mb-8 px-2 mt-4 group cursor-pointer text-center">
             <LumiLogo className="h-16 w-auto mx-auto transition-transform duration-300 group-hover:scale-105" />
          </div>

          <button 
              onClick={onUploadClick}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-4 px-6 rounded-2xl shadow-lg shadow-gray-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 font-bold mb-8 group btn-bounce"
            >
              <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform duration-300">
                <Plus size={18} className="text-white" />
              </div>
              <span>New Upload</span>
          </button>

          <nav className="space-y-2 flex-1">
            {navItems.map((item, idx) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => {
                    onNavigate(item.view);
                    setIsMobileMenuOpen(false);
                  }}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className={`
                    w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-lg btn-bounce animate-slide-up opacity-0
                    ${isActive 
                      ? 'bg-rose-100 text-rose-600 shadow-inner translate-x-1' 
                      : 'text-gray-500 hover:bg-white hover:text-gray-800 hover:shadow-sm hover:translate-x-1'}
                  `}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={`${isActive ? 'animate-bounce' : ''}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-4 p-2 bg-white/50 rounded-2xl border border-white/60 hover:bg-white/80 transition-colors cursor-default">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold text-lg shadow-md transform hover:rotate-6 transition-transform">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                <p className="text-xs font-semibold text-gray-400 truncate">Pro Plan</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all btn-bounce"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-auto pt-24 lg:pt-6 px-4 lg:pr-6 pb-6 relative z-10 custom-scrollbar">
        <div className="h-full rounded-[2.5rem] overflow-hidden">
          {children}
        </div>
      </main>
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-10 lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
