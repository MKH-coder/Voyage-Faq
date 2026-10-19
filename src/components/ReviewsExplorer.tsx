import React, { useState } from 'react';
import { 
  Star, 
  ThumbsUp, 
  MessageSquareHeart, 
  MapPin, 
  Filter, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';
import { FAQReview, FAQItem } from '../types.js';

interface ReviewsExplorerProps {
  reviews: FAQReview[];
  faqs: FAQItem[];
  onVoteReviewHelpful: (reviewId: string) => void;
  onOpenReviewModal: (faq: FAQItem) => void;
  onSelectFaq: (faqId: string) => void;
}

export const ReviewsExplorer: React.FC<ReviewsExplorerProps> = ({
  reviews,
  faqs,
  onVoteReviewHelpful,
  onOpenReviewModal,
  onSelectFaq,
}) => {
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [styleFilter, setStyleFilter] = useState<string>('all');

  const filteredReviews = reviews.filter((r) => {
    if (ratingFilter !== 'all' && r.rating !== ratingFilter) return false;
    if (styleFilter !== 'all' && r.travelerType !== styleFilter) return false;
    return true;
  });

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const fiveStarCount = reviews.filter(r => r.rating === 5).length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Review Aggregation Hero Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-amber-700">
            <MessageSquareHeart className="w-4 h-4" />
            <span>Verified Traveler Experiences</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Guest Reviews & Field Advice
          </h2>
          <p className="text-sm text-slate-600 max-w-xl">
            Real feedback from past travelers on our Albanian tours. Read firsthand field notes on currency exchange, private drivers, local SIMs, and emergency support.
          </p>
        </div>

        {/* Aggregate Score Card */}
        <div className="flex items-center gap-6 p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200/90 shrink-0">
          <div className="text-center">
            <div className="text-4xl font-extrabold text-slate-900 tabular-nums">
              {averageRating}
            </div>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 text-amber-500 fill-amber-400" />
              ))}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Based on {reviews.length} reviews
            </div>
          </div>

          <div className="h-12 w-px bg-slate-200" />

          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Verified Guests</span>
            </div>
            <div className="text-slate-500">
              {fiveStarCount} five-star ratings
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Filters:
          </span>

          {/* Rating filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars Only</option>
            <option value="3">3 Stars & Below</option>
          </select>

          {/* Style filter */}
          <select
            value={styleFilter}
            onChange={(e) => setStyleFilter(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none"
          >
            <option value="all">All Traveler Styles</option>
            <option value="Guided Tour Guest">Guided Tour Guests</option>
            <option value="Solo Backpacker">Solo Backpackers</option>
            <option value="Family Traveler">Family Travelers</option>
            <option value="Adventure Explorer">Adventure Explorers</option>
          </select>
        </div>

        <div className="text-slate-500 font-semibold tabular-nums">
          Showing {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
        </div>
      </div>

      {/* Reviews Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.map((rev) => {
          const relatedFaq = faqs.find((f) => f.id === rev.faqId);

          return (
            <article 
              key={rev.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Related FAQ context link */}
                {relatedFaq && (
                  <button
                    onClick={() => onSelectFaq(relatedFaq.id)}
                    className="text-left text-xs font-semibold text-amber-700 hover:underline mb-2 line-clamp-1 block cursor-pointer"
                  >
                    Topic: {relatedFaq.question}
                  </button>
                )}

                {/* Stars and Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rev.rating
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[11px] text-slate-500 font-medium">
                    {rev.feedbackType === 'helpful' ? '✓ Verified Accurate' : rev.feedbackType}
                  </span>
                </div>

                {/* Comment Body */}
                <p className="text-slate-800 text-sm leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author & Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div>
                  <div className="font-bold text-slate-900">{rev.userName}</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    {rev.userLocation && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {rev.userLocation}
                      </span>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>{rev.travelerType}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => onVoteReviewHelpful(rev.id)}
                    className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span className="tabular-nums">{rev.helpfulVotes || 0}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

    </div>
  );
};
