const DEFAULT_LANG = 'en';

const copy = {
  en: {
    readingProgress: 'Reading Progress',
    pageOf: 'Page',
    of: 'of',
    complete: 'complete',
    minsLeft: 'min left',
    sakhiTip: 'Sakhi Tip',
    bookmark: 'Bookmark page',
    bookmarked: 'Bookmarked',
    translating: 'Translating',
    pagesLabel: 'Pages',
    wellnessLevel: 'Wellness Level',
    keepReading: 'Keep reading to grow',
    levels: { starter: 'Starter', bronze: 'Bronze', silver: 'Silver', gold: 'Gold', complete: 'Complete' },
    reflections: [
      'Every journey begins with a single step of awareness.',
      'Patience with yourself is the gentlest form of love.',
      'Understanding grows when we listen before we speak.',
      'Small daily reads build lifelong wellness habits.',
      'Your story matters — take it one page at a time.'
    ],
    tips: [
      'Read 10 minutes daily — consistency beats speed.',
      'Pause after each chapter and breathe deeply.',
      'Share one insight with family today.',
      'Use Listen mode when your eyes need rest.',
      'Revisit favourite pages — wisdom deepens with time.'
    ]
  },
  hi: {
    readingProgress: 'पढ़ने की प्रगति',
    pageOf: 'पृष्ठ',
    of: 'में से',
    complete: 'पूर्ण',
    minsLeft: 'मिनट बाकी',
    sakhiTip: 'सखी सुझाव',
    bookmark: 'पृष्ठ सेव करें',
    bookmarked: 'सेव हो गया',
    translating: 'अनुवाद हो रहा है',
    pagesLabel: 'पृष्ठ',
    wellnessLevel: 'वेलनेस स्तर',
    keepReading: 'पढ़ते रहें, बढ़ते रहें',
    levels: { starter: 'शुरुआत', bronze: 'कांस्य', silver: 'रजत', gold: 'स्वर्ण', complete: 'पूर्ण' },
    reflections: [
      'हर यात्रा जागरूकता के एक कदम से शुरू होती है।',
      'खुद के प्रति धैर्य सबसे कोमल प्रेम है।',
      'समझ तब बढ़ती है जब हम बोलने से पहले सुनते हैं।',
      'रोज़ थोड़ा पढ़ना आजीवन आदत बनाता है।',
      'आपकी कहानी मायने रखती है — एक पृष्ठ एक समय।'
    ],
    tips: [
      'रोज़ 10 मिनट पढ़ें — नियमितता ज़रूरी है।',
      'हर अध्याय के बाद रुककर गहरी साँस लें।',
      'आज परिवार के साथ एक बात साझा करें।',
      'आँखों को आराम चाहिए तो सुनें मोड इस्तेमाल करें।',
      'पसंदीदा पृष्ठ दोबारा पढ़ें — समझ गहरी होती है।'
    ]
  },
  mr: {
    readingProgress: 'वाचन प्रगती',
    pageOf: 'पान',
    of: 'पैकी',
    complete: 'पूर्ण',
    minsLeft: 'मिनिटे बाकी',
    sakhiTip: 'सखी टिप',
    bookmark: 'पान जतन करा',
    bookmarked: 'जतन झाले',
    translating: 'भाषांतर होत आहे',
    pagesLabel: 'पाने',
    wellnessLevel: 'वेलनेस पातळी',
    keepReading: 'वाचत राहा, वाढत राहा',
    levels: { starter: 'सुरुवात', bronze: 'कांस्य', silver: 'चांदी', gold: 'सोने', complete: 'पूर्ण' },
    reflections: [
      'प्रत्येक प्रवास जागरूकतेच्या एक पाऊलाने सुरू होतो.',
      'स्वतःबद्दल संयम हा सर्वात कोमल प्रेम आहे.',
      'बोलण्यापूर्वी ऐकल्यावर समज वाढते.',
      'दररोज थोडे वाचन सवय बनवते.',
      'तुमची कथा महत्त्वाची आहे — एक पान एक वेळ.'
    ],
    tips: [
      'दररोज 10 मिनिटे वाचा — सातत्य महत्त्वाचे.',
      'प्रत्येक अध्यायानंतर थांबा आणि श्वास घ्या.',
      'आज कुटुंबासोबत एक विचार शेअर करा.',
      'डोळ्यांना आराम हवा असेल तर ऐका मोड वापरा.',
      'आवडते पान पुन्हा वाचा — समज खोल होते.'
    ]
  },
  ta: {
    readingProgress: 'வாசிப்பு முன்னேற்றம்',
    pageOf: 'பக்கம்',
    of: 'இல்',
    complete: 'முடிந்தது',
    minsLeft: 'நிமிடம் மீதம்',
    sakhiTip: 'சகி குறிப்பு',
    bookmark: 'பக்கத்தை சேமி',
    bookmarked: 'சேமிக்கப்பட்டது',
    translating: 'மொழிபெயர்ப்பு நடக்கிறது',
    pagesLabel: 'பக்கங்கள்',
    wellnessLevel: 'நலன் நிலை',
    keepReading: 'தொடர்ந்து வாசியுங்கள்',
    levels: { starter: 'தொடக்கம்', bronze: 'வெண்கலம்', silver: 'வெள்ளி', gold: 'தங்கம்', complete: 'முழுமை' },
    reflections: [
      'ஒவ்வொரு பயணமும் விழிப்புணர்வின் ஒரு படியில் தொடங்குகிறது.',
      'உங்களிடம் பொறுமை மிகவும் மென்மையான அன்பு.',
      'பேசுவதற்கு முன் கேட்கும்போது புரிதல் வளரும்.',
      'தினமும் சிறிது வாசிப்பு பழக்கத்தை உருவாக்கும்.',
      'உங்கள் கதை முக்கியம் — ஒரு பக்கம் ஒரு நேரம்.'
    ],
    tips: [
      'தினமும் 10 நிமிடம் வாசியுங்கள்.',
      'ஒவ்வொரு அத்தியாயத்திற்கும் பிறகு இடைவெளி எடுங்கள்.',
      'இன்று குடும்பத்துடன் ஒரு எண்ணத்தை பகிருங்கள்.',
      'கண்களுக்கு ஓய்வு வேண்டுமெனில் கேள்வி முறையைப் பயன்படுத்துங்கள்.',
      'பிடித்த பக்கங்களை மீண்டும் வாசியுங்கள்.'
    ]
  }
};

export function getReaderCopy(langCode) {
  return copy[langCode] || copy[DEFAULT_LANG];
}

export function getSakhiTip(langCode, index) {
  const c = getReaderCopy(langCode);
  return c.tips[index % c.tips.length];
}

export function getSakhiReflection(langCode, index) {
  const c = getReaderCopy(langCode);
  return c.reflections[index % c.reflections.length];
}

export function getWellnessLevel(readPercent) {
  if (readPercent >= 100) return 'complete';
  if (readPercent >= 75) return 'gold';
  if (readPercent >= 50) return 'silver';
  if (readPercent >= 25) return 'bronze';
  return 'starter';
}

/** ~200 words/min reading speed */
export function estimateMinutesLeft(pages, currentPage) {
  if (!pages || !pages.length) return 0;
  let chars = 0;
  for (let i = currentPage; i < pages.length; i += 1) {
    const text = pages[i];
    if (typeof text === 'string') {
      const tmp = text.replace(/<[^>]+>/g, ' ');
      chars += tmp.length;
    } else {
      // PDF or fallback page: estimate ~1000 characters (approx 200 words) per page
      chars += 1000;
    }
  }
  const words = chars / 5;
  return Math.max(1, Math.ceil(words / 200));
}
