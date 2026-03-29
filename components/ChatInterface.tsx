
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User as UserIcon, Sparkles } from 'lucide-react';
import { Document, ChatMessage } from '../types';
import { generateChatResponse } from '../services/gemini';
import { saveChatMessage, getChatHistory } from '../services/storage';

interface ChatInterfaceProps {
  document: Document;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ document }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load history
    const load = async () => {
      const history = await getChatHistory(document.id);
      setMessages(history);
    };
    load();
  }, [document.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input.trim(),
      timestamp: Date.now()
    };

    // Optimistic update
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    // Note: We don't await save here to keep UI snappy, but we catch errors if needed
    saveChatMessage(document.id, userMsg).catch(console.error);
    
    setInput('');
    setIsLoading(true);

    try {
      const apiHistory = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await generateChatResponse(document, apiHistory, userMsg.text);

      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMsg]);
      await saveChatMessage(document.id, botMsg);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: "I'm having a little trouble thinking right now. Try again?",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-60 animate-fade-in">
            <div className="w-20 h-20 bg-white rounded-3xl rotate-6 flex items-center justify-center mb-6 shadow-lg animate-float">
              <Sparkles size={40} className="text-rose-400" />
            </div>
            <p className="font-bold text-gray-500 text-lg">Ask me anything about <br/> <span className="text-rose-500">"{document.title}"</span></p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-slide-up`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm
                ${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-white text-rose-500 border border-rose-100'}
              `}>
                {msg.role === 'user' ? <UserIcon size={20} /> : <Sparkles size={20} />}
              </div>
              
              <div className={`
                max-w-[80%] p-5 rounded-2xl text-base leading-relaxed shadow-sm relative group transition-all duration-300 hover:shadow-md
                ${msg.role === 'user' 
                  ? 'bg-gray-900 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border border-white/60 rounded-tl-none'}
              `}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-4 animate-slide-up">
            <div className="w-10 h-10 rounded-xl bg-white text-rose-500 border border-rose-100 flex items-center justify-center flex-shrink-0 shadow-sm">
               <Sparkles size={20} className="animate-spin" />
            </div>
            <div className="bg-white/80 p-5 rounded-2xl rounded-tl-none border border-white/50 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 lg:p-6 bg-white/60 backdrop-blur-md border-t border-white/50">
        <form 
          onSubmit={handleSend}
          className="relative max-w-4xl mx-auto flex items-center gap-2 bg-white p-2 rounded-3xl shadow-xl shadow-rose-100/50 border border-rose-50 transition-all focus-within:ring-4 focus-within:ring-rose-100 focus-within:border-rose-300"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-transparent px-6 py-3 outline-none text-gray-700 font-bold placeholder:text-gray-400 placeholder:font-medium"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-rose-500 disabled:opacity-50 disabled:hover:bg-gray-900 transition-all duration-300 shadow-md hover:scale-105 active:scale-95"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
