/** Guidance wizard — when to seek self-care / Sakhi / professional help */

const loc = (en, hi) => ({ en, hi });

export const guidanceTopics = [
  { id: 'emotional', label: loc('Emotional / relationship', 'भावनात्मक / रिश्ते'), emoji: '💕' },
  { id: 'physical', label: loc('Physical symptoms', 'शारीरिक लक्षण'), emoji: '🩺' },
  { id: 'family', label: loc('Family stress at home', 'घर का तनाव'), emoji: '🏠' },
  { id: 'parenting', label: loc('Parenting worry', 'पेरेंटिंग चिंता'), emoji: '👧' },
  { id: 'health_care', label: loc('Doctor or therapist?', 'डॉक्टर या थेरेपिस्ट?'), emoji: '🩺' },
  { id: 'domestic', label: loc('Domestic / home issues', 'घरेलू मुद्दे'), emoji: '🏡' }
];

export const severityLevels = [
  { id: 'mild', label: loc('Mild — manageable today', 'हल्का — आज संभाल सकती हूँ'), emoji: '🌿' },
  { id: 'moderate', label: loc('Moderate — affecting sleep/mood', 'मध्यम — नींद/मूड पर असर'), emoji: '🌤️' },
  { id: 'severe', label: loc('Severe — hard to function', 'गंभीर — रोज़ काम मुश्किल'), emoji: '🌧️' }
];

/**
 * Returns care level: self | sakhi | professional | emergency
 */
