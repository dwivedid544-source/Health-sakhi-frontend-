export const PLAN_STORAGE_KEY = 'hs_admin_plans';
export const MEMBER_PLAN_KEY = 'hs_member_plan';
export const RECEIPT_STORAGE_KEY = 'hs_payment_receipts';

// Clear outdated local storage plan definitions if present
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(PLAN_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.some(p => p.slug === 'basic-sakhi' || p.slug === 'premium-sakhi' || p.price === '499')) {
        localStorage.removeItem(PLAN_STORAGE_KEY);
      }
    }
  } catch (e) {
    console.error('Error clearing old plan catalog localstorage:', e);
  }
}

export const defaultPlans = [
  {
    id: 'PLN-FREE',
    name: 'Free 30-Day Trial',
    slug: 'free-sakhi',
    price: '0',
    originalPrice: '0',
    duration: '30 Days Free 🌸',
    interval: 'MONTHLY',
    status: 'Active',
    highlightTag: '30 DAYS FREE 🌸',
    priceSubtext: 'THEN YOU DECIDE',
    shortDescription: 'For the first 30 days, HealthSakhi is completely free. No payment required.',
    quote: '“Use it first. Feel the value. Then decide what it is worth to you.”',
    features: [
      'Full Access to HealthSakhi Core ✅',
      'AI Health Companion 24/7 ✅',
      'Audio & Multilingual Education Library ✅',
      'Period & Family Health Trackers ✅',
      'Sisterhood Circle & Support ✅'
    ]
  },
  {
    id: 'PLN-ACCESS',
    name: 'Access',
    slug: 'access-sakhi',
    price: '999',
    originalPrice: '1999',
    duration: '1 Year',
    interval: 'YEARLY',
    status: 'Active',
    highlightTag: 'ACCESS',
    priceSubtext: '₹999 / YEAR',
    shortDescription: '“HealthSakhi helps me, but I need affordable access.”',
    quote: '“HealthSakhi helps me, but I need affordable access.”',
    features: [
      'Meaningful Core HealthSakhi Experience ✅',
      'Full Audio & Multilingual Education ✅',
      'AI Health Companion 24/7 ✅',
      'Period & Family Wellness Tracker ✅',
      'Sisterhood Circles & Support ✅'
    ]
  },
  {
    id: 'PLN-FAIR-VALUE',
    name: 'Fair Value',
    slug: 'fair-value-sakhi',
    price: '2999',
    originalPrice: '3999',
    duration: '1 Year',
    interval: 'YEARLY',
    status: 'Active',
    highlightTag: 'FAIR VALUE ⭐',
    priceSubtext: '₹2,999 / YEAR',
    shortDescription: '“I received real value and this feels like a fair contribution.”',
    quote: '“I received real value and this feels like a fair contribution.”',
    features: [
      'Complete Core HealthSakhi Experience ✅',
      'Full Audio & Multilingual Education ✅',
      'AI Health Companion 24/7 ✅',
      'Wellness Certificate of Completion 🏆',
      'Special Educational Sessions 🌸'
    ]
  },
  {
    id: 'PLN-SUPPORTER',
    name: 'Supporter',
    slug: 'supporter-sakhi',
    price: '4999',
    originalPrice: '6999',
    duration: '1 Year',
    interval: 'YEARLY',
    status: 'Active',
    highlightTag: 'SUPPORTER',
    priceSubtext: '₹4,999 / YEAR',
    shortDescription: '“I value HealthSakhi and want to support its growth.”',
    quote: '“I value HealthSakhi and want to support its growth.”',
    features: [
      'Complete Core HealthSakhi Experience ✅',
      'Advanced Learning Resources 📚',
      'Early Access to Selected Features ⚡',
      'Wellness Certificate & Priority AI 🌟',
      'Direct Support Sisterhood Circle 💬'
    ]
  },
  {
    id: 'PLN-PATRON',
    name: 'Patron / Pay It Forward',
    slug: 'patron-sakhi',
    price: '9999',
    originalPrice: '14999',
    duration: '1 Year',
    interval: 'YEARLY',
    status: 'Active',
    highlightTag: 'PAY IT FORWARD ❤️',
    priceSubtext: '₹9,999 / YEAR',
    shortDescription: '“I can contribute more and help HealthSakhi reach women who may not be able to.”',
    quote: '“I can contribute more and help HealthSakhi reach women who may not be able to.”',
    features: [
      'Complete Core HealthSakhi Experience ✅',
      'Help Keep HealthSakhi Accessible to Another Woman ❤️',
      'Participate in HealthSakhi Initiatives 🤝',
      'Advanced Resources & Early Access ⚡',
      'Special Educational Sessions & Direct Support 🌸'
    ]
  }
];
