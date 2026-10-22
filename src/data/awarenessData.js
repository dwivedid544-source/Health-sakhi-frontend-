/** Awareness layer — education without breaking clinical tone */

const loc = (en, hi) => ({ en, hi });

export const awarenessTopics = [
  {
    id: 'stress-health',
    emoji: '🔗',
    accent: '#8b5cf6',
    gradient: 'from-violet-50 via-purple-50 to-rose-50',
    title: loc('Stress → Health connection', 'तनाव → सेहत का जुड़ाव'),
    summary: loc(
      'Chronic stress is not “only in the mind.” It can affect sleep, hormones, digestion, immunity, and pain.',
      'लंबा तनाव सिर्फ “दिमाग में” नहीं — नींद, हार्मोन, पाचन, रोग प्रतिरोध और दर्द पर असर डाल सकता है।'
    ),
    chain: [
      { label: loc('Emotional stress', 'भावनात्मक तनाव'), emoji: '🌪️' },
      { label: loc('Sleep & appetite change', 'नींद और भूख बदलना'), emoji: '🌙' },
      { label: loc('Hormone signals shift', 'हार्मोन संकेत बदलना'), emoji: '⚡' },
      { label: loc('Body speaks (pain, fatigue)', 'शरीर बोलता है'), emoji: '🩺' }
    ],
    learnMore: [
      loc('Track mood + family pulse together — patterns appear faster.', 'मूड और फैमिली पल्स साथ ट्रैक करें।'),
      loc('Small daily resets (water, walk, breath) protect long-term health.', 'पानी, टहलना, साँस — लंबी सेहत बचाते हैं।'),
      loc('If symptoms persist weeks, guidance can help you choose next step.', 'हफ्तों तक लक्षण रहें तो गाइडेंस अगला कदम दिखाए।')
    ],
    actions: [
      { label: loc('View my insight chain', 'मेरी इनसाइट चेन'), path: '/app/insights' },
      { label: loc('Stress & family reels', 'तनाव रील्स'), path: '/app/reels?reel=reel_period_stress' }
    ]
  },
  {
    id: 'care-guidance',
    emoji: '🩺',
    accent: '#0d9488',
    gradient: 'from-teal-50 via-emerald-50 to-cyan-50',
    title: loc('When to see a doctor or therapist', 'डॉक्टर या थेरेपिस्ट कब जाएँ'),
    summary: loc(
      'You do not need a crisis to seek help. Knowing the right type of support saves time and emotional energy.',
      'संकट की ज़रूरत नहीं — सही सहारा समय और भावनात्मक ऊर्जा बचाता है।'
    ),
    careTypes: [
      {
        id: 'self',
        title: loc('Self-care at home', 'घर पर सेल्फ-केयर'),
        when: loc('Mild stress, need rest, grounding, daily routine support.', 'हल्का तनाव, आराम, रूटीन सहारा।'),
        examples: loc('Meditation, affirmations, reels, AI Sakhi chat.', 'मेडिटेशन, अफर्मेशन, रील्स, AI सखी।'),
        path: '/app/meditation'
      },
      {
        id: 'therapist',
        title: loc('Counsellor / therapist', 'काउंसलर / थेरेपिस्ट'),
        when: loc('Ongoing sadness, anxiety, relationship conflict, feeling unheard, domestic tension.', 'उदासी, चिंता, रिश्ते, घरेलू तनाव।'),
        examples: loc('Talk therapy, emotional processing, family communication skills.', 'बातचीत, भावनाएँ संभालना, संवाद कौशल।'),
        path: '/app/sessions'
      },
      {
        id: 'doctor',
        title: loc('Doctor / gynecologist', 'डॉक्टर / गाइनकोलॉजिस्ट'),
        when: loc('Physical symptoms: irregular periods, severe pain, sudden weight change, persistent fatigue.', 'अनियमित पीरियड, तेज़ दर्द, वजन/थकान बदलाव।'),
        examples: loc('Medical exam, hormones, thyroid, anemia, PCOD checks.', 'जाँच, हार्मोन, थायराइड, PCOD।'),
        path: '/app/period'
      }
    ],
    warningSigns: loc(
      'Seek urgent help if: thoughts of self-harm, violence at home, chest pain, or sudden severe symptoms.',
      'तुरंत मदद: आत्म-हानि के विचार, घर में हिंसा, सीने में दर्द, अचानक गंभीर लक्षण।'
    ),
    actions: [
      { label: loc('Guidance wizard', 'गाइडेंस विज़ार्ड'), path: '/app/guidance' },
      { label: loc('Book advisor session', 'सेशन बुक'), path: '/app/sessions' }
    ]
  },
  {
    id: 'domestic-understanding',
    emoji: '🏠',
    accent: '#e11d48',
    gradient: 'from-rose-50 via-orange-50 to-amber-50',
    title: loc('Understanding domestic issues', 'घरेलू मुद्दों को समझना'),
    summary: loc(
      'Domestic stress is often silent — criticism, control, financial pressure, in-laws, or emotional distance. Your body may react before words are spoken.',
      'घरेलू तनाव अक्सर चुपचाप होता है — आलोचना, नियंत्रण, पैसा, ससुराल, दूरी। शरीर कभी शब्दों से पहले प्रतिक्रिया देता है।'
    ),
    patterns: [
      loc('Walking on eggshells at home', 'घर में सतर्क रहना'),
      loc('Guilt when you rest or say no', 'आराम या “ना” पर अपराधबोध'),
      loc('Children or elders caught in the middle', 'बच्चे/बड़े बीच में'),
      loc('Financial arguments affecting sleep', 'पैसों पर झगड़ा → नींद खराब')
    ],
    supportSteps: [
      loc('Name what is happening — silent, verbal, or financial pressure.', 'क्या हो रहा है पहचानें — चुप्पी, बात, या पैसा।'),
      loc('Set one small boundary with love, not anger.', 'प्यार से एक छोटी सीमा तय करें।'),
      loc('Talk to Sakhi or a trusted advisor — you deserve support.', 'सखी या एडवाइज़र — आप सहारे के लायक हैं।')
    ],
    actions: [
      { label: loc('Family module', 'फैमिली मॉड्यूल'), path: '/app/family/domestic-home' },
      { label: loc('Domestic reels', 'घरेलू रील्स'), path: '/app/reels?reel=reel_domestic_tension' }
    ]
  }
];

export const getAwarenessLocalized = (obj, langCode) =>
  obj?.[langCode] || obj?.hi || obj?.en || '';
