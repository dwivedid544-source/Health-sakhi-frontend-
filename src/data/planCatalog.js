export const PLAN_STORAGE_KEY = 'hs_admin_plans';
export const MEMBER_PLAN_KEY = 'hs_member_plan';
export const RECEIPT_STORAGE_KEY = 'hs_payment_receipts';

// Clear outdated local storage plan definitions if present
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(PLAN_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && (parsed.length < 3 || parsed.some(p => p.slug === 'premium-sakhi' && p.features?.some(f => f.includes('FAQ & Help +'))))) {
        localStorage.removeItem(PLAN_STORAGE_KEY);
      }
    }
  } catch (e) {
    console.error('Error clearing old plan catalog localstorage:', e);
  }
}

export const defaultPlans = [
  {
    id: 'PLN-01',
    name: 'Free Sakhi',
    slug: 'free-sakhi',
    price: '0',
    duration: 'Free 🌸',
    interval: 'LIFETIME',
    status: 'Active',
    highlightTag: 'FREE 🌸',
    priceSubtext: 'FREE FOREVER',
    shortDescription: 'Free — Explore core HealthSakhi features with no cost!',
    features: [
      'Books: Access limited to 5 books only (Limit enforced) 📚',
      'Community Sakhis: Available ✅',
      'FAQ & Help: Available ✅',
      'To-Do List: Available ✅',
      'Home Budget Sakhi: Available ✅',
      'Mental Health: Available ✅',
      'Period Tracker: Available ✅',
      'FAQ & Help: Available ✅',
      'Ask Health Sakhi: LOCKED 🔒 (Shows lock screen + Upgrade CTA)',
      'AI Chat Bot: LOCKED 🔒 (Shows lock screen + Upgrade CTA)',
      'Wellness Certificate: LOCKED 🔒 (Shows blurred lock screen + Upgrade CTA)',
      'Partner Sakhi: LOCKED 🔒 (Shows lock screen + Upgrade CTA)',
    ]
  },
  {
    id: 'PLN-02',
    name: 'Basic Sakhi',
    slug: 'basic-sakhi',
    price: '499',
    originalPrice: '699',
    duration: '1 Month',
    interval: 'MONTHLY',
    status: 'Active',
    highlightTag: 'RECOMMENDED ⚡',
    priceSubtext: '1 MONTH UNLIMITED BOOKS & AI',
    shortDescription: 'Unlock AI Chat Bot 24/7, All Books Unlimited & Wellness Certificate for 1 month.',
    features: [
      'Books: UNLIMITED ALL BOOKS 📚',
      'Community Sakhis: Available ✅',
      'Wellness Certificate: UNLOCKED & DOWNLOADABLE 🏆',
      'FAQ & Help: Available ✅',
      'AI Chat Bot: UNLOCKED 24/7 🤖',
      'To-Do List: Available ✅',
      'Home Budget Sakhi: Available ✅',
      'Mental Health: Available ✅',
      'Period Tracker: Available ✅',
      'Ask Health Sakhi: LOCKED 🔒 (Shows lock screen + Upgrade CTA)',
      'Partner Sakhi: LOCKED 🔒 (Requires Premium)',
    ]
  },
  {
    id: 'PLN-03',
    name: 'Premium Sakhi',
    slug: 'premium-sakhi',
    price: '999',
    originalPrice: '1399',
    duration: '1 Month',
    interval: 'MONTHLY',
    status: 'Active',
    highlightTag: 'MOST POPULAR 🔥',
    priceSubtext: 'ALL FEATURES UNLIMITED ACCESS',
    shortDescription: 'All features, Partner Sakhi referral earnings & Ask Health Sakhi unlocked!',
    features: [
      'Books Unlimited ✅',
      'Community Sakhis ✅',
      'Wellness Certificate Download ✅',
      'Partner Sakhi / Referral Earnings UNLOCKED 💰 ✅',
      'FAQ & Help: Available ✅',
      'Ask Health Sakhi Direct Support Chat UNLOCKED 💬 ✅',
      'AI Chat Bot Unlimited ✅',
      'To-Do List ✅',
      'Home Budget Sakhi ✅',
      'Mental Health ✅',
      'Period Tracker ✅',
    ]
  }
];
