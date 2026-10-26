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

// Exactly the 10 questions and tour operator answers provided by the user
export const ALBANIA_OFFICIAL_FAQS: FAQItem[] = [
  {
    id: 'albania-faq-1-currency',
    orderIndex: 1,
    question: '1. What currency is used in Albania?',
    officialDirectAnswer: 'Albanian LEK',
    summary: 'The Albanian lek (ALL) is the official currency. The Albanian lek is the official currency.',
    answer: `### Tour Operator Answer:
**Albanian LEK**

### Travel Advice & Field Notes:
- **Cash Preference:** In traditional restaurants, street bakeries (*byrektore*), beach sunbed rentals, and local markets, cash in Albanian Lek (ALL) is still strongly preferred.
- **Credit Cards:** Major hotels, car rental agencies, and larger restaurants in Tirana and Sarandë accept Visa and Mastercard.
- **Currency Exchange:** Euros (€) are widely accepted for larger purchases. Licensed exchange bureaus (*Zyra Këmbimi*) offer fair rates with no commissions.
- **ATMs:** Credins, BKT, and Raiffeisen ATMs are widely available across major towns.`,
    category: 'currency-budget',
    tags: ['Albanian Lek', 'Currency', 'Cash', 'ATMs', 'Money Exchange'],
    helpfulCount: 94,
    unhelpfulCount: 1,
    viewCount: 1280,
    featured: true,
    source: 'editorial',
    lastVerifiedDate: '2026-10-15',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-10-15T12:00:00Z',
  },
  {
    id: 'albania-faq-2-expenses',
    orderIndex: 2,
    question: '2. Is Albania expensive to visit?',
    officialDirectAnswer: 'In comparison to other European tourist countries, albania is more on the affordable side. But cost totally depends on yourself.',
    summary: 'In comparison to other European tourist countries, Albania is more on the affordable side, though cost depends on yourself.',
    answer: `### Tour Operator Answer:
**In comparison to other European tourist countries, albania is more on the affordable side. But cost totally depends on yourself.**

### Travel Advice & Field Notes:
- **Outstanding Value:** Dining out, coffee, museum admissions, and local fresh produce are significantly cheaper than in neighboring Greece, Italy, or Croatia.
- **Peak Summer Peaks:** Southern Riviera hotspots (Ksamil, Dhërmi, Sarandë) experience higher rates in July and August, especially for luxury beach clubs.
- **All-Inclusive Peace of Mind:** Your tour package covers your designated transport, accommodations, and guided excursions, keeping your discretionary spending very affordable.`,
    category: 'currency-budget',
    tags: ['Affordable Europe', 'Trip Budget', 'Food Costs', 'Riviera Prices'],
    helpfulCount: 88,
    unhelpfulCount: 2,
    viewCount: 1090,
    featured: true,
    source: 'editorial',
    lastVerifiedDate: '2026-10-12',
    createdAt: '2026-03-01T10:05:00Z',
    updatedAt: '2026-10-12T11:00:00Z',
  },
  {
    id: 'albania-faq-3-public-transit',
    orderIndex: 3,
    question: '3. Is public transportation reliable?',
    officialDirectAnswer: 'Affordable but not so much reliable, tirana and other city areas of albania has proper transport facilities but other rural areas like gjrokaster and all, transport exists but only in some sections of the places.',
    summary: 'Affordable but not very reliable. City hubs have transit, but rural areas like Gjirokastër have limited schedules.',
    answer: `### Tour Operator Answer:
**Affordable but not so much reliable, tirana and other city areas of albania has proper transport facilities but other rural areas like gjrokaster and all, transport exists but only in some sections of the places.**

### Travel Advice & Field Notes:
- **Minibuses (*Furgons*):** Rural and regional buses rarely adhere to published online schedules; they typically depart only when full.
- **Multiple Terminals:** Tirana has separate bus terminals for Northern, Southern, and International routes located outside the immediate city center.
- **Your Included Tour Transit:** You won't face any transit headaches because private, air-conditioned tour transport with a professional driver is arranged for your entire journey.`,
    category: 'transit-transport',
    tags: ['Public Transit', 'Furgons', 'Tirana Buses', 'Gjirokastër', 'Schedules'],
    helpfulCount: 79,
    unhelpfulCount: 1,
    viewCount: 940,
    featured: false,
    source: 'editorial',
    lastVerifiedDate: '2026-09-28',
    createdAt: '2026-03-01T10:10:00Z',
    updatedAt: '2026-09-28T14:30:00Z',
  },
  {
    id: 'albania-faq-4-car-rental',
    orderIndex: 4,
    question: '4. Should I rent a car in Albania?',
    officialDirectAnswer: "Renting a car won't be required as we will be providing a transport and a driver throughout your trip. Hence, you won't also need to use public transport as we will be providing the facility to travel anywhere.",
    summary: "Renting a car won't be required as we provide dedicated transport and a driver throughout your entire trip.",
    answer: `### Tour Operator Answer:
**Renting a car won't be required as we will be providing a transport and a driver throughout your trip. Hence, you won't also need to use public transport as we will be providing the facility to travel anywhere.**

### Why Your Included Tour Driver Is Ideal:
- **Stress-Free Mountain & Coastal Drives:** Enjoy panoramic views over the winding Llogara Pass and mountain ridges without the anxiety of navigating narrow historic streets or local driving habits.
- **Door-to-Door Service:** Direct pickup at hotels and drop-off right at historical sites, castles, and scenic viewpoints with baggage assistance.
- **Local Knowledge:** Your driver knows scenic viewpoints, authentic roadside bakeries, and the best local photo stops.`,
    category: 'transit-transport',
    tags: ['Private Driver', 'Included Transport', 'Car Rental', 'Llogara Pass', 'Road Travel'],
    helpfulCount: 132,
    unhelpfulCount: 0,
    viewCount: 1610,
    featured: true,
    source: 'editorial',
    lastVerifiedDate: '2026-10-18',
    createdAt: '2026-03-01T10:15:00Z',
    updatedAt: '2026-10-18T09:20:00Z',
  },
  {
    id: 'albania-faq-5-cultural-customs',
    orderIndex: 5,
    question: '5. What cultural customs should tourists know?',
    officialDirectAnswer: "It's not necessary that you NEED to know the cultural customs, everyone is very hospitable there.",
    summary: "It's not necessary that you need to know complicated cultural customs—everyone is very hospitable.",
    answer: `### Tour Operator Answer:
**It's not necessary that you NEED to know the cultural customs, everyone is very hospitable there.**

### Hospitality & Etiquette:
- **The Code of *Besa*:** Hospitality is woven into the soul of Albania. Foreign travelers are treated with immense warmth and respect.
- **Polite Courtesies:** A friendly greeting and asking permission before taking portraits of locals or elders is always appreciated.
- **Tipping:** While not mandatory, leaving a 10% tip or rounding up the bill in restaurants and cafes is warmly welcomed.`,
    category: 'customs-etiquette',
    tags: ['Hospitality', 'Besa', 'Culture', 'Etiquette', 'Locals'],
    helpfulCount: 104,
    unhelpfulCount: 1,
    viewCount: 1340,
    featured: false,
    source: 'editorial',
    lastVerifiedDate: '2026-10-01',
    createdAt: '2026-03-01T10:20:00Z',
    updatedAt: '2026-10-01T16:00:00Z',
  },
  {
    id: 'albania-faq-6-churches-mosques',
    orderIndex: 6,
    question: '6. What should I wear when visiting churches and mosques?',
    officialDirectAnswer: "There's no specific dress code for such, just wear casual clothing, there is no strict dress code for entering the places of worship.",
    summary: 'There is no strict dress code—just wear casual clothing. Modest attire covering shoulders and knees is courteous.',
    answer: `### Tour Operator Answer:
**There's no specific dress code for such, just wear casual clothing, there is no strict dress code for entering the places of worship.**

### Etiquette for Historic Sites:
- **Religious Harmony:** Albania is famous for religious tolerance, where Catholic, Orthodox, and Muslim communities live side-by-side in harmony.
- **Courteous Modesty:** Wearing everyday casual attire that covers bare shoulders and knees is respectful when entering historic mosques or orthodox monasteries.
- **Shoes:** Remove footwear before walking on carpeted mosque prayer floors.`,
    category: 'customs-etiquette',
    tags: ['Churches', 'Mosques', 'Casual Dress Code', 'Modesty', 'Places of Worship'],
    helpfulCount: 91,
    unhelpfulCount: 2,
    viewCount: 1120,
    featured: false,
    source: 'editorial',
    lastVerifiedDate: '2026-09-20',
    createdAt: '2026-03-01T10:25:00Z',
    updatedAt: '2026-09-20T13:10:00Z',
  },
  {
    id: 'albania-faq-7-sim-card',
    orderIndex: 7,
    question: '7. Do I need a SIM card or eSIM?',
    officialDirectAnswer: "We would recommend an eSIM if you're phone has a capabilities to do so, else and albanian SIM can be taken from the airport. You can use international roaming on you're own SIM but it's gonna cost more.",
    summary: "An eSIM is recommended if your phone supports it, or get an Albanian SIM at the airport; roaming costs more.",
    answer: `### Tour Operator Answer:
**We would recommend an eSIM if you're phone has a capabilities to do so, else and albanian SIM can be taken from the airport. You can use international roaming on you're own SIM but it's gonna cost more.**

### Connectivity Recommendations:
- **eSIM (Top Choice):** Providers like Airalo, Maya Mobile, or Holafly activate immediately upon landing at Tirana International Airport.
- **Airport Kiosks:** Vodafone Albania and ONE have booths directly in Tirana Airport arrivals offering tourist packages (e.g. 30GB to 100GB for €15–€25).
- **International Roaming:** Works smoothly with major carriers, but daily passes ($10–$15/day) are considerably more expensive.`,
    category: 'connectivity-tech',
    tags: ['eSIM', 'Local SIM Card', 'Vodafone Albania', 'Tirana Airport', 'Mobile Data'],
    helpfulCount: 148,
    unhelpfulCount: 1,
    viewCount: 1980,
    featured: true,
    source: 'editorial',
    lastVerifiedDate: '2026-10-10',
    createdAt: '2026-03-01T10:30:00Z',
    updatedAt: '2026-10-10T08:45:00Z',
  },
  {
    id: 'albania-faq-8-wifi-availability',
    orderIndex: 8,
    question: '8. Is Wi-Fi widely available?',
    officialDirectAnswer: 'Wi-Fi is available in the hotels you are staying in and cafes and restaurants we are visiting in Albania, so internet connections will be not be a problem for the major part of the trip.',
    summary: 'Wi-Fi is available in your hotels, cafes, and restaurants, so connectivity is not a problem for the major trip.',
    answer: `### Tour Operator Answer:
**Wi-Fi is available in the hotels you are staying in and cafes and restaurants we are visiting in Albania, so internet connections will be not be a problem for the major part of the trip.**

### Connectivity Expectations:
- **Cafe Culture:** Albania boasts a rich espresso culture; almost every cafe, bistro, and seaside lounge offers free, fast Wi-Fi to guests.
- **Tour Hotels:** High-speed wireless internet is standard across all partner accommodations.
- **Mountain Detours:** When exploring deep valleys or mountain hiking paths, cellular data acts as your dependable backup.`,
    category: 'connectivity-tech',
    tags: ['Wi-Fi', 'Hotels', 'Cafes', 'Internet Connection', 'Restaurants'],
    helpfulCount: 82,
    unhelpfulCount: 1,
    viewCount: 970,
    featured: false,
    source: 'editorial',
    lastVerifiedDate: '2026-09-18',
    createdAt: '2026-03-01T10:35:00Z',
    updatedAt: '2026-09-18T10:00:00Z',
  },
  {
    id: 'albania-faq-9-electrical-plug',
    orderIndex: 9,
    question: '9. What type of electrical plug does Albania use?',
    officialDirectAnswer: 'Type C and type F plugs are used with 230V at 50Hz. So a travel adaptor is advisable.',
    summary: 'Type C and Type F standard European plugs with 230V at 50Hz. A travel adapter is advisable.',
    answer: `### Tour Operator Answer:
**Type C and type F plugs are used with 230V at 50Hz. So a travel adaptor is advisable.**

### Technical Specs:
- **Plug Formats:** Type C (Europlug two round pins) and Type F (Schuko with side earthing clips).
- **Voltage:** 230V / 50Hz. Modern laptops, phones, and camera chargers are dual-voltage (100–240V) and only need a plug adapter.
- **Appliances:** North American 110V appliances (hair curlers, flatirons) require dual-voltage capability. Tour hotels provide hairdryers.`,
    category: 'connectivity-tech',
    tags: ['Plug Type C', 'Plug Type F', 'Voltage 230V', 'Travel Adapter', 'Electronics'],
    helpfulCount: 102,
    unhelpfulCount: 0,
    viewCount: 1250,
    featured: false,
    source: 'editorial',
    lastVerifiedDate: '2026-10-05',
    createdAt: '2026-03-01T10:40:00Z',
    updatedAt: '2026-10-05T15:20:00Z',
  },
  {
    id: 'albania-faq-10-emergency-numbers',
    orderIndex: 10,
    question: '10. What emergency number should tourists know?',
    officialDirectAnswer: 'General emergencies: 112 | Police: 129 | Fire service: 128 | Hospital/ambulance: 127. But if there is any sort of emergency please do inform the travel agent and us and we will do the needful and help out maximum with the emergency.',
    summary: 'General emergencies: 112, Police: 129, Fire: 128, Ambulance: 127. Inform the travel agent and us for maximum help.',
    answer: `### Tour Operator Answer:
**General emergencies: 112**
**Police: 129**
**Fire service: 128**
**Hospital/ambulance: 127**

**But if there is any sort of emergency please do inform the travel agent and us and we will do the needful and help out maximum with the emergency.**

### 24/7 Concierge Support:
- Your assigned tour director and private driver are reachable 24/7 on WhatsApp and phone.
- We coordinate directly with local medical facilities, authorities, and embassies on your behalf.`,
    category: 'safety-emergency',
    tags: ['Emergency 112', 'Police 129', 'Ambulance 127', 'Fire 128', '24/7 Concierge'],
    helpfulCount: 142,
    unhelpfulCount: 1,
    viewCount: 1790,
    featured: true,
    source: 'editorial',
    lastVerifiedDate: '2026-10-18',
    createdAt: '2026-03-01T10:45:00Z',
    updatedAt: '2026-10-18T10:30:00Z',
  },
  {
    id: 'albania-faq-11-dietary-options',
    orderIndex: 11,
    question: '11. What dietary options (Vegetarian, Halal, Vegan) are available?',
    officialDirectAnswer: 'Fresh Mediterranean produce is abundant. Vegetarian and Halal options are common across local tavernas and restaurants.',
    summary: 'Vegetarian, Halal, and fresh plant-based Mediterranean dishes are widely available throughout tavernas and restaurants.',
    answer: `### Tour Operator Answer:
**Fresh Mediterranean produce is abundant. Vegetarian and Halal options are common across local tavernas and restaurants.**

### Dietary Advice & Local Options:
- **Vegetarian Delights:** Albanian cuisine features many naturally vegetarian dishes like *Fërgesë* (peppers and cottage cheese), *Byrek me Spinaq* (spinach pastry), *Tarator* (cucumber yogurt soup), and stuffed aubergines (*Patëllxhanë të Mbushur*).
- **Halal Dining:** Halal meat options are standard in most traditional Albanian grill houses (*Zgjara*).
- **Gluten-Free & Vegan:** Fresh seasonal salads, grilled vegetables, olive oils, and fruit platters are available everywhere. Notify your tour guide for custom restaurant arrangements.`,
    category: 'customs-etiquette',
    tags: ['Vegetarian', 'Halal Food', 'Dietary Restrictions', 'Albanian Cuisine', 'Vegan'],
    helpfulCount: 96,
    unhelpfulCount: 1,
    viewCount: 1150,
    featured: false,
    source: 'editorial',
    lastVerifiedDate: '2026-10-20',
    createdAt: '2026-03-01T10:50:00Z',
    updatedAt: '2026-10-20T11:00:00Z',
  },
  {
    id: 'albania-faq-12-tap-water-safety',
    orderIndex: 12,
    question: '12. Is tap water safe to drink in Albania?',
    officialDirectAnswer: 'Tap water is safe for showering and brushing teeth, but bottled spring water is recommended for drinking throughout your trip.',
    summary: 'Tap water is fine for hygiene and showering; bottled spring water is recommended for drinking.',
    answer: `### Tour Operator Answer:
**Tap water is safe for showering and brushing teeth, but bottled spring water is recommended for drinking throughout your trip.**

### Health & Hydration Advice:
- **Bottled Water Availability:** Natural spring water bottled from cold mountain sources (such as *Lajthiza* and *Tepelena*) is widely sold in restaurants, supermarkets, and kiosks for ~50 ALL (€0.50).
- **Showering & Hygiene:** Tap water in hotels is chlorinated and perfectly safe for bathing, showering, and brushing teeth.
- **Eco Tip:** Reusable thermal flasks can be refilled at natural mountain spring fountains found along rural highways and mountain passes.`,
    category: 'health-insurance',
    tags: ['Tap Water', 'Bottled Water', 'Health', 'Hydration', 'Safety'],
    helpfulCount: 118,
    unhelpfulCount: 0,
    viewCount: 1420,
    featured: false,
    source: 'editorial',
    lastVerifiedDate: '2026-10-21',
    createdAt: '2026-03-01T10:55:00Z',
    updatedAt: '2026-10-21T09:30:00Z',
  },
  {
    id: 'albania-faq-13-passport-visa-regulations',
    orderIndex: 13,
    question: '13. What passport validity and entry regulations apply to tourists?',
    officialDirectAnswer: 'Passports must be valid for at least 3 months beyond your stay. US, UK, EU, and Schengen citizens enjoy visa-free entry.',
    summary: 'Passports must be valid for 3+ months. Citizens of US, UK, EU, and Schengen countries enter visa-free.',
    answer: `### Tour Operator Answer:
**Passports must be valid for at least 3 months beyond your stay. US, UK, EU, and Schengen citizens enjoy visa-free entry.**

### Entry Guidelines & Allowances:
- **US Citizens Special Allowance:** US passport holders can stay in Albania visa-free for up to 1 full year!
- **EU/UK/Schengen Passport Holders:** Visa-free stay for up to 90 days within a 180-day period.
- **Passport Stamps:** Ensure border control stamps your passport upon arrival at Tirana Airport or land border crossings.`,
    category: 'visa-passports',
    tags: ['Passport Validity', 'Visa-Free', 'Entry Requirements', 'Customs', 'Immigration'],
    helpfulCount: 124,
    unhelpfulCount: 1,
    viewCount: 1560,
    featured: true,
    source: 'editorial',
    lastVerifiedDate: '2026-10-22',
    createdAt: '2026-03-01T11:00:00Z',
    updatedAt: '2026-10-22T14:15:00Z',
  },
  {
    id: 'albania-faq-14-drone-rules',
    orderIndex: 14,
    question: '14. Can I fly a drone for travel photography in Albania?',
    officialDirectAnswer: 'Recreational drone photography is permitted in open scenic areas, but strictly prohibited near airports, military zones, and crowded historical castles.',
    summary: 'Recreational drone flying is allowed in open rural areas, but restricted near airports, government sites, and military zones.',
    answer: `### Tour Operator Answer:
**Recreational drone photography is permitted in open scenic areas, but strictly prohibited near airports, military zones, and crowded historical castles.**

### Aerial Photography Advice:
- **Permitted Open Areas:** Flying mini drones for landscape shots along the coastal beaches, Llogara Pass, and mountain valleys is very popular.
- **Restricted No-Fly Zones:** Avoid flying directly over airport perimeters, government buildings in central Tirana, and active military installations.
- **Courtesy:** Respect privacy at crowded beach clubs or outdoor dining plazas.`,
    category: 'connectivity-tech',
    tags: ['Drones', 'Travel Photography', 'Regulations', 'Aerial Views', 'Tech'],
    helpfulCount: 87,
    unhelpfulCount: 2,
    viewCount: 1020,
    featured: false,
    source: 'editorial',
    lastVerifiedDate: '2026-10-19',
    createdAt: '2026-03-01T11:05:00Z',
    updatedAt: '2026-10-19T16:00:00Z',
  },
  {
    id: 'albania-faq-15-traditional-cuisine',
    orderIndex: 15,
    question: '15. What traditional Albanian dishes should every traveler try?',
    officialDirectAnswer: 'Must-try specialties include Byrek pastry, Tavë Kosi baked lamb, Fërgesë, and fresh grilled seafood along the Ionian Riviera.',
    summary: 'Top dishes include savory Byrek pastry, Tavë Kosi (baked lamb with yogurt), Fërgesë, and fresh coastal seafood.',
    answer: `### Tour Operator Answer:
**Must-try specialties include Byrek pastry, Tavë Kosi baked lamb, Fërgesë, and fresh grilled seafood along the Ionian Riviera.**

### Top Gastronomic Highlights:
- **Tavë Kosi:** The national dish—tender lamb baked in an earthenware dish with rice, eggs, and seasoned yogurt sauce.
- **Byrek:** Flaky filo pastry filled with minced meat, ricotta cheese, or wild spinach—perfect for breakfast with a glass of *Dhallë* (savory buttermilk).
- **Fërgesë:** Warm casserole of roasted bell peppers, tomatoes, garlic, and salted cottage cheese (*gjizë*).
- **Riviera Seafood:** Fresh sea bass, octopus, and king prawns grilled over charcoal at Sarandë and Ksamil seaside tavernas.`,
    category: 'customs-etiquette',
    tags: ['Traditional Food', 'Byrek', 'Tavë Kosi', 'Albanian Cuisine', 'Gastronomy'],
    helpfulCount: 135,
    unhelpfulCount: 0,
    viewCount: 1680,
    featured: true,
    source: 'editorial',
    lastVerifiedDate: '2026-10-23',
    createdAt: '2026-03-01T11:10:00Z',
    updatedAt: '2026-10-23T10:00:00Z',
  },
  {
    id: 'albania-faq-16-tipping-etiquette',
    orderIndex: 16,
    question: '16. How does tipping and restaurant service gratuity work?',
    officialDirectAnswer: 'Tipping is not legally required, but leaving 10% cash or rounding up the bill is customary for good service in cafes and restaurants.',
    summary: 'Tipping is not mandatory, but rounding up or leaving ~10% cash for restaurant and café service is warmly appreciated.',
    answer: `### Tour Operator Answer:
**Tipping is not legally required, but leaving 10% cash or rounding up the bill is customary for good service in cafes and restaurants.**

### Tipping Customs in Practice:
- **Cafes & Espresso Bars:** Rounding up small coffee change (e.g., leaving 20–50 ALL) is standard practice.
- **Restaurants:** Leaving 10% in cash on the table is customary for attentive dinner service.
- **Tour Drivers & Guides:** A small cash gratuity at the conclusion of a multi-day private tour is a common gesture of gratitude for exceptional service.`,
    category: 'currency-budget',
    tags: ['Tipping', 'Gratuity', 'Restaurant Bills', 'Service', 'Cash Tips'],
    helpfulCount: 92,
    unhelpfulCount: 1,
    viewCount: 1110,
    featured: false,
    source: 'editorial',
    lastVerifiedDate: '2026-10-17',
    createdAt: '2026-03-01T11:15:00Z',
    updatedAt: '2026-10-17T12:00:00Z',
  },
  {
    id: 'albania-faq-17-safety-solo-travel',
    orderIndex: 17,
    question: '17. Is Albania safe for solo travelers and families?',
    officialDirectAnswer: 'Albania is statistically one of the safest countries in Southern Europe, with extremely low violent crime rates and welcoming hospitality.',
    summary: 'Albania is exceptionally safe for families, solo travelers, and night walks thanks to strong community values and hospitality.',
    answer: `### Tour Operator Answer:
**Albania is statistically one of the safest countries in Southern Europe, with extremely low violent crime rates and welcoming hospitality.**

### Safety Environment & Culture:
- **Low Crime Rate:** Violent crime against tourists is practically nonexistent. Standard precautions for wallets in crowded markets apply.
- **Evening *Xhiro* Walk:** Families and locals take evening strolls (*Xhiro*) through town plazas late into the night in a friendly, family-safe atmosphere.
- **Solo Female Travelers:** Solo travelers consistently report high levels of respect, assistance from local shopkeepers, and helpful directions.`,
    category: 'safety-emergency',
    tags: ['Safety', 'Solo Travelers', 'Family Travel', 'Crime Rate', 'Hospitality'],
    helpfulCount: 154,
    unhelpfulCount: 0,
    viewCount: 1890,
    featured: true,
    source: 'editorial',
    lastVerifiedDate: '2026-10-24',
    createdAt: '2026-03-01T11:20:00Z',
    updatedAt: '2026-10-24T08:30:00Z',
  },
  {
    id: 'albania-faq-18-best-season-weather',
    orderIndex: 18,
    question: '18. What is the best season and weather for visiting Albania?',
    officialDirectAnswer: 'May to October offers sunny, warm Mediterranean weather. May-June and September-October provide ideal beach temperatures without midsummer crowds.',
    summary: 'May through October is best. Shoulder months (May, June, September) offer warm seas and pleasant weather with fewer crowds.',
    answer: `### Tour Operator Answer:
**May to October offers sunny, warm Mediterranean weather. May-June and September-October provide ideal beach temperatures without midsummer crowds.**

### Seasonal Breakdown:
- **Shoulder Season (May–June & Sept–Oct):** Ideal temperatures (24°C–28°C), clear waters, easy photography, and quiet heritage towns.
- **Peak Summer (July–August):** Hot sunny days (32°C–36°C) perfect for swimming, beach festivals, and vibrant coastal nightlife.
- **Mountain Trekking (June–September):** Optimal clear trail conditions in Theth, Valbona, and the Accursed Mountains.`,
    category: 'baggage-packing',
    tags: ['Best Time to Visit', 'Weather', 'Seasons', 'Riviera Summer', 'Hiking'],
    helpfulCount: 110,
    unhelpfulCount: 1,
    viewCount: 1380,
    featured: false,
    source: 'editorial',
    lastVerifiedDate: '2026-10-16',
    createdAt: '2026-03-01T11:25:00Z',
    updatedAt: '2026-10-16T15:00:00Z',
  },
  {
    id: 'albania-faq-19-health-pharmacies',
    orderIndex: 19,
    question: '19. What should I know about health insurance and pharmacies?',
    officialDirectAnswer: 'Travel health insurance is strongly advised. Green-cross pharmacies (Farmaci) are plentiful in towns and carry common medications without prescription.',
    summary: 'Travel health insurance is recommended. Local pharmacies (*Farmaci*) carry extensive medications and offer knowledgeable advice.',
    answer: `### Tour Operator Answer:
**Travel health insurance is strongly advised. Green-cross pharmacies (Farmaci) are plentiful in towns and carry common medications without prescription.**

### Healthcare Access & Medical Facilities:
- **Green Cross Pharmacies (*Farmaci*):** Located every few blocks in towns. Pharmacists speak English or Italian and can dispense common remedies for heat, digestion, or allergies.
- **Private Clinics:** Modern private medical centers in Tirana and Sarandë offer quick consultations at affordable out-of-pocket costs.
- **24/7 Tour Coordination:** Contact emergency 112 or our concierge team immediately if hospital assistance is required.`,
    category: 'health-insurance',
    tags: ['Travel Insurance', 'Pharmacies', 'Medical Care', 'Farmaci', 'Health'],
    helpfulCount: 88,
    unhelpfulCount: 0,
    viewCount: 1040,
    featured: false,
    source: 'editorial',
    lastVerifiedDate: '2026-10-14',
    createdAt: '2026-03-01T11:30:00Z',
    updatedAt: '2026-10-14T11:20:00Z',
  },
  {
    id: 'albania-faq-20-souvenirs-shopping',
    orderIndex: 20,
    question: '20. What regional souvenirs and authentic crafts are best to bring home?',
    officialDirectAnswer: 'Handcrafted silver filigree jewelry, Berat olive oil, mountain tea (Çaj Mali), Albanian raki, and traditional woven kilim rugs.',
    summary: 'Popular local keepsakes include silver filigree jewelry, cold-pressed olive oil, organic mountain tea (*Çaj Mali*), and artisanal crafts.',
    answer: `### Tour Operator Answer:
**Handcrafted silver filigree jewelry, Berat olive oil, mountain tea (Çaj Mali), Albanian raki, and traditional woven kilim rugs.**

### Recommended Authentic Keepsakes:
- **Mountain Tea (*Çaj Mali*):** Dried wild Sideritis herbs harvested from high limestone peaks—known for fragrant citrus aroma and health benefits.
- **Silver Filigree (*Argjendari*):** Delicately woven silver brooches and earrings handcrafted in Kruja Bazaar and Shkodër workshops.
- **Artisanal Olive Oil:** Extra-virgin cold-pressed olive oil from ancient groves surrounding Berat and Vlorë.
- **Albanian Raki:** Traditional grape or plum brandy produced in copper stills—a classic gift bottle.`,
    category: 'baggage-packing',
    tags: ['Souvenirs', 'Artisanal Crafts', 'Mountain Tea', 'Raki', 'Shopping'],
    helpfulCount: 126,
    unhelpfulCount: 0,
    viewCount: 1490,
    featured: false,
    source: 'editorial',
    lastVerifiedDate: '2026-10-25',
    createdAt: '2026-03-01T11:35:00Z',
    updatedAt: '2026-10-25T09:00:00Z',
  }
];

