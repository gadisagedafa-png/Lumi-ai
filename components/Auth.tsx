
import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import LumiLogo from './LumiLogo';

interface AuthProps {
  onLogin: (email: string, name: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network delay for effect
    setTimeout(() => {
      onLogin(email, name || email.split('@')[0]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#fff0f3]">
      {/* Animated Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-yellow-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob [animation-delay:2s]"></div>

      <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2.5rem] shadow-2xl shadow-rose-100/50 w-full max-w-md p-10 relative z-10 animate-pop-in">
        <div className="text-center mb-10">
          <div className="relative inline-block">
             <LumiLogo className="h-24 w-auto mx-auto mb-6 animate-float" />
             <div className="absolute -bottom-2 -right-4 bg-white p-2.5 rounded-full shadow-lg animate-bounce">
                <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />
             </div>
          </div>
          <h1 className="text-4xl font-black text-gray-800 mb-2 animate-slide-up">
            {isLogin ? 'Welcome Back!' : 'Join Lumi'}
          </h1>
          <p className="text-gray-500 font-medium animate-slide-up [animation-delay:100ms]">
            {isLogin ? 'Ready to continue learning?' : 'Your study bestie awaits.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up [animation-delay:200ms]">
          {!isLogin && (
            <div className="group">
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white border border-gray-100 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-gray-700 placeholder:text-gray-400 shadow-sm group-hover:shadow-md"
                required
              />
            </div>
          )}
          
          <div className="group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-white border border-gray-100 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-gray-700 placeholder:text-gray-400 shadow-sm group-hover:shadow-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl shadow-xl shadow-gray-200 transition-all font-bold text-lg mt-6 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? 'Login' : 'Create Account'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center animate-slide-up [animation-delay:300ms]">
          <p className="text-gray-500 font-medium">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
