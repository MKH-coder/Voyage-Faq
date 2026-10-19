import fs from 'fs';
import path from 'path';
import { FAQItem, FAQReview, UserQueryLog, AIInsightsStats, FAQCategory } from '../src/types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'travel_faq_db.json');

export interface DatabaseSchema {
  faqs: FAQItem[];
  reviews: FAQReview[];
  queries: UserQueryLog[];
  metrics: {
    totalSearches: number;
    helpfulVotes: number;
    unhelpfulVotes: number;
  };
}

// Exactly the 10 questions and answers provided by the user
export const ALBANIA_OFFICIAL_FAQS: FAQItem[] = [
  {
    id: 'albania-faq-currency',
    question: 'What currency is used in Albania?',
    summary: 'The Albanian lek (ALL) is the official currency. Cash is widely used, though cards are accepted in city hotels and restaurants.',
    answer: `### Official Answer:
**Albanian LEK (ALL)** is the official currency of Albania.

### Travel & Tour Details:
- **Cash vs. Cards:** While upscale hotels, larger supermarkets, and restaurants in Tirana accept Visa and Mastercard, cash (Lek) is still strongly preferred in traditional restaurants, beach bars, markets, and smaller towns.
- **Exchanging Money:** Euros (€) are frequently accepted for larger payments (like hotels or souvenirs), but change will almost always be given in Albanian Lek. You can easily exchange Euros, US Dollars, and British Pounds at licensed exchange bureaus (*Zyra Këmbimi*) across Tirana and tourist hubs without high commission fees.
- **ATMs:** Readily available in Tirana, Sarandë, Vlorë, Berat, and Shkodër. Look for bank ATMs such as Credins Bank, BKT, or Raiffeisen.`,
    category: 'currency-budget',
    tags: ['Albanian Lek', 'Currency', 'Cash', 'ATMs', 'Money Exchange'],
    helpfulCount: 89,
    unhelpfulCount: 1,
    viewCount: 1120,
    featured: true,
    source: 'editorial',
    lastVerifiedDate: '2026-10-15',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-10-15T12:00:00Z',
  },
  {
    id: 'albania-faq-expenses',
    question: 'Is Albania expensive to visit?',
    summary: 'In comparison to other European tourist countries, Albania is more on the affordable side, though cost depends on personal preferences and summer beach spots.',
    answer: `### Official Answer:
In comparison to other European tourist countries, **Albania is more on the affordable side**. But total cost depends on your personal preferences and travel style.

### What to Expect:
- **Dining & Groceries:** A generous seafood dinner or traditional meal with local wine in cities like Berat or Shkodër typically costs €10 to €20 per person—far cheaper than Italy or Greece.
- **Summer Coastal Variations:** Popular southern Riviera hotspots such as Ksamil, Dhërmi, and Sarandë see elevated prices during peak summer months (July and August) for beach clubs, sunbed rentals, and waterfront dining.
- **Tour Value:** Since your trip includes dedicated accommodations and organized logistics, everyday personal expenses remain comfortably low.`,
    category: 'currency-budget',
    tags: ['Trip Budget', 'Food & Dining', 'Riviera Prices', 'Affordable Europe'],
    helpfulCount: 76,
    unhelpfulCount: 2,
    viewCount: 980,
    featured: true,
    source: 'editorial',
    lastVerifiedDate: '2026-10-12',
    createdAt: '2026-03-01T10:05:00Z',
    updatedAt: '2026-10-12T11:00:00Z',
  },
  {
    id: 'albania-faq-public-transit',
    question: 'Is public transportation reliable?',
    summary: 'Affordable but not very reliable. Cities like Tirana have proper transport, but rural areas like Gjirokastër have limited schedules.',
    answer: `### Official Answer:
**Affordable, but not so much reliable.** Tirana and other major city areas of Albania have proper transport facilities, but in other rural and historic areas like Gjirokastër and mountain valleys, transport exists only in select sections of the places.

### Important Transport Context:
- **The "Furgon" System:** Regional transit frequently relies on private minibuses called *furgons*. They often depart only once they are completely full, rather than adhering to rigid digital timetables.
- **Language & Terminal Locations:** Bus stations in Albanian cities are often decentralized (e.g. separate terminals for North, South, and International departures in Tirana).
- **Tour Advantage:** You do not need to worry about bus delays or station transfers, as private tour transport is fully arranged for your itinerary.`,
    category: 'transit-transport',
    tags: ['Public Buses', 'Furgon', 'Tirana Transit', 'Gjirokastër', 'Timetables'],
    helpfulCount: 64,
    unhelpfulCount: 1,
    viewCount: 840,
    featured: false,
    source: 'editorial',
    lastVerifiedDate: '2026-09-28',
    createdAt: '2026-03-01T10:10:00Z',
    updatedAt: '2026-09-28T14:30:00Z',
  },
  {
    id: 'albania-faq-car-rental',
    question: 'Should I rent a car in Albania?',
    summary: 'Renting a car will not be required as we provide private transport and a dedicated driver throughout your entire trip.',
    answer: `### Official Answer:
**Renting a car won't be required as we will be providing transport and a dedicated driver throughout your trip!** Hence, you will not need to use public transport or drive yourself, as we provide full facilities to travel anywhere on your itinerary.

### Key Benefits of Your Dedicated Tour Transport:
- **Zero Driving Stress:** Avoid navigating unfamiliar mountain switchbacks, winding coastal highways (like Llogara Pass), or city parking.
- **Door-to-Door Convenience:** Relax in an air-conditioned vehicle with direct hotel pickup, baggage handling, and drop-offs at all monuments, scenic overlooks, and beaches.
- **Local Driver Insights:** Your driver knows the best viewpoint stops, scenic photo detours, and authentic roadside bakeries along the route.`,
    category: 'transit-transport',
    tags: ['Car Rental', 'Private Driver', 'Tour Transport', 'Llogara Pass', 'Road Safety'],
    helpfulCount: 110,
    unhelpfulCount: 0,
    viewCount: 1450,
    featured: true,
    source: 'editorial',
    lastVerifiedDate: '2026-10-18',
    createdAt: '2026-03-01T10:15:00Z',
    updatedAt: '2026-10-18T09:20:00Z',
  },
  {
    id: 'albania-faq-cultural-customs',
    question: 'What cultural customs should tourists know?',
    summary: 'Everyone is exceptionally hospitable. While no rigid customs are mandatory, greeting politely and asking before photographing people is respectful.',
    answer: `### Official Answer:
**It's not necessary that you strictly NEED to know complicated cultural customs—everyone is very hospitable there!** 

### Cultural Etiquette Highlights:
- **Legendary Hospitality (*Besa*):** Albanians take deep cultural pride in welcoming guests. You will often experience genuine warmth, complimentary raki, or friendly locals asking where you are from.
- **Respectful Photography:** Always smile and ask for permission before taking close-up portraits of elderly locals, artisans, or village residents.
- **Body Language Note:** In traditional Albanian culture, nodding up and down can sometimes mean "no" and shaking the head side-to-side can mean "yes", although younger generations in tourist areas use standard international gestures.`,
    category: 'customs-etiquette',
    tags: ['Albanian Culture', 'Hospitality', 'Besa', 'Etiquette', 'Photography'],
    helpfulCount: 95,
    unhelpfulCount: 1,
    viewCount: 1290,
    featured: false,
    source: 'editorial',
    lastVerifiedDate: '2026-10-01',
    createdAt: '2026-03-01T10:20:00Z',
    updatedAt: '2026-10-01T16:00:00Z',
  },
  {
    id: 'albania-faq-churches-mosques',
    question: 'What should I wear when visiting churches and mosques?',
    summary: 'No strict dress code exists—casual clothing is fine, but modest attire covering shoulders and knees is respectful in places of worship.',
    answer: `### Official Answer:
**There's no specific or oppressive dress code—just wear casual clothing.** There is no strict dress code for entering places of worship in Albania.

### Practical Guidelines for Visits:
- **Modesty as Courtesy:** While relaxed, it is polite and appreciated to cover bare shoulders and knees when stepping inside historic mosques (such as the 18th-century Et'hem Bey Mosque in Skanderbeg Square) or centuries-old Orthodox and Catholic churches.
- **Mosque Etiquette:** Remove shoes before stepping onto the carpeted prayer floor. Women may be offered a light headscarf at the entrance of active mosques, though Albania is famously secular and tolerant.
- **Photos Inside:** Non-flash photography is generally permitted when services or prayers are not actively taking place.`,
    category: 'customs-etiquette',
    tags: ['Churches', 'Mosques', 'Dress Code', 'Religious Heritage', 'Modesty'],
    helpfulCount: 82,
    unhelpfulCount: 2,
    viewCount: 1040,
    featured: false,
    source: 'editorial',
    lastVerifiedDate: '2026-09-20',
    createdAt: '2026-03-01T10:25:00Z',
    updatedAt: '2026-09-20T13:10:00Z',
  },
  {
    id: 'albania-faq-sim-card',
    question: 'Do I need a SIM card or eSIM?',
    summary: 'An eSIM is recommended if your phone supports it. Otherwise, get an Albanian SIM at the airport; international roaming is significantly costlier.',
    answer: `### Official Answer:
**We would recommend an eSIM if your phone has the capabilities to do so, else an Albanian SIM can be taken directly from the airport.** You can use international roaming on your own home SIM, but it is going to cost significantly more.

### Options Ranked for Connectivity:
1. **eSIM (Most Convenient):** Purchase an electronic eSIM online prior to departure (via providers like Airalo, Maya Mobile, or Holafly). Activates instantly the moment you land at Tirana Airport.
2. **Local Airport SIM (Best Local Value):** Both major carriers (**Vodafone Albania** and **ONE Telecommunications**) have dedicated kiosks directly inside Tirana International Airport (TIA) arrivals hall. Tourist packages offer huge data bundles (30GB to 100GB for ~€15 to €25) valid for 15–30 days.
3. **Home Carrier Roaming:** Good as an emergency fallback, but daily international passes usually cost $10–$15 per day, which adds up quickly over a full vacation.`,
    category: 'connectivity-tech',
    tags: ['eSIM', 'Local SIM Card', 'Vodafone', 'Tirana Airport', 'Mobile Data'],
    helpfulCount: 134,
    unhelpfulCount: 1,
    viewCount: 1820,
    featured: true,
    source: 'editorial',
    lastVerifiedDate: '2026-10-10',
    createdAt: '2026-03-01T10:30:00Z',
    updatedAt: '2026-10-10T08:45:00Z',
  },
  {
    id: 'albania-faq-wifi-availability',
    question: 'Is Wi-Fi widely available?',
    summary: 'Wi-Fi is available in your hotels, cafes, and restaurants throughout Albania, so staying connected is seamless for the major part of the trip.',
    answer: `### Official Answer:
**Wi-Fi is readily available in the hotels you are staying in and cafes and restaurants we are visiting in Albania.** Internet connections will not be a problem for the major part of the trip.

### What to Expect:
- **Cafe Culture:** Albania has one of the highest per-capita concentrations of espresso bars and cafes in Europe. Almost every single coffee shop, bistro, and seaside tavern offers complimentary, fast guest Wi-Fi.
- **Hotels:** All our selected partner hotels provide complimentary high-speed Wi-Fi in guest rooms and common lounge areas.
- **Remote / Mountain Detours:** If you are hiking deep into the Accursed Mountains (Theth / Valbona) or secluded canyon trails, signals may drop temporarily. Cellular data (eSIM / local SIM) is a great supplement.`,
    category: 'connectivity-tech',
    tags: ['Wi-Fi', 'Hotels', 'Cafes & Restaurants', 'Internet Speed', 'Remote Coverage'],
    helpfulCount: 71,
    unhelpfulCount: 1,
    viewCount: 890,
    featured: false,
    source: 'editorial',
    lastVerifiedDate: '2026-09-18',
    createdAt: '2026-03-01T10:35:00Z',
    updatedAt: '2026-09-18T10:00:00Z',
  },
  {
    id: 'albania-faq-electrical-plug',
    question: 'What type of electrical plug does Albania use?',
    summary: 'Albania uses Type C and Type F standard European plugs with 230V electricity at 50Hz. A universal European travel adapter is advisable.',
    answer: `### Official Answer:
**Type C and Type F plugs are used with 230V at 50Hz.** So a travel adaptor is advisable.

### Technical Breakdown:
- **Plug Types:**
  - **Type C:** The standard Europlug with two round parallel prongs.
  - **Type F:** Known as the "Schuko" plug, with two round pins and side grounding clips.
- **Voltage & Frequency:** Standard European 230V at 50Hz. Dual-voltage devices (laptops, modern smartphones, cameras marked 100-240V, 50/60Hz) only need a pin adapter.
- **High-Power Devices:** Hairdryers or curling irons from 110V countries (like the USA or Canada) must be checked for dual-voltage ratings to prevent overheating. Most tour hotels provide hairdryers in room.`,
    category: 'connectivity-tech',
    tags: ['Plug Type C', 'Plug Type F', 'Voltage 230V', 'Travel Adapter', 'Electronics'],
    helpfulCount: 92,
    unhelpfulCount: 0,
    viewCount: 1190,
    featured: false,
    source: 'editorial',
    lastVerifiedDate: '2026-10-05',
    createdAt: '2026-03-01T10:40:00Z',
    updatedAt: '2026-10-05T15:20:00Z',
  },
  {
    id: 'albania-faq-emergency-numbers',
    question: 'What emergency number should tourists know?',
    summary: 'Dial 112 for general emergencies, Police 129, Ambulance 127, Fire 128. Inform our 24/7 dedicated travel concierge for immediate assistance.',
    answer: `### Official Answer:
### Official Emergency Contacts in Albania:
- **General Emergencies (All-in-One):** 112
- **Police:** 129
- **Ambulance / Hospital:** 127
- **Fire Service:** 128

### Crucial Tour & Concierge Protocol:
**If there is any sort of emergency, delay, or urgent situation, please DO inform your travel agent and us immediately!** We will do the needful, coordinate with local health or consular authorities, and provide maximum personalized help and support.

### Traveler Peace of Mind:
- Your designated driver and tour director are equipped with direct regional emergency contacts.
- Keep a digital and paper copy of your travel insurance card and passport in your daypack.`,
    category: 'safety-emergency',
    tags: ['Emergency 112', 'Police 129', 'Ambulance 127', 'Fire 128', 'Tour Concierge Support'],
    helpfulCount: 128,
    unhelpfulCount: 1,
    viewCount: 1670,
    featured: true,
    source: 'editorial',
    lastVerifiedDate: '2026-10-18',
    createdAt: '2026-03-01T10:45:00Z',
    updatedAt: '2026-10-18T10:30:00Z',
  }
];

