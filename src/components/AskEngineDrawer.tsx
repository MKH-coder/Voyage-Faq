import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  ArrowRight, 
  HelpCircle, 
  RefreshCw, 
  Lightbulb, 
  BookmarkCheck,
  X
} from 'lucide-react';
import { FAQItem } from '../types.js';

interface AskEngineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onFAQCreated: (newFaq: FAQItem) => void;
  onSelectExistingFaq: (faqId: string) => void;
}

export const AskEngineDrawer: React.FC<AskEngineDrawerProps> = ({
  isOpen,
  onClose,
  onFAQCreated,
  onSelectExistingFaq,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    answer: string;
    category: string;
    summary: string;
    wasAutoAddedAsFaq: boolean;
    newFaq?: FAQItem;
    existingMatches?: FAQItem[];
  } | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const exampleQuestions = [
    'Is tap water safe to drink in Albania?',
    'Can I fly a drone over Ksamil or Berat castle?',
    'What is the tipping etiquette in Albanian restaurants?',
    'Do US or UK passport holders need a visa for Albania?',
    'What traditional Albanian dishes should I try?',
  ];

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim()) return;
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/queries/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: questionText.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to query AI travel engine');
      }

      const data = await response.json();
      setResult(data);

      if (data.wasAutoAddedAsFaq && data.newFaq) {
        onFAQCreated(data.newFaq);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to reach the AI Insights Engine. Please check your connection or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(query);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Ask the AI Travel Insights Engine
              </h3>
              <p className="text-xs text-slate-500">
                Live travel answers · Auto-adds emerging questions into the official FAQ database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Query Input Form */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask any question about your Albania trip (e.g. tap water, tipping, visas, drone permits)..."
                className="w-full px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Ask AI</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Example Suggestions */}
          {!result && !isLoading && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Frequently Asked Inquiries to Try:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {exampleQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setQuery(q);
                      handleAsk(q);
                    }}
                    className="text-xs text-slate-700 bg-slate-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-200 border border-slate-200/80 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Loading Animation State */}
          {isLoading && (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 animate-pulse">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Synthesizing Verified Travel Insights...
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Evaluating regulatory sources, tourist guidelines, and cluster frequency to determine if this inquiry should be automatically archived into the FAQ database.
              </p>
            </div>
          )}

          {/* AI Result Box */}
          {result && !isLoading && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Auto-Addition Badge notification */}
              {result.wasAutoAddedAsFaq && result.newFaq ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-emerald-900">
                      ✨ Auto-Added to Official FAQ Database!
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                      Our AI Insights Engine recognized this inquiry as high-value for future Albania travelers. It has been saved into the database as a new permanent FAQ.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectExistingFaq(result.newFaq!.id);
                      }}
                      className="mt-2 text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Jump to New FAQ Entry</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <BookmarkCheck className="w-4 h-4 text-amber-600" />
                    <span>Inquiry Logged & Monitored for Emerging Query Trends</span>
                  </div>
                  <span className="text-slate-400">Database Record Created</span>
                </div>
              )}

              {/* Verified Answer Content */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Verified Travel Expert Guidance
                </div>
                
                <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-line">
                  {result.answer}
                </div>
              </div>

              {/* Existing Related Matches if found */}
              {result.existingMatches && result.existingMatches.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Related Existing Albania FAQs:</span>
                  </div>
                  <div className="space-y-1.5">
                    {result.existingMatches.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectExistingFaq(m.id);
                        }}
                        className="w-full text-left p-2.5 bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-200 rounded-lg text-xs font-medium text-slate-800 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <span className="truncate">{m.question}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reset or Ask Another */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setQuery('');
                  }}
                  className="text-xs font-semibold text-amber-700 hover:underline cursor-pointer"
                >
                  Ask Another Question
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
