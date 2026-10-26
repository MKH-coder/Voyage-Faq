import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Car, 
  PhoneCall, 
  ChevronRight,
  Compass,
  RotateCcw
} from 'lucide-react';

import { FAQItem, FAQReview, UserQueryLog, AIInsightsStats } from './types.js';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { CategoryFilter } from './components/CategoryFilter.tsx';
import { FAQCard } from './components/FAQCard.tsx';
import { ReviewModal } from './components/ReviewModal.tsx';
import { AskEngineDrawer } from './components/AskEngineDrawer.tsx';
import { AIInsightsDashboard } from './components/AIInsightsDashboard.tsx';
import { ReviewsExplorer } from './components/ReviewsExplorer.tsx';

import travelEssentialsImg from './assets/images/travel_essentials_1792430296445.jpg';
import loungeImg from './assets/images/travel_lounge_insights_1792430296921.jpg';

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [reviews, setReviews] = useState<FAQReview[]>([]);
  const [queries, setQueries] = useState<UserQueryLog[]>([]);
  const [stats, setStats] = useState<AIInsightsStats | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'faqs' | 'ask' | 'reviews' | 'insights'>('faqs');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [highlightedFaqId, setHighlightedFaqId] = useState<string | null>(null);

  // Modals / Drawers
  const [reviewModalFaq, setReviewModalFaq] = useState<FAQItem | null>(null);
  const [isAskModalOpen, setIsAskModalOpen] = useState<boolean>(false);

  // Fetch initial FAQs, reviews, and insights
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [faqsRes, revsRes, statsRes] = await Promise.all([
        fetch('/api/faqs'),
        fetch('/api/reviews'),
        fetch('/api/insights/stats'),
      ]);

      if (faqsRes.ok) {
        const data = await faqsRes.json();
        setFaqs(data.faqs || []);
      }

      if (revsRes.ok) {
        const data = await revsRes.json();
        setReviews(data.reviews || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter FAQs based on category and search query
  const filteredFaqs = faqs.filter((faq) => {
    if (selectedCategory !== 'all' && faq.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchQuestion = faq.question.toLowerCase().includes(q);
      const matchSummary = faq.summary.toLowerCase().includes(q);
      const matchAnswer = faq.answer.toLowerCase().includes(q);
      const matchDirect = faq.officialDirectAnswer && faq.officialDirectAnswer.toLowerCase().includes(q);
      const matchTags = faq.tags.some(t => t.toLowerCase().includes(q));
      return matchQuestion || matchSummary || matchAnswer || matchDirect || matchTags;
    }
    return true;
  });

  // Keep official 1 to 10 in strict sequence, then AI auto-added FAQs
  filteredFaqs.sort((a, b) => {
    if (a.orderIndex !== undefined && b.orderIndex !== undefined) {
      return a.orderIndex - b.orderIndex;
    }
    if (a.orderIndex !== undefined) return -1;
    if (b.orderIndex !== undefined) return 1;
    return b.helpfulCount - a.helpfulCount;
  });

  // Calculate counts per category
  const categoryCounts: Record<string, number> = {
    all: faqs.length,
  };
  for (const faq of faqs) {
    categoryCounts[faq.category] = (categoryCounts[faq.category] || 0) + 1;
  }

  // Handle voting helpful / unhelpful
  const handleVote = async (faqId: string, isHelpful: boolean) => {
    try {
      const response = await fetch(`/api/faqs/${faqId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHelpful }),
      });

      if (response.ok) {
        const data = await response.json();
        setFaqs((prev) =>
          prev.map((f) =>
            f.id === faqId
              ? { ...f, helpfulCount: data.helpfulCount, unhelpfulCount: data.unhelpfulCount }
              : f
          )
        );
      }
    } catch (err) {
      console.error('Failed to vote on FAQ:', err);
    }
  };

  // Handle voting review helpful
  const handleVoteReviewHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, helpfulVotes: data.helpfulVotes } : r
          )
        );
      }
    } catch (err) {
      console.error('Failed to vote review:', err);
    }
  };

  // When AI auto-creates a new FAQ from a user inquiry
  const handleFAQCreated = (newFaq: FAQItem) => {
    setFaqs((prev) => [newFaq, ...prev]);
    setSelectedCategory('all');
    setSearchQuery('');
    setHighlightedFaqId(newFaq.id);
    setActiveTab('faqs');
    setTimeout(() => {
      const elem = document.getElementById(newFaq.id);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
  };

  // Reset database for test purposes
  const handleResetSeed = async () => {
    if (confirm('Reset database to the initial 10 official Albania FAQs and seed reviews?')) {
      try {
        await fetch('/api/admin/reset', { method: 'POST' });
        fetchAllData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* 3-Zone Top Navigation Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAskModal={() => setIsAskModalOpen(true)}
      />

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-amber-600 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Main Hero Header */}
      <Hero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={(q) => {
          setSearchQuery(q);
          setActiveTab('faqs');
        }}
        onAskClick={() => setIsAskModalOpen(true)}
      />


      {/* Primary Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Navigation / Mode Segmented Controller */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'faqs' && 'Official Albania Tour Knowledge Base'}
              {activeTab === 'ask' && 'Ask the AI Travel Insights Engine'}
              {activeTab === 'reviews' && 'Traveler Community Feedback & Reviews'}
              {activeTab === 'insights' && 'AI Query Insights & Auto-Addition Pipeline'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {activeTab === 'faqs' && '10 Core questions verified by tour operators, plus dynamic community-driven updates.'}
              {activeTab === 'ask' && 'Inquire about any travel topic; high-utility questions are automatically added to the FAQ database.'}
              {activeTab === 'reviews' && 'Unfiltered ratings and field notes from verified travelers across Albania.'}
              {activeTab === 'insights' && 'Monitoring traveler search patterns and auto-generating emerging answers.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('faqs')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'faqs'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All FAQs ({faqs.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'insights'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Insights</span>
            </button>
          </div>
        </div>

        {/* TAB 1: FAQ KNOWLEDGE BASE */}
        {activeTab === 'faqs' && (
          <div className="space-y-8">
            
            {/* Category Filter Bar */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              categoryCounts={categoryCounts}
            />

            {/* Quick 1-10 Jump & Briefing Bar on Front Page */}
            {!searchQuery && selectedCategory === 'all' && (
              <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-slate-100 p-5 sm:p-6 rounded-2xl border border-amber-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
                      <span>Voyage Albania Official Q&A Briefing (Questions 1 to 10)</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      The 10 essential questions and tour operator answers prepared directly for your departure.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 border border-amber-200 px-3 py-1 rounded-lg shrink-0 self-start sm:self-auto">
                    Verified Q&A 1–10
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
                  {faqs
                    .filter((f) => f.orderIndex !== undefined)
                    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          const elem = document.getElementById(item.id);
                          if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className="p-3 bg-white hover:bg-amber-50/80 rounded-xl border border-slate-200/90 text-left transition-all hover:border-amber-400 shadow-2xs group cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-amber-700 text-xs">
                              Question {item.orderIndex}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                            {item.question.replace(/^\d+\.\s*/, '')}
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-600 line-clamp-2 mt-2 pt-1.5 border-t border-slate-100 font-medium">
                          {item.officialDirectAnswer}
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Active Search Badge/Clearer if searching */}
            {searchQuery && (
              <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                <span>
                  Filtering by keyword: <strong className="font-bold">"{searchQuery}"</strong> ({filteredFaqs.length} results found)
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="font-bold text-amber-800 hover:underline cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* FAQs Grid / List */}
            {isLoading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Loading verified FAQs from database...</p>
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No matching questions found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  We haven't indexed a specific FAQ for this search term yet. Would you like our AI Travel Insights Engine to answer it and auto-generate an entry into the database?
                </p>
                <button
                  onClick={() => setIsAskModalOpen(true)}
                  className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Ask AI & Auto-Add to Database</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq) => {
                  const faqReviews = reviews.filter((r) => r.faqId === faq.id);
                  const isHighlighted = highlightedFaqId === faq.id;

                  return (
                    <div 
                      key={faq.id} 
                      id={faq.id}
                      className={isHighlighted ? 'ring-2 ring-amber-500 rounded-xl transition-all' : ''}
                    >
                      <FAQCard
                        faq={faq}
                        reviews={faqReviews}
                        onVote={handleVote}
                        onOpenReviewModal={(item) => setReviewModalFaq(item)}
                        onVoteReviewHelpful={handleVoteReviewHelpful}
                        defaultExpanded={faqs.length <= 3 || isHighlighted}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Travel Essentials & Concierge Guaranteerest Section */}
            <section className="mt-16 pt-12 border-t border-slate-200/90 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              
              {/* Card 1: What Your Dedicated Driver Includes */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700 mb-2">
                    <Car className="w-4 h-4" />
                    <span>Included Tour Transport Feature</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
                    Private Vehicle & Dedicated Driver Throughout
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Unlike ordinary public transport with irregular furgon timetables, your tour includes a private, modern air-conditioned vehicle and an experienced local driver.
                  </p>

                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Comfortable navigation over Llogara Pass & mountain switchbacks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Direct hotel pickups in Tirana, Berat, Gjirokastër & Sarandë</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>No car rental deposits, local insurance puzzles, or parking stress</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Questions about your driver schedule?</span>
                  <button 
                    onClick={() => setIsAskModalOpen(true)}
                    className="font-bold text-amber-700 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Ask Concierge</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 2: 24/7 Emergency & Packing Checklist */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700 mb-2">
                    <PhoneCall className="w-4 h-4" />
                    <span>Emergency Concierge & Support</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
                    24/7 Travel Agency Emergency Assistance
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-5">
                    Save general emergency <strong>112</strong>, police <strong>129</strong>, and ambulance <strong>127</strong>. In any unexpected event, notify our team directly for immediate on-the-ground coordination.
                  </p>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-slate-400 font-semibold">General SOS</div>
                      <div className="text-base font-bold text-slate-900 tabular-nums">112</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-semibold">Police</div>
                      <div className="text-base font-bold text-slate-900 tabular-nums">129</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-semibold">Ambulance</div>
                      <div className="text-base font-bold text-slate-900 tabular-nums">127</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-semibold">Fire Service</div>
                      <div className="text-base font-bold text-slate-900 tabular-nums">128</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/60 border-t border-amber-100 flex items-center justify-between text-xs text-amber-900 px-6">
                  <span className="font-medium">Direct tour support hotline active 24/7</span>
                  <span className="font-bold">Always by your side</span>
                </div>
              </div>

            </section>

          </div>
        )}

        {/* TAB 2: ASK TRAVEL AI & INQUIRIES */}
        {activeTab === 'ask' && (
          <div className="max-w-3xl mx-auto py-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Ask Anything About Your Albania Tour
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Get real-time answers powered by Gemini 3.8 Flash. If your question is novel and helpful, our AI Insights Engine will automatically archive it into our permanent FAQ database!
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsAskModalOpen(true)}
                  className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Open Interactive Question Terminal</span>
                </button>
              </div>

              {/* Sample Inquiries Preview */}
              <div className="pt-6 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Inquiries Recently Asked by Fellow Travelers:
                </div>
                <div className="space-y-2">
                  {[
                    'Is tap water safe to drink in Tirana and coastal Albania?',
                    'Do US or UK citizens need an entry visa or tourist permit?',
                    'Can I fly a camera drone over Ksamil or Gjirokastër Castle?',
                    'What traditional food dishes should I try in Berat?',
                  ].map((q) => (
                    <div
                      key={q}
                      onClick={() => setIsAskModalOpen(true)}
                      className="p-3 bg-slate-50 hover:bg-amber-50/60 rounded-xl border border-slate-200 hover:border-amber-200 transition-colors flex items-center justify-between text-xs text-slate-800 cursor-pointer"
                    >
                      <span className="font-medium">"{q}"</span>
                      <span className="text-amber-700 font-bold flex items-center gap-1">
                        View Answer
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REVIEWS & COMMUNITY FEEDBACK */}
        {activeTab === 'reviews' && (
          <ReviewsExplorer
            reviews={reviews}
            faqs={faqs}
            onVoteReviewHelpful={handleVoteReviewHelpful}
            onOpenReviewModal={(item) => setReviewModalFaq(item)}
            onSelectFaq={(faqId) => {
              setActiveTab('faqs');
              setSelectedCategory('all');
              setSearchQuery('');
              setHighlightedFaqId(faqId);
              setTimeout(() => {
                const elem = document.getElementById(faqId);
                if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 200);
            }}
          />
        )}

        {/* TAB 4: AI INSIGHTS ENGINE MONITOR */}
        {activeTab === 'insights' && (
          <AIInsightsDashboard
            stats={stats}
            queries={queries}
            onRefreshStats={fetchAllData}
            onClusterGenerateSuccess={(newFaqs) => {
              setFaqs((prev) => [...newFaqs, ...prev]);
            }}
            onSelectFaq={(faqId) => {
              setActiveTab('faqs');
              setHighlightedFaqId(faqId);
            }}
          />
        )}

      </main>

      {/* Review Submission Modal (Persists to database) */}
      <ReviewModal
        faq={reviewModalFaq}
        isOpen={Boolean(reviewModalFaq)}
        onClose={() => setReviewModalFaq(null)}
        onSubmitSuccess={() => {
          fetchAllData();
        }}
      />

      {/* Interactive AI Ask Drawer */}
      <AskEngineDrawer
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        onFAQCreated={handleFAQCreated}
        onSelectExistingFaq={(faqId) => {
          setActiveTab('faqs');
          setHighlightedFaqId(faqId);
          setTimeout(() => {
            const elem = document.getElementById(faqId);
            if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 200);
        }}
      />

      {/* Quiet Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 px-1.5 rounded bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-black text-[10px] tracking-wider shadow-2xs">
              FAQ
            </div>
            <span className="font-bold text-slate-900">Voyage Albania</span>
            <span>· Official Travel FAQ & Live Insights Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Data stored persistently in database</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleResetSeed}
              className="text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset database to the initial 10 official FAQs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Seed</span>
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
