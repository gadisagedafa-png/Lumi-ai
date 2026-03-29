
import React from 'react';
import { Sparkles, ArrowRight, Zap, BookOpen, BrainCircuit, Star, MapPin, Code, Heart } from 'lucide-react';
import LumiLogo from './LumiLogo';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fff0f3]">
      {/* Abstract Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob [animation-delay:2s]"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob [animation-delay:4s]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center">
           <LumiLogo className="h-10 w-auto" />
        </div>
        <button 
          onClick={onGetStarted}
          className="bg-white/50 backdrop-blur-md border border-white/60 text-gray-800 px-6 py-2 rounded-full font-bold hover:bg-white transition-all shadow-sm hover:shadow-md"
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/50 px-4 py-2 rounded-full mb-8 animate-float">
          <Star className="text-yellow-400 fill-yellow-400" size={16} />
          <span className="text-sm font-bold text-gray-600 tracking-wide uppercase">The cutest AI study buddy</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 leading-[0.9] tracking-tight">
          Study smarter,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600">not harder.</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          Upload your messy PDFs and let Lumi turn them into beautiful notes, quizzes, and magical insights.
        </p>

        <button 
          onClick={onGetStarted}
          className="group relative inline-flex items-center justify-center gap-3 bg-gray-900 text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-gray-800 hover:scale-105 transition-all duration-300 shadow-xl shadow-gray-200"
        >
          Start Learning Now
          <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform">
             <ArrowRight size={20} />
          </div>
        </button>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-24 text-left mb-32">
          {[
            {
              icon: BrainCircuit,
              color: "bg-blue-100 text-blue-600",
              title: "Deep Understanding",
              desc: "Lumi reads your docs and explains complex topics simply."
            },
            {
              icon: BookOpen,
              color: "bg-rose-100 text-rose-600",
              title: "Aesthetic Notes",
              desc: "Generates beautiful, structured markdown notes automatically."
            },
            {
              icon: Zap,
              color: "bg-yellow-100 text-yellow-600",
              title: "Instant Quizzes",
              desc: "Test your knowledge with AI-generated quizzes in seconds."
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white/60 backdrop-blur-md border border-white/50 p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl hover:shadow-rose-100/50">
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                <feature.icon size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Meet the Developer Section */}
        <div className="relative max-w-4xl mx-auto mb-24">
           <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/50 px-4 py-2 rounded-full mb-8">
              <Code className="text-violet-500" size={16} />
              <span className="text-sm font-bold text-gray-600 tracking-wide uppercase">Meet the Creator</span>
           </div>
           
           <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group hover:bg-white/50 transition-colors duration-500">
              {/* Decor */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-200 to-fuchsia-200 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                 {/* Avatar Placeholder */}
                 <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 flex items-center justify-center shadow-xl flex-shrink-0 border-4 border-white relative">
                    <span className="text-4xl font-black text-white">GG</span>
                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md">
                       <Heart className="text-rose-500 fill-rose-500" size={20} />
                    </div>
                 </div>
                 
                 <div className="text-left">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Gadisa Gedafa Ayana</h2>
                    <p className="text-violet-600 font-bold text-lg mb-4 flex items-center gap-2">
                       <span>15-Year-Old Full Stack Innovator</span>
                    </p>
                    
                    <p className="text-gray-600 leading-relaxed font-medium mb-6">
                       Hailing from the beautiful landscapes of <span className="text-gray-900 font-bold">Wolega, Guduru (Oromia, Ethiopia)</span>, Gadisa is a young tech prodigy passionate about transforming education through AI. 
                       At just 15, he architected Lumi to help students worldwide unlock their potential.
                    </p>
                    
                    <div className="flex flex-wrap gap-3">
                       <span className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-gray-500 shadow-sm flex items-center gap-2 border border-gray-100">
                         <MapPin size={14} className="text-red-500" /> Ethiopia
                       </span>
                       <span className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-gray-500 shadow-sm border border-gray-100">🚀 Next.js Expert</span>
                       <span className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-gray-500 shadow-sm border border-gray-100">🤖 AI Architect</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="text-gray-400 font-bold text-sm">
           &copy; {new Date().getFullYear()} Lumi AI. Built with ❤️ by Gadisa Gedafa.
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