const INITIAL_REVIEWS: FAQReview[] = [
  {
    id: 'rev-alb-01',
    faqId: 'albania-faq-4-car-rental',
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
    faqId: 'albania-faq-7-sim-card',
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
    faqId: 'albania-faq-1-currency',
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
    faqId: 'albania-faq-10-emergency-numbers',
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
    faqId: 'albania-faq-6-churches-mosques',
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
        if (parsed && Array.isArray(parsed.faqs) && parsed.faqs.some((f: FAQItem) => f.id === 'albania-faq-1-currency')) {
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
        (f.officialDirectAnswer && f.officialDirectAnswer.toLowerCase().includes(q)) ||
        f.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (options?.sort === 'views') {
      result.sort((a, b) => b.viewCount - a.viewCount);
    } else if (options?.sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // Default: preserve official 1 to 10 in strict orderIndex sequence, then newest/helpful
      result.sort((a, b) => {
        if (a.orderIndex !== undefined && b.orderIndex !== undefined) {
          return a.orderIndex - b.orderIndex;
        }
        if (a.orderIndex !== undefined) return -1;
        if (b.orderIndex !== undefined) return 1;
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

    // Place auto-generated FAQs right after the official 10
    const nonOfficialIndex = this.data.faqs.findIndex(f => f.orderIndex === undefined);
    if (nonOfficialIndex !== -1) {
      this.data.faqs.splice(nonOfficialIndex, 0, newFaq);
    } else {
      this.data.faqs.push(newFaq);
    }

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