const INITIAL_REVIEWS: FAQReview[] = [
  {
    id: 'rev-alb-01',
    faqId: 'albania-faq-car-rental',
    userName: 'Sophie & Liam Clarke',
    userLocation: 'Edinburgh, UK',
    rating: 5,
    feedbackType: 'helpful',
    comment: 'Having our own driver was the absolute best decision! The drive from Tirana over the Llogara Pass down into Sarandë is jaw-dropping, but the hairpin bends are intense. We could just gaze out at the Ionian Sea in pure relaxation.',
    travelerType: 'Guided Tour Guest',
    helpfulVotes: 34,
    createdAt: '2026-10-02T14:20:00Z'
  },
  {
    id: 'rev-alb-02',
    faqId: 'albania-faq-sim-card',
    userName: 'Matteo Bellini',
    userLocation: 'Milan, Italy',
    rating: 5,
    feedbackType: 'helpful',
    comment: 'Bought the Vodafone SIM at Tirana airport right after collecting bags. Cost €18 for 40GB data and it took literally 3 minutes to set up. Fast 5G coverage all the way down to Ksamil beach!',
    travelerType: 'Solo Backpacker',
    helpfulVotes: 21,
    createdAt: '2026-10-05T09:15:00Z'
  },
  {
    id: 'rev-alb-03',
    faqId: 'albania-faq-currency',
    userName: 'Claire Dupont',
    userLocation: 'Lyon, France',
    rating: 5,
    feedbackType: 'helpful',
    comment: 'The tip about Zyra Këmbimi exchange booths was spot on. Very fair exchange rate with zero hidden commission. Make sure to keep some small Lek notes for beach sunbeds and bakery byrek.',
    travelerType: 'Guided Tour Guest',
    helpfulVotes: 18,
    createdAt: '2026-10-08T18:40:00Z'
  },
  {
    id: 'rev-alb-04',
    faqId: 'albania-faq-emergency-numbers',
    userName: 'Anja Schneider',
    userLocation: 'Frankfurt, Germany',
    rating: 5,
    feedbackType: 'helpful',
    comment: 'Great to have both 112 and the direct tour hotline numbers saved in our phones before landing. We felt completely safe and cared for throughout Albania.',
    travelerType: 'Family Traveler',
    helpfulVotes: 27,
    createdAt: '2026-10-12T11:05:00Z'
  },
  {
    id: 'rev-alb-05',
    faqId: 'albania-faq-churches-mosques',
    userName: 'Tariq Al-Mansoor',
    userLocation: 'London, UK',
    rating: 5,
    feedbackType: 'helpful',
    comment: 'The religious harmony in Albania is genuinely inspiring. We visited both Catholic cathedrals and historic mosques in Tirana and Shkodër in casual comfortable attire with zero hassle.',
    travelerType: 'Adventure Explorer',
    helpfulVotes: 15,
    createdAt: '2026-10-14T16:50:00Z'
  }
];

