import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquarePlus, 
  Sparkles, 
  Star, 
  Calendar, 
  Eye, 
  Tag,
  DollarSign,
  Car,
  Smile,
  Smartphone,
  AlertTriangle,
  FileText,
  Briefcase,
  HeartPulse,
  MapPin,
  Link,
  Check,
  Printer
} from 'lucide-react';
import { FAQItem, FAQReview, FAQCategory } from '../types.js';

interface FAQCardProps {
  faq: FAQItem;
  reviews?: FAQReview[];
  onVote: (faqId: string, isHelpful: boolean) => void;
  onOpenReviewModal: (faq: FAQItem) => void;
  onVoteReviewHelpful: (reviewId: string) => void;
  onSelectCategory?: (category: FAQCategory) => void;
  defaultExpanded?: boolean;
}

export const FAQCard: React.FC<FAQCardProps> = ({
  faq,
  reviews = [],
  onVote,
  onOpenReviewModal,
  onVoteReviewHelpful,
  onSelectCategory,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showReviews, setShowReviews] = useState(false);
  const [hasVoted, setHasVoted] = useState<'yes' | 'no' | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const getCategoryBadgeStyle = (cat: string) => {
    switch (cat) {
      case 'currency-budget': 
        return { label: 'Budget', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' };
      case 'transit-transport': 
        return { label: 'Transport', bg: 'bg-sky-100 text-sky-800 border-sky-300 hover:bg-sky-200' };
      case 'customs-etiquette': 
        return { label: 'Customs & Culture', bg: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200' };
      case 'connectivity-tech': 
        return { label: 'Tech & SIM', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200' };
      case 'safety-emergency': 
        return { label: 'Emergency', bg: 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200' };
      case 'visa-passports': 
        return { label: 'Visas', bg: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' };
      case 'baggage-packing': 
        return { label: 'Packing', bg: 'bg-teal-100 text-teal-800 border-teal-300 hover:bg-teal-200' };
      case 'health-insurance': 
        return { label: 'Health', bg: 'bg-cyan-100 text-cyan-800 border-cyan-300 hover:bg-cyan-200' };
      default: 
        return { label: 'Advisory', bg: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200' };
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#faq-${faq.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      window.location.hash = `faq-${faq.id}`;
      setTimeout(() => setCopiedLink(false), 2500);
    }).catch((err) => {
      console.error('Failed to copy link:', err);
    });
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${faq.question} - Voyage Albania Print Guide</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; max-width: 700px; margin: 0 auto; }
            .header { border-bottom: 2px solid #f59e0b; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
            .brand { font-size: 14px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 1px; }
            .meta { font-size: 12px; color: #64748b; }
            h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 16px; }
            .direct-answer { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 20px; font-size: 15px; font-weight: 600; color: #78350f; border-radius: 4px; }
            .body-content { font-size: 14px; color: #334155; margin-bottom: 30px; }
            .body-content p { margin-bottom: 12px; }
            .body-content ul { margin-left: 20px; margin-bottom: 12px; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
            @media print {
              button { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">Voyage Albania · Official Travel Briefing</div>
            <div class="meta">Verified: ${faq.lastVerifiedDate}</div>
          </div>
          <h1>${faq.question}</h1>
          ${faq.officialDirectAnswer ? `<div class="direct-answer"><strong>Tour Summary:</strong> ${faq.officialDirectAnswer}</div>` : ''}
          <div class="body-content">
            ${faq.answer.replace(/\n/g, '<br/>')}
          </div>
          <div class="footer">
            <span>Category: ${faq.category}</span>
            <span>Emergency SOS: 112 | 24/7 Concierge Active</span>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleVote = (e: React.MouseEvent, helpful: boolean) => {
    e.stopPropagation();
    if (hasVoted) return;
    setHasVoted(helpful ? 'yes' : 'no');
    onVote(faq.id, helpful);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'currency-budget': return 'Currency & Costs';
      case 'transit-transport': return 'Transport & Drivers';
      case 'customs-etiquette': return 'Customs & Places of Worship';
      case 'connectivity-tech': return 'SIM, Wi-Fi & Plugs';
      case 'safety-emergency': return 'Emergency & Hotlines';
      case 'visa-passports': return 'Visas & Entry';
      case 'baggage-packing': return 'Baggage & Packing';
      case 'health-insurance': return 'Insurance & Health';
      default: return 'Travel Advisory';
    }
  };

  // Format markdown with bolding, lists, and line breaks
  const renderFormattedAnswer = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={index} className="h-2" />;
      }

      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={index} className="text-base font-bold text-slate-900 mt-4 mb-2 first:mt-0">
            {trimmed.replace('### ', '')}
          </h4>
        );
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        return (
          <li key={index} className="ml-4 list-disc text-slate-700 mb-1 leading-relaxed text-sm sm:text-base">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
          </li>
        );
      }

      if (/^\d+\.\s/.test(trimmed)) {
        const content = trimmed.replace(/^\d+\.\s/, '');
        return (
          <li key={index} className="ml-4 list-decimal text-slate-700 mb-1 leading-relaxed text-sm sm:text-base">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
          </li>
        );
      }

      return (
        <p key={index} className="text-slate-700 mb-2 leading-relaxed text-sm sm:text-base">
          <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }} />
        </p>
      );
    });
  };

  const formatInlineMarkdown = (str: string) => {
    // Bold: **text**
    let formatted = str.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    // Italic: *text*
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-slate-800">$1</em>');
    return formatted;
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'currency-budget': return DollarSign;
      case 'transit-transport': return Car;
      case 'customs-etiquette': return Smile;
      case 'connectivity-tech': return Smartphone;
      case 'safety-emergency': return AlertTriangle;
      case 'visa-passports': return FileText;
      case 'baggage-packing': return Briefcase;
      case 'health-insurance': return HeartPulse;
      default: return MapPin;
    }
  };

  const CategoryIcon = getCategoryIcon(faq.category);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <article className="relative bg-white rounded-xl border border-slate-200/90 shadow-sm transition-all hover:border-slate-300 overflow-hidden">
      <div className="absolute -top-4 -right-4 opacity-[0.04] pointer-events-none">
        <CategoryIcon className="w-32 h-32 text-slate-950" />
      </div>
      
      {/* Clickable Card Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 sm:p-6 cursor-pointer select-none"
      >
        {/* Unboxed Metadata Header */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-slate-500 mb-2.5">
          {(() => {
            const badge = getCategoryBadgeStyle(faq.category);
            return (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectCategory) onSelectCategory(faq.category);
                }}
                className={`px-2.5 py-1 rounded-md font-bold text-xs border transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1 ${badge.bg}`}
                title={`Filter by ${badge.label}`}
              >
                <span>{badge.label}</span>
              </button>
            );
          })()}
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Verified {faq.lastVerifiedDate}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1 tabular-nums">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            {faq.viewCount} views
          </span>

          {faq.source === 'ai-insights-engine' && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Auto-Synthesized by AI Insights
              </span>
            </>
          )}

          {averageRating && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1 text-amber-600 font-semibold tabular-nums">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                {averageRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </>
          )}
        </div>

        {/* Question Title */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
            {faq.question}
          </h3>
          <button 
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 mt-0.5"
            aria-label={isExpanded ? 'Collapse FAQ' : 'Expand FAQ'}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>

        {/* Official Tour Answer Highlight Box */}
        {faq.officialDirectAnswer ? (
          <div className="mt-3 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-950">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block" />
              <span>Voyage Tour Answer:</span>
            </div>
            <div className="text-sm font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
              {faq.officialDirectAnswer}
            </div>
          </div>
        ) : (
          !isExpanded && (
            <p className="text-slate-600 text-sm mt-2 line-clamp-2 leading-relaxed">
              {faq.summary}
            </p>
          )
        )}
      </div>

      {/* Expanded Content Area */}
      {isExpanded && (
        <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 bg-slate-50/40">
          
          {/* Formatted Answer Body */}
          <div className="prose prose-slate max-w-none text-slate-800 my-4 text-sm sm:text-base">
            {renderFormattedAnswer(faq.answer)}
          </div>

          {/* Tags */}
          {faq.tags && faq.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-3 pb-4 border-t border-slate-200/60">
              <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
                <Tag className="w-3 h-3" />
                Tags:
              </span>
              {faq.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-slate-600 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Interactive Actions & Helpful Voting Strip */}
          <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Helpful Question */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Was this answer helpful?</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => handleVote(e, true)}
                  disabled={hasVoted !== null}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                    hasVoted === 'yes'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted === 'yes' ? 'text-emerald-600 fill-emerald-600' : 'text-slate-500'}`} />
                  <span className="tabular-nums font-semibold">{faq.helpfulCount}</span>
                </button>

                <button
                  onClick={(e) => handleVote(e, false)}
                  disabled={hasVoted !== null}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                    hasVoted === 'no'
                      ? 'bg-rose-50 text-rose-700 border-rose-300 font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ThumbsDown className={`w-3.5 h-3.5 ${hasVoted === 'no' ? 'text-rose-600 fill-rose-600' : 'text-slate-500'}`} />
                  <span className="tabular-nums font-semibold">{faq.unhelpfulCount}</span>
                </button>
              </div>

              {hasVoted && (
                <span className="text-xs text-emerald-700 font-medium ml-2 animate-fade-in">
                  Thanks for your feedback!
                </span>
              )}
            </div>

            {/* Review & Feedback Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Copy unique deep-link for this FAQ"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Link className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 text-xs font-semibold text-amber-900 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 border border-amber-300 rounded-lg transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                title="Open printer-friendly layout"
              >
                <Printer className="w-3.5 h-3.5 text-amber-700" />
                <span>Print Guide</span>
              </button>

              <button
                onClick={() => setShowReviews(!showReviews)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                {showReviews ? 'Hide Reviews' : `Reviews (${reviews.length})`}
              </button>

              <button
                onClick={() => onOpenReviewModal(faq)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-amber-300" />
                <span>Write Feedback</span>
              </button>
            </div>

          </div>

          {/* Sub-Panel: Traveler Reviews & Community Feedback */}
          {showReviews && (
            <div className="mt-5 pt-5 border-t border-slate-200/80 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Traveler Feedback & Field Notes</span>
                  <span className="text-xs font-normal text-slate-500">
                    ({reviews.length} {reviews.length === 1 ? 'submission' : 'submissions'})
                  </span>
                </h4>
                <button
                  onClick={() => onOpenReviewModal(faq)}
                  className="text-xs text-amber-700 font-semibold hover:underline cursor-pointer"
                >
                  + Add Your Experience
                </button>
              </div>

              {reviews.length === 0 ? (
                <div className="p-4 bg-white rounded-lg border border-slate-200 text-center text-xs text-slate-500">
                  No traveler reviews yet for this answer. Be the first to share your experience or suggest an update!
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div 
                      key={rev.id} 
                      className="p-3.5 bg-white rounded-lg border border-slate-200/90 shadow-2xs text-xs"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{rev.userName}</span>
                          {rev.userLocation && (
                            <span className="text-slate-400">· {rev.userLocation}</span>
                          )}
                          <span className="text-slate-400">· {rev.travelerType}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= rev.rating
                                  ? 'text-amber-500 fill-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-slate-700 text-xs sm:text-sm leading-relaxed mb-2">
                        "{rev.comment}"
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-100">
                        <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                        <button
                          onClick={() => onVoteReviewHelpful(rev.id)}
                          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>Helpful ({rev.helpfulVotes || 0})</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </article>
  );
};
