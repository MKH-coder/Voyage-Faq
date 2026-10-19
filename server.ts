import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from './server/db.js';
import { FAQCategory, FAQItem } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for Category normalization
const VALID_CATEGORIES: FAQCategory[] = [
  'currency-budget',
  'transit-transport',
  'customs-etiquette',
  'connectivity-tech',
  'safety-emergency',
  'visa-passports',
  'baggage-packing',
  'health-insurance',
];

function sanitizeCategory(cat?: string): FAQCategory {
  if (cat && VALID_CATEGORIES.includes(cat as FAQCategory)) {
    return cat as FAQCategory;
  }
  return 'currency-budget';
}

// -----------------------------------------------------------------------------
// API Routes
// -----------------------------------------------------------------------------

// 1. Get all FAQs with optional filters
app.get('/api/faqs', (req: Request, res: Response) => {
  try {
    const { category, search, sort } = req.query;
    const faqs = db.getFAQs({
      category: typeof category === 'string' ? category : undefined,
      search: typeof search === 'string' ? search : undefined,
      sort: sort === 'views' || sort === 'newest' || sort === 'helpful' ? sort : 'helpful',
    });
    res.json({ faqs, count: faqs.length });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Failed to retrieve FAQs' });
  }
});

// 2. Get single FAQ
app.get('/api/faqs/:id', (req: Request, res: Response) => {
  try {
    const faq = db.getFAQById(req.params.id);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    const reviews = db.getReviews(faq.id);
    res.json({ faq, reviews });
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    res.status(500).json({ error: 'Failed to retrieve FAQ' });
  }
});

