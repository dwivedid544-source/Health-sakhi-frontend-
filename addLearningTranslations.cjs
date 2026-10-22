const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src/data/i18n/en.json');
const hiPath = path.join(__dirname, 'src/data/i18n/hi.json');
const mrPath = path.join(__dirname, 'src/data/i18n/mr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const mr = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

const learningEn = {
  title: 'My Learning Journey 📚',
  subtitle: 'Keep going! You\'re making amazing progress this week.',
  streak: '12 Day Streak',
  watching: 'Watching',
  viewHistory: 'View History',
  done: 'Done',
  remaining: 'Remaining',
  left: 'Left',
  readingList: 'Reading List',
  myLibrary: 'My Library',
  readLabel: 'Read',
  pagesLeft: 'Pages Left',
  milestones: 'Wellness Milestones',
  knowledgePower: 'Your knowledge is your power.',
  milestoneDesc: 'Complete {count} more modules this week to unlock the "Hormonal Sage" digital badge and a free 1-min insight session.',
  exploreRewards: 'Explore Rewards',
  inProgress: 'In Progress',
  resumeLearning: 'Resume Learning',
  welcomeBackQuote: 'Welcome back, Sakhi. You\'re doing great. Let\'s finish this session together.',
  resumingFrom: 'Resuming from',
  potentialCoins: 'Potential Coins',
  markCompleted: 'Mark as Completed'
};

const learningHi = {
  title: 'मेरी सीखने की यात्रा 📚',
  subtitle: 'चलते रहो! आप इस सप्ताह अद्भुत प्रगति कर रहे हैं।',
  streak: '12 दिन की स्ट्रीक',
  watching: 'देख रहे हैं',
  viewHistory: 'इतिहास देखें',
  done: 'पूर्ण',
  remaining: 'शेष',
  left: 'बचे हैं',
  readingList: 'पढ़ने की सूची',
  myLibrary: 'मेरी लाइब्रेरी',
  readLabel: 'पढ़ा',
  pagesLeft: 'पेज बचे हैं',
  milestones: 'कल्याण के मील के पत्थर',
  knowledgePower: 'आपका ज्ञान आपकी शक्ति है।',
  milestoneDesc: 'इस सप्ताह {count} और मॉड्यूल पूरे करें और "हार्मोनल सेज" डिजिटल बैज और 1-मिनट का मुफ्त इनसाइट सत्र अनलॉक करें।',
  exploreRewards: 'इनाम खोजें',
  inProgress: 'प्रगति पर है',
  resumeLearning: 'सीखना फिर से शुरू करें',
  welcomeBackQuote: 'वापसी पर स्वागत है, सखी। आप बहुत अच्छा कर रही हैं। आइए इस सत्र को एक साथ पूरा करें।',
  resumingFrom: 'से फिर से शुरू हो रहा है',
  potentialCoins: 'संभावित सिक्के',
  markCompleted: 'पूर्ण के रूप में चिह्नित करें'
};

const learningMr = {
  title: 'माझा शिकण्याचा प्रवास 📚',
  subtitle: 'चालू ठेवा! तुम्ही या आठवड्यात आश्चर्यकारक प्रगती करत आहात.',
  streak: '12 दिवसांची स्ट्रीक',
  watching: 'पाहत आहे',
  viewHistory: 'इतिहास पहा',
  done: 'पूर्ण',
  remaining: 'उर्वरित',
  left: 'उरले',
  readingList: 'वाचनाची यादी',
  myLibrary: 'माझी लायब्ररी',
  readLabel: 'वाचले',
  pagesLeft: 'पाने उरली',
  milestones: 'कल्याणचे टप्पे',
  knowledgePower: 'तुमचे ज्ञान हीच तुमची ताकद आहे.',
  milestoneDesc: 'या आठवड्यात आणखी {count} मॉड्यूल पूर्ण करा आणि "हार्मोनल सेज" डिजिटल बॅज आणि 1-मिनिटाचे मोफत इनसाइट सत्र अनलॉक करा.',
  exploreRewards: 'बक्षिसे एक्सप्लोर करा',
  inProgress: 'प्रगतीपथावर आहे',
  resumeLearning: 'पुन्हा शिकणे सुरू करा',
  welcomeBackQuote: 'परत स्वागत आहे, सखी. तुम्ही खूप छान करत आहात. चला हे सत्र एकत्र पूर्ण करूया.',
  resumingFrom: 'पासून पुन्हा सुरू करत आहे',
  potentialCoins: 'संभाव्य नाणी',
  markCompleted: 'पूर्ण म्हणून चिन्हांकित करा'
};

en.learning = { ...en.learning, ...learningEn };
hi.learning = { ...hi.learning, ...learningHi };
mr.learning = { ...mr.learning, ...learningMr };

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2));
fs.writeFileSync(mrPath, JSON.stringify(mr, null, 2));

console.log('Learning translations added.');
