/** Symptom ↔ emotion insight chains */

const loc = (en, hi) => ({ en, hi });

export const insightChains = [
  {
    id: 'family_stress_body',
    priority: 10,
    match: ({ familyStress, lastMood }) =>
      (familyStress === 'high' || familyStress === 'some') &&
      ['Stressed', 'Tired', 'Sad', 'Low Energy'].includes(lastMood),
    nodes: [
      { id: 'trigger', label: loc('Family stress at home', 'घर में पारिवारिक तनाव'), emoji: '🏠' },
      { id: 'emotional', label: loc('Emotional absorption', 'भावनाएँ शरीर में उतरना'), emoji: '💔' },
      { id: 'sleep', label: loc('Sleep disruption', 'नींद बिगड़ना'), emoji: '🌙' },
      { id: 'body', label: loc('Body signals (pain, fatigue)', 'शरीर के संकेत'), emoji: '🩺' }
    ],
    insight: loc(
      'Your body may be speaking what the home could not. This is not weakness — it is connection between family climate and your health.',
      'शरीर वो बोल रहा है जो घर में शब्द नहीं बने। यह कमज़ोरी नहीं — परिवार और सेहत का जुड़ाव है।'
    ),
    actions: [
      { type: 'reels', reelId: 'reel_husband_stress' },
      { type: 'family', slug: 'husband-wife' },
      { type: 'guidance' }
    ]
  },
  {
    id: 'stress_health_awareness',
    priority: 9,
    match: ({ familyStress, lastMood }) =>
      familyStress === 'high' ||
      ['Stressed', 'Tired', 'Low Energy', 'Sad'].includes(lastMood),
    nodes: [
      { id: 'mind', label: loc('Mind carries worry', 'मन चिंता उठाए'), emoji: '🧠' },
      { id: 'stress', label: loc('Stress hormones rise', 'स्ट्रेस हार्मोन बढ़ना'), emoji: '⚡' },
      { id: 'sleep', label: loc('Sleep & immunity dip', 'नींद और रोग प्रतिरोध'), emoji: '🌙' },
      { id: 'body', label: loc('Pain, fatigue, cycle shifts', 'दर्द, थकान, साइकल'), emoji: '🩺' }
    ],
    insight: loc(
      'Stress and health are connected — not imagined. Awareness helps you choose self-care, Sakhi, doctor, or therapist at the right time.',
      'तनाव और सेहत जुड़े हैं — कल्पना नहीं। अवेयरनेस सही समय पर सेल्फ-केयर, सखी, डॉक्टर या थेरेपिस्ट चुनने में मदद करती है।'
    ),
    actions: [
      { type: 'route', path: '/app/awareness' },
      { type: 'guidance' }
    ]
  },
  {
    id: 'stress_hormone',
    priority: 8,
    match: ({ familyStress, lastMood }) =>
      familyStress && ['Stressed', 'Tired'].includes(lastMood),
    nodes: [
      { id: 'stress', label: loc('Daily stress', 'रोज़ का तनाव'), emoji: '🌪️' },
      { id: 'cortisol', label: loc('Stress hormones rise', 'स्ट्रेस हार्मोन बढ़ना'), emoji: '⚡' },
      { id: 'cycle', label: loc('Cycle / energy shifts', 'पीरियड / एनर्जी बदलना'), emoji: '🌸' }
    ],
    insight: loc(
      'Stress → cortisol → your cycle and energy can shift. Track mood and family climate together, not separately.',
      'तनाव → कॉर्टिसोल → साइकल और एनर्जी बदल सकती है। मूड और घर का माहौल साथ देखें।'
    ),
    actions: [
      { type: 'reels', reelId: 'reel_period_stress' },
      { type: 'route', path: '/app/period' }
    ]
  },
  {
    id: 'parenting_anxiety',
    priority: 7,
    match: ({ lastMood }) => ['Stressed', 'Sad', 'Tired'].includes(lastMood),
    nodes: [
      { id: 'child', label: loc('Child distress signals', 'बच्चे के संकेत'), emoji: '🧒' },
      { id: 'mother', label: loc("Mother's worry mirror", 'माँ की चिंता'), emoji: '👩' },
      { id: 'guilt', label: loc('Guilt & over-responsibility', 'अपराधबोध'), emoji: '😔' }
    ],
    insight: loc(
      'Children absorb unspoken tension. Healing your calm helps the whole home — including you.',
      'बच्चे अनकहा तनाव सोख लेते हैं। आपकी शांति पूरे घर को संभालती है।'
    ),
    actions: [
      { type: 'family', slug: 'parenting' },
      { type: 'reels', reelId: 'reel_child_anxiety' }
    ]
  },
  {
    id: 'unheard_body',
    priority: 5,
    match: ({ lastMood }) => ['Sad', 'Stressed'].includes(lastMood),
    nodes: [
      { id: 'unheard', label: loc('Feeling unheard', 'सुना नहीं जाना'), emoji: '🤫' },
      { id: 'body', label: loc('Body speaks (pain, tears)', 'शरीर बोलता है'), emoji: '🌙' }
    ],
    insight: loc(
      'When words stay inside, the body finds its voice. You deserve to be heard — start with Sakhi.',
      'जब शब्द अंदर रहें, शरीर बोलने लगता है। आप सुनाई देने के लायक हैं।'
    ),
    actions: [
      { type: 'reels', reelId: 'reel_no_one_listens' },
      { type: 'sakhi' }
    ]
  },
  {
    id: 'default_wellness',
    priority: 0,
    match: () => true,
    nodes: [
      { id: 'aware', label: loc('Self-awareness', 'खुद को समझना'), emoji: '🪷' },
      { id: 'care', label: loc('Gentle daily care', 'हल्की दैनिक देखभाल'), emoji: '💕' }
    ],
    insight: loc(
      'Every feeling is a message. Log your family pulse and mood — patterns will guide your next step.',
      'हर भावना एक संदेश है। फैमिली पल्स और मूड लॉग करें — पैटर्न अगला कदम दिखाएँगे।'
    ),
    actions: [
      { type: 'family', slug: 'burnout' },
      { type: 'guidance' }
    ]
  }
];

export const getLocalizedInsight = (obj, langCode) =>
  obj?.[langCode] || obj?.hi || obj?.en || '';
