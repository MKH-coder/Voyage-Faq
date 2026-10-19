import React from 'react';
import { Search, Sparkles, ShieldCheck, HelpCircle, MapPin } from 'lucide-react';
import heroImg from '../assets/images/albania_riviera_ksamil_1792430595700.jpg';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  onAskClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onAskClick,
}) => {
  const quickSearches = [
    'Albanian Lek (ALL)',
    'Private Driver & Car',
    'eSIM vs Airport SIM',
    'Type C / F Plugs',
    'Emergency Numbers (112)',
    'Mosque & Church Dress',
    'Public Transport',
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white">
      {/* Background Image of Albanian Riviera Ksamil with High-Contrast Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImg}
          alt="Scenic view of the Albanian Riviera in Ksamil and Sarandë with turquoise waters"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-40 filter brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14">
        
        {/* Subtle Editorial Kicker */}
        <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold mb-3">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>Voyage · Official Albania Tour & Travel Advisory</span>
          <span aria-hidden="true">·</span>
          <span>Verified Traveler Guide & Live AI Insights</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight mb-4" style={{ textWrap: 'balance' }}>
          Discover Albania with Confidence. Every Question Answered.
        </h1>

        <p className="text-base sm:text-lg text-slate-200 max-w-2xl mb-8 leading-relaxed">
          Official guidance on Albanian Lek, private transport & drivers, eSIM connectivity, plugs, and customs. Leave reviews on answers or ask our AI engine to auto-synthesize new travel inquiries directly into the database.
        </p>

        {/* Search Bar Container */}
        <div className="max-w-2xl bg-white p-2 rounded-xl shadow-2xl flex flex-col sm:flex-row items-stretch gap-2 mb-6 text-slate-900">
          <div className="flex-1 flex items-center px-3 gap-3">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search Albania FAQs (e.g. currency, electrical plugs, SIM card, emergency)..."
              className="w-full py-2.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSearchSubmit(searchQuery)}
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Search</span>
            </button>
            <button
              onClick={onAskClick}
              title="Ask AI Travel Engine"
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <span className="text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Popular Topics:
          </span>
          {quickSearches.map((item) => (
            <button
              key={item}
              onClick={() => {
                setSearchQuery(item);
                onSearchSubmit(item);
              }}
              className="px-2.5 py-1 bg-white/15 hover:bg-white/25 text-slate-200 rounded-md transition-colors cursor-pointer text-xs"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Quantitative Proof Strip */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-slate-300">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">100%</div>
            <div className="text-xs text-slate-400 mt-1">Tour operator verified</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">24 / 7</div>
            <div className="text-xs text-slate-400 mt-1">Emergency concierge hotline</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">99.1%</div>
            <div className="text-xs text-slate-400 mt-1">Traveler satisfaction rating</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 flex items-center gap-1.5 tabular-nums">
              <Sparkles className="w-5 h-5 text-amber-400" />
              AI Powered
            </div>
            <div className="text-xs text-slate-400 mt-1">Auto-synthesizes traveler queries</div>
          </div>
        </div>

      </div>
    </section>
  );
};