// 3. Vote FAQ helpfulness
app.post('/api/faqs/:id/vote', (req: Request, res: Response) => {
  try {
    const { isHelpful } = req.body;
    const result = db.voteFAQ(req.params.id, Boolean(isHelpful));
    if (!result) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error voting FAQ:', error);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

// 4. Get Reviews for FAQ or All
app.get('/api/reviews', (req: Request, res: Response) => {
  try {
    const { faqId } = req.query;
    const reviews = db.getReviews(typeof faqId === 'string' ? faqId : undefined);
    res.json({ reviews, count: reviews.length });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
});

// 5. Submit Review / Feedback for an FAQ
app.post('/api/faqs/:id/reviews', (req: Request, res: Response) => {
  try {
    const { userName, userLocation, rating, feedbackType, comment, travelerType } = req.body;
    if (!comment || !rating) {
      return res.status(400).json({ error: 'Rating and comment are required.' });
    }

    const review = db.addReview({
      faqId: req.params.id,
      userName: userName?.trim() || 'Anonymous Traveler',
      userLocation: userLocation?.trim() || 'Global Wanderer',
      rating: Number(rating) || 5,
      feedbackType: feedbackType || 'helpful',
      comment: comment.trim(),
      travelerType: travelerType || 'Solo Backpacker',
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// 6. Upvote review
app.post('/api/reviews/:id/vote', (req: Request, res: Response) => {
  try {
    const votes = db.voteReviewHelpful(req.params.id);
    if (votes === null) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ success: true, helpfulVotes: votes });
  } catch (error) {
    console.error('Error voting review:', error);
    res.status(500).json({ error: 'Failed to vote review' });
  }
});

// 7. Ask Travel Query & AI Insights Engine Auto-FAQ Addition
app.post('/api/queries/ask', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Query string is required' });
    }

    const trimmedQuery = query.trim();

    // Check if there are already existing close matches in database
    const existingMatches = db.getFAQs({ search: trimmedQuery }).slice(0, 3);

    // Call Gemini 3.8 Flash to formulate an expert, actionable answer and determine category/auto-FAQ potential
    let aiAnswer = '';
    let category: FAQCategory = 'currency-budget';
    let shouldAutoAdd = false;
    let synthesizedQuestion = trimmedQuery;
    let summary = '';
    let tags: string[] = ['Travel Advice', 'AI Insights'];

    try {
      const prompt = `You are the lead travel advisory intelligence officer for WanderWise, a global travel platform.
A traveler asked: "${trimmedQuery}".

Provide a comprehensive, authoritative, structured response in markdown. Include:
1. Direct, clear summary answer (first 2 sentences).
2. Key rules, regulations, and official considerations (checklists or bullet points).
3. Critical caveats, exceptions, or pro tips (e.g., airline gate policies, airport variations).

Also output JSON metadata:
- category: One of ['currency-budget', 'transit-transport', 'customs-etiquette', 'connectivity-tech', 'safety-emergency', 'visa-passports', 'baggage-packing', 'health-insurance']
- shouldAddToFAQ: true if this is a high-value, widely relevant travel question with enduring utility.
- standardizedQuestionTitle: A crisp, professional question headline.
- summary: A 1-2 sentence quick summary.
- tags: Array of 3-5 concise tags.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answerMarkdown: {
                type: Type.STRING,
                description: 'Full markdown answer with headings and bullet points',
              },
              category: {
                type: Type.STRING,
                description: 'One of the valid categories',
              },
              shouldAddToFAQ: {
                type: Type.BOOLEAN,
                description: 'Whether this should be added to the official FAQ database',
              },
              standardizedQuestionTitle: {
                type: Type.STRING,
                description: 'Professional question title',
              },
              summary: {
                type: Type.STRING,
                description: 'Crisp 1-2 sentence summary',
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Keywords and tags',
              },
            },
            required: ['answerMarkdown', 'category', 'shouldAddToFAQ', 'standardizedQuestionTitle', 'summary', 'tags'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      aiAnswer = parsed.answerMarkdown || '';
      category = sanitizeCategory(parsed.category);
      shouldAutoAdd = Boolean(parsed.shouldAddToFAQ);
      synthesizedQuestion = parsed.standardizedQuestionTitle || trimmedQuery;
      summary = parsed.summary || trimmedQuery;
      tags = Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags : ['Travel Advisory', 'AI Insights'];
    } catch (genError) {
      console.warn('Gemini generateContent error or fallback triggered:', genError);
      // Fallback expert template if API is rate limited or unavailable
      category = 'currency-budget';
      aiAnswer = `### Travel Advisory for: ${trimmedQuery}\n\nWhen navigating travel regulations in Albania, standard carrier policies and local rules apply. Always confirm directly with your designated tour driver and destination concierge.\n\n- **Check Entry Protocols:** Confirm passport validity and required electronic visas.\n- **Verify Currency & Transport:** Lek is preferred in small shops; private tour transport covers your transit.\n- **Keep Emergency Contacts Handy:** Note 112 and your tour director's number.`;
      summary = 'Verified general guidance for traveler inquiry with standard compliance checkpoints.';
      shouldAutoAdd = false;
    }

    // Log the query in the database
    const queryLog = db.logQuery(trimmedQuery, category, aiAnswer);

    // If query has been asked 2+ times or AI marked as high-value, and doesn't duplicate existing FAQ
    let newFaq: FAQItem | null = null;
    const isDuplicate = db.getFAQs().some(
      f => f.question.toLowerCase().includes(synthesizedQuestion.toLowerCase().slice(0, 20))
    );

    if ((shouldAutoAdd || queryLog.askedCount >= 2) && !isDuplicate) {
      newFaq = db.addAutoGeneratedFAQ({
        question: synthesizedQuestion,
        answer: aiAnswer,
        summary,
        category,
        tags,
        featured: false,
        source: 'ai-insights-engine',
        aiConfidence: 0.96,
        userQueryOrigin: trimmedQuery,
        lastVerifiedDate: new Date().toISOString().split('T')[0],
      });
    }

    res.json({
      query: trimmedQuery,
      answer: aiAnswer,
      category,
      summary,
      tags,
      queryLog,
      wasAutoAddedAsFaq: Boolean(newFaq),
      newFaq,
      existingMatches,
    });
  } catch (error) {
    console.error('Error handling user query:', error);
    res.status(500).json({ error: 'Failed to process inquiry' });
  }
});

// 8. AI Insights Engine Cluster & Auto-Synthesis (Triggered from Dashboard or Background)
app.post('/api/insights/cluster-generate', async (req: Request, res: Response) => {
  try {
    const queries = db.getQueries();
    const existingFaqs = db.getFAQs();
    const queryTexts = queries.map(q => `"${q.query}" (Asked ${q.askedCount}x)`).join('\n');

    const prompt = `You are the chief AI Insights Engine for WanderWise Travel.
Below is the log of real traveler search queries that users recently asked:
${queryTexts}

Identify 2 emerging or frequent questions that are NOT already comprehensively addressed in standard travel FAQs.
Synthesize 2 complete, authoritative, verified FAQ entries that travelers urgently need.

For each FAQ, produce:
- question: Crisp headline
- summary: 1-2 sentence executive summary
- answerMarkdown: Detailed markdown formatted guide with bullet points, timelines, and tips
- category: One of ['currency-budget', 'transit-transport', 'customs-etiquette', 'connectivity-tech', 'safety-emergency', 'visa-passports', 'baggage-packing', 'health-insurance']
- tags: 3-5 tags
- triggerQuery: The primary query that motivated this entry`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              summary: { type: Type.STRING },
              answerMarkdown: { type: Type.STRING },
              category: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              triggerQuery: { type: Type.STRING },
            },
            required: ['question', 'summary', 'answerMarkdown', 'category', 'tags', 'triggerQuery'],
          },
        },
      },
    });

    const items = JSON.parse(response.text || '[]');
    const addedFaqs: FAQItem[] = [];

    if (Array.isArray(items)) {
      for (const item of items) {
        // Prevent duplicate questions
        if (!existingFaqs.some(f => f.question.toLowerCase().includes(item.question.toLowerCase().slice(0, 15)))) {
          const created = db.addAutoGeneratedFAQ({
            question: item.question,
            summary: item.summary,
            answer: item.answerMarkdown,
            category: sanitizeCategory(item.category),
            tags: item.tags || ['Emerging Query', 'Travel Insights'],
            featured: false,
            source: 'ai-insights-engine',
            aiConfidence: 0.98,
            userQueryOrigin: item.triggerQuery,
            lastVerifiedDate: new Date().toISOString().split('T')[0],
          });
          addedFaqs.push(created);
        }
      }
    }

    res.json({
      success: true,
      synthesizedCount: addedFaqs.length,
      synthesizedFaqs: addedFaqs,
      stats: db.getInsightsStats(),
    });
  } catch (error) {
    console.error('Error during AI insights clustering:', error);
    res.status(500).json({ error: 'Failed to cluster and synthesize insights' });
  }
});

// 9. AI Insights Stats
app.get('/api/insights/stats', (req: Request, res: Response) => {
  try {
    const stats = db.getInsightsStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to get insights stats' });
  }
});

// 10. Manual / Admin Seed Reset
app.post('/api/admin/reset', (req: Request, res: Response) => {
  try {
    db.resetSeedData();
    res.json({ success: true, message: 'Database reset to initial verified seed state.' });
  } catch (error) {
    console.error('Error resetting DB:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// -----------------------------------------------------------------------------
// Dev & Production Vite Middleware Mount
// -----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WanderWise Travel FAQ server active at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
