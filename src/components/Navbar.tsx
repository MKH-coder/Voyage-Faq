import React from 'react';
import { Compass, Sparkles, MessageSquareHeart, HelpCircle, BookOpen } from 'lucide-react';

interface NavbarProps {
  activeTab: 'faqs' | 'ask' | 'reviews' | 'insights' | '3d-explorer';
  setActiveTab: (tab: 'faqs' | 'ask' | 'reviews' | 'insights' | '3d-explorer') => void;
  onOpenAskModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAskModal }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single wordmark brand element with FAQ logo */}
        <div 
          onClick={() => setActiveTab('faqs')}
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group"
        >
          {/* FAQ Logo Badge */}
          <div className="h-9 px-2.5 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 border border-amber-600/40">
            <span className="font-black text-xs tracking-widest text-white">FAQ</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Voyage
          </span>
        </div>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('3d-explorer')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === '3d-explorer' ? 'text-amber-700 font-semibold border-b-2 border-amber-600' : 'hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-600" />
            <span className="flex items-center gap-1">
              <span>3D Tour Diorama</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">3D</span>
            </span>
          </button>

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
