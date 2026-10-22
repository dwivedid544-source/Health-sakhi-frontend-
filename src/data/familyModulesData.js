/** Family Hub modules — multilingual content */

const loc = (en, hi, mr) => ({ en, hi: hi || en, mr: mr || hi || en, ta: en, te: en, bn: en, ar: en });

export const familyModules = [
  {
    id: 'husband-wife',
    slug: 'husband-wife',
    emoji: '💑',
    gradient: 'from-rose-100 via-pink-50 to-purple-50',
    accent: '#ff69b4',
    relatedReels: ['reel_husband_stress', 'reel_finance_stress', 'reel_self_care'],
    title: loc('Husband–Wife Bonding', 'पति–पत्नी का रिश्ता', 'पती–पत्नी नाते'),
    subtitle: loc('When stress travels between partners', 'जब तनाव पार्टनर के बीच जाता है', 'जेव्हा ताण जोडीदारांमध्ये पसरतो'),
    description: loc(
      'His silence is not always about you. Learn to hold space without absorbing every wave. Small rituals rebuild warmth.',
      'उसकी खामोशी हमेशा आपके खिलाफ नहीं होती। हर लहर को सोखे बिना साथ रहना सीखें। छोटी रीतें फिर से गर्माहट लाती हैं।',
      'त्याची शांतता नेहमी तुमच्याबद्दल नसते. प्रत्येक लाट शोषून न घेता एकत्र राहणे शिका. छोट्या सवयी पुन्हा उबदारपणा आणतात.'
    ),
    dailyPrompts: [
      loc('Ask one gentle question: "Kya tum thake ho?" — without fixing.', 'एक कोमल सवाल: "क्या तुम थके हो?" — बिना सुलझाए।', 'एक हळुवार प्रश्न: "तुम्ही थकलात का?" — उत्तर शोधल्याशिवाय.'),
      loc('Share one appreciation before sleep.', 'सोने से पहले एक appreciation बाँटें।', 'झोपण्यापूर्वी एक कौतुक सांगा.'),
      loc('10-minute walk together — phones off.', '१० मिनट साथ टहलें — फोन बंद।', '१० मिनिटे एकत्र फिरा — फोन बंद.')
    ],
    tips: [
      loc('You are teammates, not opponents in stress.', 'तनाव में विरोधी नहीं, टीम हो।', 'ताणात विरोधी नाही, संघ व्हा.'),
      loc('Pause before replying when voices rise.', 'आवाज़ ऊँची हो तो जवाब से पहले रुकें।', 'आवाज वाढली की उत्तर देण्यापूर्वी थांबा.')
    ],
    actions: [
      { label: loc('Watch bonding reels', 'बॉन्डिंग रील्स', 'बॉन्डिंग रील्स पहा'), route: '/app/reels?reel=reel_husband_stress', type: 'reels' },
      { label: loc('Talk to AI Sakhi', 'AI सखी से बात', 'AI सखीशी बोला'), route: '/app/ai-sakhi', type: 'sakhi', promptKey: 'husband' }
    ]
  },
  {
    id: 'parenting',
    slug: 'parenting',
    emoji: '👧',
    gradient: 'from-emerald-50 via-teal-50 to-cyan-50',
    accent: '#059669',
    relatedReels: ['reel_parenting_silent', 'reel_child_anxiety'],
    title: loc('Parenting with Heart', 'दिल से पेरेंटिंग', 'मनापासून पालकत्व'),
    subtitle: loc('Teens, tantrums & tender moments', 'टीन, नखरे और कोमल पल', 'किशोरवय, हट्ट आणि कोमल क्षण'),
    description: loc(
      'Parenting is presence, not control. Your calm is their anchor — even when they push away.',
      'पेरेंटिंग नियंत्रण नहीं — उपस्थिति है। जब वे दूर धकेलें तब भी आपकी शांति उनका anchor है।',
      'पालकत्व म्हणजे नियंत्रण नाही — उपस्थिती. ते दूर लोटले तरी तुमची शांतता त्यांचा आधार आहे.'
    ),
    dailyPrompts: [
      loc('Sit beside them 5 min — no advice, just presence.', '५ मिनट बगल में बैठें — सलाह नहीं, बस मौजूदगी।', '५ मिनिटे बाजूला बसा — सल्ला नाही, फक्त उपस्थिती.'),
      loc('Notice one good thing they did today.', 'आज उन्होंने जो अच्छा किया, एक बात नोट करें।', 'आज त्यांनी केलेली एक चांगली गोष्ट नोंदवा.'),
      loc('Breathe together before a difficult talk.', 'मुश्किल बात से पहले साथ साँस लें।', 'कठीण बोलण्यापूर्वी एकत्र श्वास घ्या.')
    ],
    tips: [
      loc('Their silence often means overwhelm, not disrespect.', 'खामोशी अक्सर बेइज़्जती नहीं — थकान है।', 'त्यांची शांतता अनेकदा थकवा असते, अनादर नाही.'),
      loc('Repair matters more than being right.', 'सही होने से ज़्यादा माफ़ी और फिर से जुड़ना।', 'बरोबर असण्यापेक्षा दुरुस्त करणे महत्त्वाचे.')
    ],
    actions: [
      { label: loc('Parenting reels', 'पेरेंटिंग रील्स', 'पालकत्व रील्स'), route: '/app/reels?reel=reel_parenting_silent', type: 'reels' },
      { label: loc('Heart to Heart book', 'Heart to Heart किताब', 'Heart to Heart पुस्तक'), route: '/app/books/1', type: 'book' }
    ]
  },
  {
    id: 'elder-care',
    slug: 'elder-care',
    emoji: '🤝',
    gradient: 'from-slate-100 via-blue-50 to-indigo-50',
    accent: '#4f46e5',
    relatedReels: ['reel_elder_care', 'reel_mil_tension'],
    title: loc('Elder Care & Boundaries', 'बड़ों की देखभाल', 'ज्येष्ठांची काळजी आणि सीमा'),
    subtitle: loc('Honor parents, protect your peace', 'माता-पिता का सम्मान, अपनी शांति', 'आई-वडिलांचा आदर, स्वतःची शांती'),
    description: loc(
      'Caring for elders is sacred — but guilt is not love. Rest is part of care.',
      'बड़ों की देखभाल पवित्र है — पर अपराधबोध प्यार नहीं। आराम भी देखभाल का हिस्सा है।',
      'ज्येष्ठांची काळजी पवित्र आहे — पण अपराधीपणा प्रेम नाही. विश्रांती देखभालचा भाग आहे.'
    ),
    dailyPrompts: [
      loc('Schedule 15 min only for you — non-negotiable.', 'सिर्फ अपने लिए १५ मिनट — ज़रूरी।', 'फक्त तुमच्यासाठी १५ मिनिटे — आवश्यक.'),
      loc('Ask for help from one family member.', 'एक परिवार वाले से मदद माँगें।', 'एका कुटुंब सदस्याकडून मदत मागा.'),
      loc('One kind sentence to an elder — no debate.', 'बड़ों को एक दयालु वाक्य — बहस नहीं।', 'एखाद्या ज्येष्ठाला एक प्रेमळ वाक्य — वाद नाही.')
    ],
    tips: [
      loc('Bridge role is heavy — you need support too.', 'पुल बनना भारी है — आपको भी सहारा चाहिए।', 'दुवा बनणे जड आहे — तुम्हालाही आधार हवा.'),
      loc('Boundaries can be loving.', 'सीमा प्यार से भी हो सकती है।', 'सीमा प्रेमाने ही असू शकते.')
    ],
    actions: [
      { label: loc('Elder care reels', 'एल्डर केयर रील्स', 'ज्येष्ठ काळजी रील्स'), route: '/app/reels?reel=reel_elder_care', type: 'reels' },
      { label: loc('Book advisor session', 'एडवाइज़र सेशन', 'सल्लागार सत्र बुक करा'), route: '/app/sessions', type: 'session' }
    ]
  },
  {
    id: 'burnout',
    slug: 'burnout',
    emoji: '✨',
    gradient: 'from-amber-50 via-orange-50 to-rose-50',
    accent: '#D97706',
    relatedReels: ['reel_burnout', 'reel_self_care', 'reel_no_one_listens'],
    title: loc('Burnout & Self-Restore', 'बर्नआउट और खुद को संभालना', 'बर्नआउट आणि स्वतःला सावरणे'),
    subtitle: loc('Strong for everyone, empty inside', 'सबके लिए मज़बूत, अंदर से खाली', 'सगळ्यांसाठी मजबूत, आतून रिकामे'),
    description: loc(
      'Superwoman is a myth. Your family needs your wellbeing — not your exhaustion.',
      'सुपरवूमन मिथक है। परिवार को आपकी थकान नहीं — आपकी खुशी चाहिए।',
      'सुपरवूमन मिथक आहे. कुटुंबाला तुमचा थकवा नाही — तुमचा आनंद हवा आहे.'
    ),
    dailyPrompts: [
      loc('Say no to one extra task today.', 'आज एक extra काम के लिए ना कहें।', 'आज एका जास्तीच्या कामाला नाही म्हणा.'),
      loc('Drink water + 3 deep breaths before lunch.', 'लंच से पहले पानी + ३ गहरी साँसें।', 'जेवणापूर्वी पाणी + ३ खोल श्वास.'),
      loc('Ask: "What do I need right now?"', 'पूछें: "अभी मुझे क्या चाहिए?"', 'विचारा: "मला आत्ता काय हवे आहे?"')
    ],
    tips: [
      loc('Rest is productive for the whole home.', 'आराम पूरे घर के लिए ज़रूरी है।', 'विश्रांती संपूर्ण घरासाठी उत्पादक आहे.'),
      loc('Asking for help is strength.', 'मदद माँगना ताकत है।', 'मदत मागणे ताकद आहे.')
    ],
    actions: [
      { label: loc('Burnout reels', 'बर्नआउट रील्स', 'बर्नआउट रील्स'), route: '/app/reels?reel=reel_burnout', type: 'reels' },
      { label: loc('Meditation Sakhi', 'मेडिटेशन सखी', 'मेडिटेशन सखी'), route: '/app/meditation', type: 'meditation' }
    ]
  },
  {
    id: 'domestic-home',
    slug: 'domestic-home',
    emoji: '🏠',
    gradient: 'from-rose-100 via-orange-50 to-amber-50',
    accent: '#e11d48',
    relatedReels: ['reel_domestic_tension', 'reel_mil_tension', 'reel_finance_stress'],
    title: loc('Domestic Peace & Understanding', 'घरेलू शांति और समझ', 'घरगुती शांती आणि समजूतदारपणा'),
    subtitle: loc('Silent tension, control, or in-law stress', 'चुप्पी, नियंत्रण, या ससुराल का तनाव', 'शांत ताण, नियंत्रण, किंवा सासरचा ताण'),
    description: loc(
      'Domestic issues are not always loud. Learn to notice patterns, protect your peace, and seek support without shame.',
      'घरेलू समस्या हमेशा शोर से नहीं आती। पैटर्न पहचानें, शांति बचाएँ, बिना शर्म के सहारा लें।',
      'घरगुती समस्या नेहमी मोठ्याने येत नाहीत. नमुने ओळखा, शांती जपा, लाजेशिवाय आधार घ्या.'
    ),
    dailyPrompts: [
      loc('Write one sentence: what felt heavy at home today?', 'एक वाक्य लिखें: आज घर में क्या भारी लगा?', 'एक वाक्य लिहा: आज घरात काय जड वाटले?'),
      loc('Take 5 minutes alone — tea, breath, no phone.', '५ मिनट अकेले — चाय, साँस, फोन नहीं।', '५ मिनिटे एकट्याने — चहा, श्वास, फोन नाही.'),
      loc('Share one feeling with Sakhi before sleep.', 'सोने से पहले सखी को एक भावना बताएँ।', 'झोपण्यापूर्वी सखीला एक भावना सांगा.')
    ],
    tips: [
      loc('Your feelings are valid even if others minimize them.', 'आपकी भावनाएँ सही हैं — चाहे कोई कम करके देखे।', 'तुमच्या भावना योग्य आहेत — इतरांनी कमी लेखले तरी.'),
      loc('Safety first: if you feel unsafe, reach helpline or advisor.', 'पहले सुरक्षा — असुरक्षित लगे तो हेल्पलाइन या एडवाइज़र।', 'प्रथम सुरक्षा — असुरक्षित वाटल्यास हेल्पलाइन किंवा सल्लागार.')
    ],
    actions: [
      { label: loc('Awareness guide', 'अवेयरनेस गाइड', 'जागरूकता मार्गदर्शन'), route: '/app/awareness', type: 'awareness' },
      { label: loc('Domestic reels', 'घरेलू रील्स', 'घरगुती रील्स'), route: '/app/reels?reel=reel_domestic_tension', type: 'reels' },
      { label: loc('Guidance wizard', 'गाइडेंस', 'मार्गदर्शन'), route: '/app/guidance', type: 'guidance' }
    ]
  }
];

export const getModuleBySlug = (slug) => familyModules.find((m) => m.slug === slug);

export const getLocalized = (obj, langCode) =>
  obj?.[langCode] || obj?.hi || obj?.en || '';
