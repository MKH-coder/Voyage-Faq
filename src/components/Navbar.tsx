import React from 'react';
import { Compass, Sparkles, MessageSquareHeart, HelpCircle, BookOpen } from 'lucide-react';

interface NavbarProps {
  activeTab: 'faqs' | 'ask' | 'reviews' | 'insights';
  setActiveTab: (tab: 'faqs' | 'ask' | 'reviews' | 'insights') => void;
  onOpenAskModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAskModal }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single wordmark brand element */}
        <div 
          onClick={() => setActiveTab('faqs')}
          className="flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 group"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
            <Compass className="w-5 h-5 text-amber-100" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            WanderWise
          </span>
        </div>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('faqs')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'faqs' ? 'text-amber-700 font-semibold border-b-2 border-amber-600' : 'hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Travel FAQs</span>
          </button>

          <button
            onClick={() => setActiveTab('ask')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ask' ? 'text-amber-700 font-semibold border-b-2 border-amber-600' : 'hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Ask Travel AI</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reviews' ? 'text-amber-700 font-semibold border-b-2 border-amber-600' : 'hover:text-slate-900'
            }`}
          >
            <MessageSquareHeart className="w-4 h-4" />
            <span>Traveler Reviews</span>
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'insights' ? 'text-amber-700 font-semibold border-b-2 border-amber-600' : 'hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>AI Insights Engine</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAskModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ask a Question</span>
          </button>
        </div>

      </div>
    </header>
  );
};