export const computeGuidance = ({ topic, severity, familyStress }) => {
  if (topic === 'health_care' && severity === 'mild') {
    return {
      level: 'self',
      title: loc('Start with self-care', 'सेल्फ-केयर से शुरू'),
      message: loc(
        'Mild stress can be eased with rest, breath, and daily rhythm. Read the awareness guide for stress → health connection.',
        'हल्का तनाव आराम और रूटीन से घट सकता है। तनाव → सेहत गाइड पढ़ें।'
      ),
      routes: [
        { label: loc('Awareness', 'अवेयरनेस'), path: '/app/awareness' },
        { label: loc('Meditation', 'मेडिटेशन'), path: '/app/meditation' },
        { label: loc('Affirmations', 'अफर्मेशन'), path: '/app/affirmation' }
      ]
    };
  }

  if (topic === 'health_care' && severity === 'moderate') {
    return {
      level: 'sakhi',
      title: loc('Therapist or counsellor may help', 'थेरेपिस्ट / काउंसलर मदद कर सकते हैं'),
      message: loc(
        'Ongoing emotional weight often benefits from talk support. Physical symptoms persisting? Also track cycle and book medical check.',
        'लगातार भावनात्मक भार — बातचीत से मदद मिल सकती है। शारीरिक लक्षण रहें तो डॉक्टर भी देखें।'
      ),
      routes: [
        { label: loc('Awareness: doctor vs therapist', 'डॉक्टर vs थेरेपिस्ट'), path: '/app/awareness' },
        { label: loc('Book session', 'सेशन बुक'), path: '/app/sessions' },
        { label: loc('Period tracker', 'पीरियड ट्रैकर'), path: '/app/period' }
      ]
    };
  }

  if (topic === 'health_care') {
    return {
      level: 'professional',
      title: loc('Medical + emotional support', 'मेडिकल + भावनात्मक सहारा'),
      message: loc(
        'Severe or long-lasting symptoms deserve both care paths: a doctor for the body, and a therapist for the heart.',
        'गंभीर या लंबे लक्षण — शरीर के लिए डॉक्टर, दिल के लिए थेरेपिस्ट।'
      ),
      routes: [
        { label: loc('Book advisor', 'एडवाइज़र बुक'), path: '/app/sessions' },
        { label: loc('Awareness guide', 'अवेयरनेस'), path: '/app/awareness' },
        { label: loc('AI Sakhi', 'AI सखी'), path: '/app/ai-sakhi' }
      ],
      disclaimer: loc(
        'If you are in immediate danger, call local emergency services.',
        'तुरंत खतरा हो तो स्थानीय इमरजेंसी नंबर पर कॉल करें।'
      )
    };
  }

  if (topic === 'domestic' && severity !== 'mild') {
    return {
      level: 'professional',
      title: loc('You deserve safe support', 'आप सुरक्षित सहारे के लायक हैं'),
      message: loc(
        'Domestic tension can affect sleep, mood, and body. A trusted advisor can help you plan boundaries and next steps.',
        'घरेलू तनाव नींद, मूड और शरीर पर असर डालता है। एडवाइज़र सीमा और अगला कदम तय करने में मदद कर सकता/सकती है।'
      ),
      routes: [
        { label: loc('Domestic awareness', 'घरेलू अवेयरनेस'), path: '/app/awareness' },
        { label: loc('Family module', 'फैमिली मॉड्यूल'), path: '/app/family/domestic-home' },
        { label: loc('Book session', 'सेशन बुक'), path: '/app/sessions' }
      ],
      disclaimer: loc(
        'If you are in immediate danger, call local emergency services.',
        'तुरंत खतरा हो तो स्थानीय इमरजेंसी नंबर पर कॉल करें।'
      )
    };
  }

  if (topic === 'domestic') {
    return {
      level: 'sakhi',
      title: loc('Understand patterns first', 'पहले पैटर्न समझें'),
      message: loc(
        'Read domestic awareness, log family pulse, and try one small boundary today.',
        'घरेलू अवेयरनेस पढ़ें, फैमिली पल्स लॉग करें, आज एक छोटी सीमा आज़माएँ।'
      ),
      routes: [
        { label: loc('Awareness', 'अवेयरनेस'), path: '/app/awareness' },
        { label: loc('Domestic module', 'घरेलू मॉड्यूल'), path: '/app/family/domestic-home' },
        { label: loc('Sakhi Reels', 'रील्स'), path: '/app/reels' }
      ]
    };
  }

  if (severity === 'severe' && (topic === 'physical' || topic === 'emotional')) {
    return {
      level: 'professional',
      title: loc('Talk to a wellness advisor', 'वेलनेस एडवाइज़र से बात करें'),
      message: loc(
        'What you feel sounds heavy. A human guide can help you plan safe next steps — you do not have to carry this alone.',
        'जो महसूस हो रहा है वो भारी है। एक गाइड सुरक्षित अगला कदम तय करने में मदद कर सकता/सकती है।'
      ),
      routes: [
        { label: loc('Book session', 'सेशन बुक करें'), path: '/app/sessions' },
        { label: loc('AI Sakhi first', 'पहले AI सखी'), path: '/app/ai-sakhi' }
      ]
    };
  }

  if (severity === 'severe') {
    return {
      level: 'professional',
      title: loc('Professional support recommended', 'प्रोफेशनल सहारा बेहतर'),
      message: loc(
        'Your answers suggest you need structured support. Start with a session or trusted helpline if you feel unsafe.',
        'आपके जवाब बताते हैं संरचित सहारा ज़रूरी है। असुरक्षित लगे तो हेल्पलाइन याद रखें।'
      ),
      routes: [
        { label: loc('Book advisor', 'एडवाइज़र बुक'), path: '/app/sessions' },
        { label: loc('Family module', 'फैमिली मॉड्यूल'), path: '/app/family/burnout' }
      ],
      disclaimer: loc(
        'If you are in immediate danger, call local emergency services.',
        'तुरंत खतरा हो तो स्थानीय इमरजेंसी नंबर पर कॉल करें।'
      )
    };
  }

  if (severity === 'moderate' || familyStress === 'high') {
    const familyPath =
      topic === 'parenting'
        ? '/app/family/parenting'
        : topic === 'family'
          ? '/app/family/husband-wife'
          : '/app/family/burnout';

    return {
      level: 'sakhi',
      title: loc('Sakhi-guided path', 'सखी के साथ रास्ता'),
      message: loc(
        'Try a short reel, AI Sakhi chat, and one family module action today. Small steps change the home climate.',
        'आज एक रील, AI सखी चैट, और एक फैमिली एक्शन आज़माएँ। छोटे कदम घर का माहौल बदलते हैं।'
      ),
      routes: [
        { label: loc('Sakhi Reels', 'सखी रील्स'), path: '/app/reels' },
        { label: loc('AI Sakhi', 'AI सखी'), path: '/app/ai-sakhi' },
        { label: loc('Family module', 'फैमिली मॉड्यूल'), path: familyPath }
      ]
    };
  }

  return {
    level: 'self',
    title: loc('Self-care at home', 'घर पर खुद की देखभाल'),
    message: loc(
      'Beautiful — you can start with breathing, affirmation, or a 10-minute meditation. Log family pulse daily.',
      'शानदार — साँस, affirmation, या १० मिनट meditation से शुरू करें। रोज़ फैमिली पल्स लॉग करें।'
    ),
    routes: [
      { label: loc('Meditation', 'मेडिटेशन'), path: '/app/meditation' },
      { label: loc('Affirmations', 'अफर्मेशन'), path: '/app/affirmation' },
      { label: loc('View insights', 'इनसाइट देखें'), path: '/app/insights' }
    ]
  };
};

export const getGuidanceLocalized = (obj, langCode) =>
  obj?.[langCode] || obj?.hi || obj?.en || '';
