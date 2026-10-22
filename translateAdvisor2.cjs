const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src/data/i18n/en.json');
const hiPath = path.join(__dirname, 'src/data/i18n/hi.json');
const mrPath = path.join(__dirname, 'src/data/i18n/mr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const mr = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

const translations = {
  advisorSlots: {
    en: {
      title: "Availability Master",
      desc: "Configure your active consultation hours for the upcoming week.",
      saving: "Saving...",
      saveMasterSchedule: "Save Master Schedule",
      weeklyRotation: "Weekly Rotation",
      quickSync: "Quick Sync with Google Calendar is coming in Phase 2.",
      slots: "Slots",
      workingSlots: "working slots",
      quickAdd: "Quick Add",
      needToBlock: "Need to block vacation dates?",
      configureExceptions: "Configure Exceptions"
    },
    hi: {
      title: "उपलब्धता मास्टर",
      desc: "आगामी सप्ताह के लिए अपने सक्रिय परामर्श घंटे कॉन्फ़िगर करें।",
      saving: "सहेजा जा रहा है...",
      saveMasterSchedule: "मास्टर शेड्यूल सहेजें",
      weeklyRotation: "साप्ताहिक रोटेशन",
      quickSync: "Google कैलेंडर के साथ त्वरित सिंक चरण 2 में आ रहा है।",
      slots: "स्लॉट",
      workingSlots: "कार्यरत स्लॉट",
      quickAdd: "त्वरित जोड़ें",
      needToBlock: "क्या छुट्टियों की तारीखों को ब्लॉक करने की आवश्यकता है?",
      configureExceptions: "अपवाद कॉन्फ़िगर करें"
    },
    mr: {
      title: "उपलब्धता मास्टर",
      desc: "आगामी आठवड्यासाठी तुमचे सक्रिय सल्लामसलत तास कॉन्फिगर करा.",
      saving: "जतन करत आहे...",
      saveMasterSchedule: "मास्टर वेळापत्रक जतन करा",
      weeklyRotation: "साप्ताहिक रोटेशन",
      quickSync: "Google कॅलेंडरसह द्रुत सिंक टप्पा 2 मध्ये येत आहे.",
      slots: "स्लॉट",
      workingSlots: "कार्यरत स्लॉट",
      quickAdd: "त्वरित जोडा",
      needToBlock: "सुट्टीच्या तारखा ब्लॉक करणे आवश्यक आहे का?",
      configureExceptions: "अपवाद कॉन्फिगर करा"
    }
  },
  advisorEarnings: {
    en: {
      title: "Earnings & Analytics",
      desc: "Track your consultation revenue and clinical impact metrics.",
      todayEarnings: "Today's Earnings",
      sessions: "sessions",
      activeMultiplier: "Active Multiplier",
      thisWeek: "This Week",
      weeklyBonus: "Weekly Bonus",
      totalRevenue: "Total Revenue",
      lifeTime: "Lifetime",
      successRate: "Success Rate",
      payouts: "Payouts",
      requestPayout: "Request Payout",
      requesting: "Requesting...",
      recentTransactions: "Recent Transactions",
      viewAll: "View All",
      statusCompleted: "COMPLETED",
      statusPending: "PENDING"
    },
    hi: {
      title: "कमाई और एनालिटिक्स",
      desc: "अपने परामर्श राजस्व और नैदानिक ​​प्रभाव मैट्रिक्स को ट्रैक करें।",
      todayEarnings: "आज की कमाई",
      sessions: "सत्र",
      activeMultiplier: "सक्रिय गुणक",
      thisWeek: "इस सप्ताह",
      weeklyBonus: "साप्ताहिक बोनस",
      totalRevenue: "कुल राजस्व",
      lifeTime: "आजीवन",
      successRate: "सफलता दर",
      payouts: "भुगतान",
      requestPayout: "भुगतान का अनुरोध करें",
      requesting: "अनुरोध किया जा रहा है...",
      recentTransactions: "हाल का लेन-देन",
      viewAll: "सभी देखें",
      statusCompleted: "पूरा हुआ",
      statusPending: "लंबित"
    },
    mr: {
      title: "कमाई आणि विश्लेषण",
      desc: "तुमच्या सल्लामसलत महसूल आणि क्लिनिकल प्रभाव मेट्रिक्सचा मागोवा घ्या.",
      todayEarnings: "आजची कमाई",
      sessions: "सत्रे",
      activeMultiplier: "सक्रिय गुणक",
      thisWeek: "या आठवड्यात",
      weeklyBonus: "साप्ताहिक बोनस",
      totalRevenue: "एकूण महसूल",
      lifeTime: "आजीवन",
      successRate: "यशाचा दर",
      payouts: "पेआउट",
      requestPayout: "पेआउटची विनंती करा",
      requesting: "विनंती करत आहे...",
      recentTransactions: "अलीकडील व्यवहार",
      viewAll: "सर्व पहा",
      statusCompleted: "पूर्ण",
      statusPending: "प्रलंबित"
    }
  }
};

for (const [key, langs] of Object.entries(translations)) {
  en[key] = langs.en;
  hi[key] = langs.hi;
  mr[key] = langs.mr;
}

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2) + '\n');
fs.writeFileSync(mrPath, JSON.stringify(mr, null, 2) + '\n');

console.log('Translations injected successfully part 2!');
