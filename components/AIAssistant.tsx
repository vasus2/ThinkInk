import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { createChatSession, sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, User, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAssistantProps {
  contextText: string;
  isOpen: boolean;
  onToggle: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ contextText, isOpen, onToggle }) => {
  const [session, setSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize or reset chat when context changes
    if (contextText) {
      const newSession = createChatSession(contextText);
      setSession(newSession);
      setMessages([
        {
          id: 'intro',
          role: 'model',
          text: "Hi! I've analyzed your note. What would you like to know? I can summarize it, explain difficult concepts, or create a quiz for you.",
          timestamp: Date.now(),
        },
      ]);
    }
  }, [contextText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !session) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await sendMessageToGemini(session, userMsg.text);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, modelMsg]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
      return (
        <button 
            onClick={onToggle}
            className="absolute right-6 bottom-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl transition-all transform hover:scale-105 z-50 flex items-center gap-2"
        >
            <Sparkles size={24} />
            <span className="font-medium">Ask AI</span>
        </button>
      )
  }

  return (
    <div className="w-full md:w-1/3 bg-white border-l border-slate-200 flex flex-col h-full shadow-xl z-40 absolute md:relative right-0 top-0">
      {/* Header */}
      <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 bg-slate-50/50 backdrop-blur">
        <div className="flex items-center gap-2 text-indigo-900 font-semibold">
          <Sparkles size={18} className="text-indigo-600" />
          AI Assistant
        </div>
        <button 
            onClick={onToggle}
            className="p-2 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"
        >
            <ChevronRight size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-indigo-100'}`}>
              {msg.role === 'user' ? <User size={16} className="text-slate-600" /> : <Bot size={16} className="text-indigo-600" />}
            </div>
            
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-white text-slate-800 rounded-tr-none border border-slate-100' 
                : 'bg-indigo-600 text-white rounded-tl-none'
            }`}>
                {msg.role === 'model' ? (
                    <div className="markdown-prose prose-invert">
                         <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                ) : (
                    msg.text
                )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
               <Bot size={16} className="text-indigo-600" />
             </div>
             <div className="bg-indigo-600 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-inner">
          <input
            type="text"
            className="flex-1 bg-transparent border-none focus:outline-none text-sm py-1"
            placeholder="Ask about your note..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['Summarize this', 'Explain key points', 'Create a quiz'].map(suggestion => (
                <button 
                    key={suggestion}
                    onClick={() => {
                        setInput(suggestion);
                        // Optional: auto-send
                    }}
                    className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full whitespace-nowrap transition-colors"
                >
                    {suggestion}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};