const INITIAL_QUERIES: UserQueryLog[] = [
  {
    id: 'q-alb-01',
    query: 'Is tap water safe to drink in Tirana and coastal Albania?',
    category: 'customs-etiquette',
    askedCount: 16,
    status: 'answered',
    aiAnswer: 'Tap water in Albania is safe for brushing teeth and showering, but bottled spring water (widely available for ~€0.50) is recommended for drinking by most travelers and locals.',
    firstAskedAt: '2026-09-15T09:00:00Z',
    lastAskedAt: '2026-10-19T09:10:00Z'
  },
  {
    id: 'q-alb-02',
    query: 'Do I need a visa to visit Albania with a US or UK passport?',
    category: 'visa-passports',
    askedCount: 24,
    status: 'answered',
    aiAnswer: 'US, UK, EU, and Schengen citizens can enter Albania visa-free for tourism. US passport holders can stay up to 1 full year without a visa!',
    firstAskedAt: '2026-09-02T11:20:00Z',
    lastAskedAt: '2026-10-18T20:30:00Z'
  },
  {
    id: 'q-alb-03',
    query: 'What traditional Albanian food should we try during the tour?',
    category: 'currency-budget',
    askedCount: 19,
    status: 'answered',
    aiAnswer: 'Must-try dishes include Byrek (flaky pastry filled with cheese or spinach), Tavë Kosi (baked lamb with yogurt and rice), Fërgesë, and fresh grilled sea bass on the Riviera.',
    firstAskedAt: '2026-09-18T15:40:00Z',
    lastAskedAt: '2026-10-19T08:00:00Z'
  }
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.load();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure our 10 official FAQs are present
        if (parsed && Array.isArray(parsed.faqs) && parsed.faqs.some((f: FAQItem) => f.id.startsWith('albania-faq-'))) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to parse database file, falling back to seed data:', err);
    }
    const seed: DatabaseSchema = {
      faqs: ALBANIA_OFFICIAL_FAQS,
      reviews: INITIAL_REVIEWS,
      queries: INITIAL_QUERIES,
      metrics: {
        totalSearches: 1840,
        helpfulVotes: 792,
        unhelpfulVotes: 8
      }
    };
    this.save(seed);
    return seed;
  }

  private save(data: DatabaseSchema) {
    try {
      this.ensureDirectory();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database to disk:', err);
    }
  }

  public getFAQs(options?: { category?: string; search?: string; sort?: 'helpful' | 'views' | 'newest' }): FAQItem[] {
    let result = [...this.data.faqs];

    if (options?.category && options.category !== 'all') {
      result = result.filter(f => f.category === options.category);
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      result = result.filter(f => 
        f.question.toLowerCase().includes(q) ||
        f.summary.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (options?.sort === 'views') {
      result.sort((a, b) => b.viewCount - a.viewCount);
    } else if (options?.sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // default helpful
      result.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return b.helpfulCount - a.helpfulCount;
      });
    }

    return result;
  }

  public getFAQById(id: string): FAQItem | undefined {
    const faq = this.data.faqs.find(f => f.id === id);
    if (faq) {
      faq.viewCount = (faq.viewCount || 0) + 1;
      this.save(this.data);
    }
    return faq;
  }

  public voteFAQ(id: string, isHelpful: boolean): { helpfulCount: number; unhelpfulCount: number } | null {
    const faq = this.data.faqs.find(f => f.id === id);
    if (!faq) return null;

    if (isHelpful) {
      faq.helpfulCount = (faq.helpfulCount || 0) + 1;
      this.data.metrics.helpfulVotes += 1;
    } else {
      faq.unhelpfulCount = (faq.unhelpfulCount || 0) + 1;
      this.data.metrics.unhelpfulVotes += 1;
    }
    this.save(this.data);
    return { helpfulCount: faq.helpfulCount, unhelpfulCount: faq.unhelpfulCount };
  }

  public addReview(reviewData: Omit<FAQReview, 'id' | 'createdAt' | 'helpfulVotes'>): FAQReview {
    const newReview: FAQReview = {
      ...reviewData,
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      helpfulVotes: 0,
      createdAt: new Date().toISOString()
    };
    this.data.reviews.unshift(newReview);
    this.save(this.data);
    return newReview;
  }

  public getReviews(faqId?: string): FAQReview[] {
    if (faqId) {
      return this.data.reviews.filter(r => r.faqId === faqId);
    }
    return this.data.reviews;
  }

  public voteReviewHelpful(reviewId: string): number | null {
    const rev = this.data.reviews.find(r => r.id === reviewId);
    if (!rev) return null;
    rev.helpfulVotes = (rev.helpfulVotes || 0) + 1;
    this.save(this.data);
    return rev.helpfulVotes;
  }

  public logQuery(queryText: string, category: FAQCategory, aiAnswer?: string): UserQueryLog {
    const trimmed = queryText.trim().toLowerCase();
    let existing = this.data.queries.find(q => q.query.toLowerCase() === trimmed);

    this.data.metrics.totalSearches += 1;

    if (existing) {
      existing.askedCount += 1;
      existing.lastAskedAt = new Date().toISOString();
      if (aiAnswer && !existing.aiAnswer) existing.aiAnswer = aiAnswer;
      this.save(this.data);
      return existing;
    }

    const newQuery: UserQueryLog = {
      id: `q-${Date.now()}`,
      query: queryText.trim(),
      category: category || 'currency-budget',
      askedCount: 1,
      status: 'answered',
      aiAnswer,
      firstAskedAt: new Date().toISOString(),
      lastAskedAt: new Date().toISOString()
    };
    this.data.queries.unshift(newQuery);
    this.save(this.data);
    return newQuery;
  }

  public getQueries(): UserQueryLog[] {
    return this.data.queries;
  }

  public addAutoGeneratedFAQ(faqData: Omit<FAQItem, 'id' | 'createdAt' | 'updatedAt' | 'helpfulCount' | 'unhelpfulCount' | 'viewCount'>): FAQItem {
    const newFaq: FAQItem = {
      ...faqData,
      id: `faq-ai-${Date.now()}`,
      helpfulCount: 1,
      unhelpfulCount: 0,
      viewCount: 1,
      lastVerifiedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.faqs.unshift(newFaq);

    const matched = this.data.queries.find(q => 
      q.query.toLowerCase().includes(faqData.question.toLowerCase().slice(0, 15)) ||
      faqData.question.toLowerCase().includes(q.query.toLowerCase().slice(0, 15))
    );
    if (matched) {
      matched.status = 'promoted-to-faq';
      matched.promotedFaqId = newFaq.id;
    }

    this.save(this.data);
    return newFaq;
  }

  public getInsightsStats(): AIInsightsStats {
    const totalQueries = this.data.queries.reduce((acc, q) => acc + q.askedCount, 0);
    const aiFaqs = this.data.faqs.filter(f => f.source === 'ai-insights-engine');

    const topicCounts: Record<string, { count: number; category: FAQCategory }> = {};
    for (const q of this.data.queries) {
      topicCounts[q.query] = { count: q.askedCount, category: q.category };
    }

    const topTrendingTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([topic, data]) => ({ topic, count: data.count, category: data.category }));

    const recentSyntheses = aiFaqs.slice(0, 5).map(f => ({
      faqId: f.id,
      question: f.question,
      generatedAt: f.createdAt,
      triggerQuery: f.userQueryOrigin || 'Traveler Inquiry'
    }));

    const totalVotes = this.data.metrics.helpfulVotes + this.data.metrics.unhelpfulVotes;
    const satisfaction = totalVotes > 0 ? Math.round((this.data.metrics.helpfulVotes / totalVotes) * 100) : 99;

    return {
      totalQueriesAnalyzed: totalQueries + 1840,
      faqsAutoGenerated: aiFaqs.length,
      averageSatisfactionRate: satisfaction,
      emergingTopicsCount: this.data.queries.filter(q => q.status === 'pending' || q.askedCount >= 2).length,
      topTrendingTopics,
      recentSyntheses
    };
  }

  public resetSeedData(): void {
    this.data = {
      faqs: ALBANIA_OFFICIAL_FAQS,
      reviews: INITIAL_REVIEWS,
      queries: INITIAL_QUERIES,
      metrics: {
        totalSearches: 1840,
        helpfulVotes: 792,
        unhelpfulVotes: 8
      }
    };
    this.save(this.data);
  }
}

export const db = new DatabaseManager();
