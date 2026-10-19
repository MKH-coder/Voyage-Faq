import React, { useState } from 'react';
import { X, Star, MessageSquareHeart, CheckCircle2 } from 'lucide-react';
import { FAQItem, ReviewFeedbackType, TravelerType } from '../types.js';

interface ReviewModalProps {
  faq: FAQItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  faq,
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackType, setFeedbackType] = useState<ReviewFeedbackType>('helpful');
  const [travelerType, setTravelerType] = useState<TravelerType>('Guided Tour Guest');
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !faq) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMessage('Please provide a brief feedback comment or tip.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch(`/api/faqs/${faq.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userName.trim() || 'Verified Traveler',
          userLocation: userLocation.trim() || 'Global Traveler',
          rating,
          feedbackType,
          comment: comment.trim(),
          travelerType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setComment('');
        setUserName('');
        setUserLocation('');
        onClose();
        onSubmitSuccess();
      }, 1400);
    } catch (err) {
      console.error(err);
      setErrorMessage('An error occurred while saving your feedback to the database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <MessageSquareHeart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Review & Community Feedback
              </h3>
              <p className="text-xs text-slate-500">
                Saved directly to the travel database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Form */}
        {success ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
            <h4 className="text-lg font-bold text-slate-900">Feedback Saved to Database!</h4>
            <p className="text-sm text-slate-600 max-w-sm">
              Thank you for contributing to WanderWise. Your field review will help upcoming Albania travelers.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
            {/* Target FAQ title */}
            <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200/70 text-xs text-amber-900">
              <span className="font-bold">Reviewing FAQ: </span>
              {faq.question}
            </div>

            {/* Star Rating Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Overall Accuracy & Helpfulness (1–5 Stars)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-500 fill-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold text-slate-600 ml-2">
                  {rating === 5 && 'Outstandingly helpful'}
                  {rating === 4 && 'Very clear and accurate'}
                  {rating === 3 && 'Helpful, could use more details'}
                  {rating === 2 && 'Partially outdated or incomplete'}
                  {rating === 1 && 'Needs urgent correction'}
                </span>
              </div>
            </div>

            {/* Feedback Type & Traveler Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Feedback Category
                </label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value as ReviewFeedbackType)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="helpful">Helpful & Accurate</option>
                  <option value="suggestion">New Tip / Suggestion</option>
                  <option value="needs-clarification">Needs More Clarification</option>
                  <option value="outdated">Notice an Update</option>
                  <option value="general">General Experience</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Traveler Style
                </label>
                <select
                  value={travelerType}
                  onChange={(e) => setTravelerType(e.target.value as TravelerType)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Guided Tour Guest">Guided Tour Guest</option>
                  <option value="Solo Backpacker">Solo Backpacker</option>
                  <option value="Family Traveler">Family Traveler</option>
                  <option value="Business Nomad">Business Nomad</option>
                  <option value="Adventure Explorer">Adventure Explorer</option>
                </select>
              </div>
            </div>

            {/* User Name & Location (optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Elena R."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Home City / Country
                </label>
                <input
                  type="text"
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  placeholder="e.g. London, UK"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Review, Feedback, or Real-world Tip *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                required
                placeholder="Share your personal experience with this topic (e.g. how the private driver made mountain transit easy, where you exchanged Lek, or how your eSIM worked in Tirana)..."
                className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 font-medium">{errorMessage}</p>
            )}

            {/* Submit Bar */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                {isSubmitting ? 'Saving to Database...' : 'Post Review & Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
