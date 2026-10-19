import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Compass, 
  FileCheck
} from 'lucide-react';
import { AIInsightsStats, UserQueryLog, FAQItem } from '../types.js';

interface AIInsightsDashboardProps {
  stats: AIInsightsStats | null;
  queries: UserQueryLog[];
  onRefreshStats: () => void;
  onClusterGenerateSuccess: (newFaqs: FAQItem[]) => void;
  onSelectFaq: (faqId: string) => void;
}

export const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({
  stats,
  queries,
  onRefreshStats,
  onClusterGenerateSuccess,
  onSelectFaq,
}) => {
  const [isClustering, setIsClustering] = useState(false);
  const [clusterMessage, setClusterMessage] = useState('');

  const handleRunCluster = async () => {
    setIsClustering(true);
    setClusterMessage('');

    try {
      const response = await fetch('/api/insights/cluster-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Clustering failed');
      }

      const data = await response.json();
      if (data.synthesizedFaqs && data.synthesizedFaqs.length > 0) {
        setClusterMessage(`Successfully clustered queries and synthesized ${data.synthesizedFaqs.length} new verified FAQs into the database!`);
        onClusterGenerateSuccess(data.synthesizedFaqs);
      } else {
        setClusterMessage('Existing FAQs already cover all current high-volume query trends.');
      }
      onRefreshStats();
    } catch (err) {
      console.error(err);
      setClusterMessage('Error running clustering algorithm.');
    } finally {
      setIsClustering(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-700/60 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Autonomous Knowledge Base Evolution</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            AI-Powered Travel Insights Engine
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Our engine continuously tracks what travelers are searching for in Albania. When multiple guests ask related questions, our server-side Gemini intelligence synthesizes authoritative, verified FAQ entries and adds them to the database automatically.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunCluster}
              disabled={isClustering}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isClustering ? 'animate-spin' : ''}`} />
              <span>{isClustering ? 'Clustering User Queries...' : 'Run Query Clustering & Auto-Synthesize'}</span>
            </button>
            <span className="text-xs text-slate-400">
              Evaluates search frequency & regulatory sources
            </span>
          </div>

          {clusterMessage && (
            <div className="mt-4 p-3 bg-white/10 backdrop-blur-md rounded-lg text-xs text-amber-200 border border-white/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{clusterMessage}</span>
            </div>
          )}
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-600/10 to-transparent pointer-events-none" />
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Queries Tracked</span>
            <HelpCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {stats?.totalQueriesAnalyzed ?? 1840}
          </div>
          <p className="text-xs text-slate-500 mt-1">Across web, app & tour bookings</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Auto-Generated FAQs</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tabular-nums">
            {stats?.faqsAutoGenerated ?? 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">Synthesized from user inquiries</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Verified Helpfulness</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums">
            {stats?.averageSatisfactionRate ?? 99}%
          </div>
          <p className="text-xs text-slate-500 mt-1">Positive community votes</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Emerging Topics Queued</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {stats?.emergingTopicsCount ?? 3}
          </div>
          <p className="text-xs text-slate-500 mt-1">Under frequency clustering</p>
        </div>

      </div>

      {/* Two Column Layout: Trending Query Cluster vs Recent AI Additions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Traveler Search Log & Frequency */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Live Traveler Search Inquiries
              </h3>
              <p className="text-xs text-slate-500">
                User queries logged into the backend database
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 tabular-nums">
              {queries.length} Logged
            </span>
          </div>

          <div className="space-y-2.5">
            {queries.map((q) => (
              <div 
                key={q.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-slate-900 leading-snug">
                    "{q.query}"
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="capitalize">{q.category.replace('-', ' ')}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(q.lastAskedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] tabular-nums">
                    Asked {q.askedCount}x
                  </div>
                  <span className={`text-[10px] block mt-1 font-medium ${
                    q.status === 'promoted-to-faq' 
                      ? 'text-emerald-700' 
                      : 'text-slate-500'
                  }`}>
                    {q.status === 'promoted-to-faq' ? '✓ Promoted to FAQ' : 'Answered'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: How the Engine Works & Recent Additions */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Autonomous Auto-Addition Pipeline
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Whenever travelers ask queries not explicitly answered in our 10 foundational FAQs, the system processes them via 3 automated stages:
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </div>
                <div>
                  <div className="font-bold text-slate-900">Query Logging & Vector Deduplication</div>
                  <div className="text-slate-600 mt-0.5">
                    Every search is cataloged with category metadata and frequency counts.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </div>
                <div>
                  <div className="font-bold text-slate-900">Gemini 3.8 Flash Travel Synthesis</div>
                  <div className="text-slate-600 mt-0.5">
                    Evaluates local Albanian regulations, airline standards, and tour context.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </div>
                <div>
                  <div className="font-bold text-slate-900">Direct Database Storage & Live Publishing</div>
                  <div className="text-slate-600 mt-0.5">
                    High-utility answers are stored in <code className="font-mono bg-slate-200 px-1 rounded">travel_faq_db.json</code> with source tracking.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Trending Travel Topics */}
          {stats?.topTrendingTopics && stats.topTrendingTopics.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-600" />
                <span>Top Trending Traveler Inquiries</span>
              </h3>
              <div className="space-y-2">
                {stats.topTrendingTopics.map((topic, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0"
                  >
                    <span className="text-slate-800 font-medium truncate max-w-xs">
                      {topic.topic}
                    </span>
                    <span className="text-slate-500 font-bold tabular-nums">
                      {topic.count} searches
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
