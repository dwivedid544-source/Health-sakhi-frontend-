import { Smile, Frown, Moon, Zap, Heart, Battery } from 'lucide-react';

export const moodData = {
  'Happy': {
    icon: Smile,
    bg: 'linear-gradient(135deg, #FFF9EE 0%, #FEF3C7 100%)',
    accent: '#CCAA3D',
    question: "What's fueling your joy today, Sakhi?",
    reasons: ["Personal Win", "Social Connection", "Good News", "Self-Care"],
    message: "Your radiation is beautiful! Let's sustain this high-vibration energy throughout your day.",
    affirmations: [
      "I am a magnet for joy and positive experiences.",
      "My happiness contributes to the happiness of those around me.",
      "I deserve every beautiful thing that happens today.",
      "I celebrate my wins, no matter how small they are."
    ],
    prompt: "What is one thing that made you smile today?",
    meditation: "Golden Glow Morning",
    quickActions: [
      { label: "Keep Streak Going", icon: "Activity", action: "/app/rewards" },
      { label: "Gratitude Journal", icon: "BookOpen", action: "/app/journal" },
      { label: "Share Positivity", icon: "MessageCircle", action: "/app/community" }
    ]
  },
  'Sad': {
    icon: Frown,
    bg: 'linear-gradient(135deg, #F5F1FE 0%, #EDE9FE 100%)',
    accent: '#9079C1',
    question: "Why are you feeling a bit heavy today?",
    reasons: ["Work Stress", "Relationship", "Lack of Purpose", "Physical Health"],
    message: "It's okay to feel this way. Clouds may pass, but your sky remains infinite. We are here with you.",
    affirmations: [
      "I allow myself to feel and process my emotions safely.",
      "I am gentle with myself during this time of healing.",
      "This feeling is temporary, and I will find my light again.",
      "I am worthy of comfort and peace."
    ],
    prompt: "What is one gentle thing you can do for yourself tonight?",
    meditation: "Rainfall Heart Healing",
    quickActions: [
      { label: "Positive Affirmation", icon: "Sparkles", action: "/app/affirmations" },
      { label: "Healing Music", icon: "Music", action: "/app/meditation" },
      { label: "Emotional Chat", icon: "MessageCircle", action: "/app/ai-sakhi" }
    ]
  },
  'Tired': {
    icon: Moon,
    bg: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
    accent: '#64748B',
    question: "What drained your battery, Sakhi?",
    reasons: ["Busy Schedule", "Emotional Labor", "Lack of Sleep", "Digital Overload"],
    message: "Your body is asking for grace. Pushing through isn't always the answer—sometimes, rest is the bravest act.",
    affirmations: [
      "Rest is productive and necessary for my growth.",
      "I listen to my body's signals with love and respect.",
      "I release the pressure to be constantly achieving.",
      "I am replenishing my energy, one breath at a time."
    ],
    prompt: "Which part of your day felt the most draining?",
    meditation: "Body Scan for Deep Rest",
    quickActions: [
      { label: "Drink Water", icon: "Droplets", action: "/app/todo" },
      { label: "Listen to Calm Audio", icon: "Music", action: "/app/meditation" },
      { label: "Talk to Sakhi", icon: "MessageCircle", action: "/app/ai-sakhi" }
    ]
  },
  'Stressed': {
    icon: Zap,
    bg: 'linear-gradient(135deg, #FDEEF1 0%, #FEE2E2 100%)',
    accent: '#D17B88',
    question: "What's weighting on your mind?",
    reasons: ["Deadlines", "Home Life", "Health Concern", "Financials"],
    message: "The weight on your shoulders is heavy, but your spirit is light as air. Let's take it one heartbeat at a time.",
    affirmations: [
      "I release control of things I cannot change.",
      "I am capable of handling whatever comes my way.",
      "I am calm, centered, and grounded in the present.",
      "With every exhale, I let go of tension."
    ],
    prompt: "What is one thing you can delegate or let go of today?",
    meditation: "Anti-anxiety Cloud Release",
    quickActions: [
      { label: "2-min Breathing", icon: "Wind", action: "/app/meditation" },
      { label: "Calm Audio", icon: "Music", action: "/app/meditation" },
      { label: "Talk to Sakhi", icon: "MessageCircle", action: "/app/ai-sakhi" }
    ]
  },
  'Grateful': {
    icon: Heart,
    bg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
    accent: '#059669',
    question: "What are you treasuring right now?",
    reasons: ["Small Wins", "Relationships", "Nature", "Self-Growth"],
    message: "Gratitude is the highest frequency. Your heart is blooming, and the world feels it too.",
    affirmations: [
      "I see beauty in the simple things around me.",
      "I am thankful for the abundance flowing into my life.",
      "Each day brings new reasons to be grateful.",
      "My heart is a garden of appreciation."
    ],
    prompt: "Write down 3 tiny things you're grateful for right now.",
    meditation: "Abundance Field Visualization",
    quickActions: [
      { label: "Reward Coins", icon: "Trophy", action: "/app/rewards" },
      { label: "Share Positivity", icon: "Heart", action: "/app/community" },
      { label: "Wellness Challenge", icon: "Sparkles", action: "/app/todo" }
    ]
  },
  'Low Energy': {
    icon: Battery,
    bg: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
    accent: '#D97706',
    question: "What's your energy level telling you?",
    reasons: ["Burnout", "Recovery", "Quiet Phase", "Feeling Lost"],
    message: "Slow and steady is a valid pace. Your roots are deepening while you rest. Honor this quiet phase.",
    affirmations: [
      "I honor my need to go slowly today.",
      "Energy is a cycle, and I am in a phase of renewal.",
      "I am doing enough just by being.",
      "I preserve my energy for what truly matters."
    ],
    prompt: "What is one thing that could give you a spark of energy?",
    meditation: "Internal Sun Awakening",
    quickActions: [
      { label: "1-min Stretch", icon: "Activity", action: "/app/todo" },
      { label: "Drink Water", icon: "Droplets", action: "/app/todo" },
      { label: "Talk to Sakhi", icon: "MessageCircle", action: "/app/ai-sakhi" }
    ]
  }
};
