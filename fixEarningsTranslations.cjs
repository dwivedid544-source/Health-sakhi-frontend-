const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src/data/i18n/en.json');
const hiPath = path.join(__dirname, 'src/data/i18n/hi.json');
const mrPath = path.join(__dirname, 'src/data/i18n/mr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const mr = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

const translations = {
  advisorEarnings: {
    en: {
      title: "Earnings & Analytics",
      desc: "Tracking your impact and consultation rewards.",
      statements: "Statements",
      requestPayout: "Request Payout",
      unpaidBalance: "Unpaid Balance",
      totalEarned: "Total Earned",
      thisMonth: "This Month",
      recentTransactions: "Recent Sessions",
      last30Days: "Last 30 Days",
      sessionDetails: "Session Details",
      user: "User",
      amount: "Amount",
      status: "Status",
      statusCompleted: "PAID",
      statusPending: "PENDING",
      rewardsProgress: "Rewards Progress",
      monthlyBonusGoal: "Monthly Bonus Goal",
      milestoneText: "You are working towards your <span class=\"text-health-green font-bold\">Performance Milestone Bonus</span>. Keep it up!",
      viewBonusRules: "View Bonus Rules"
    },
    hi: {
      title: "कमाई और एनालिटिक्स",
      desc: "अपने परामर्श राजस्व और नैदानिक ​​प्रभाव मैट्रिक्स को ट्रैक करें।",
      statements: "विवरण",
      requestPayout: "भुगतान का अनुरोध करें",
      unpaidBalance: "बकाया राशि",
      totalEarned: "कुल कमाई",
      thisMonth: "इस महीने",
      recentTransactions: "हाल के सत्र",
      last30Days: "पिछले 30 दिन",
      sessionDetails: "सत्र विवरण",
      user: "उपयोगकर्ता",
      amount: "राशि",
      status: "स्थिति",
      statusCompleted: "भुगतान किया",
      statusPending: "लंबित",
      rewardsProgress: "इनाम प्रगति",
      monthlyBonusGoal: "मासिक बोनस लक्ष्य",
      milestoneText: "आप अपने <span class=\"text-health-green font-bold\">प्रदर्शन मील का पत्थर बोनस</span> की ओर काम कर रहे हैं। इसे बनाए रखें!",
      viewBonusRules: "बोनस नियम देखें"
    },
    mr: {
      title: "कमाई आणि विश्लेषण",
      desc: "तुमच्या सल्लामसलत महसूल आणि क्लिनिकल प्रभाव मेट्रिक्सचा मागोवा घ्या.",
      statements: "स्टेटमेंट्स",
      requestPayout: "पेआउटची विनंती करा",
      unpaidBalance: "थकबाकी",
      totalEarned: "एकूण कमाई",
      thisMonth: "या महिन्यात",
      recentTransactions: "अलीकडील सत्रे",
      last30Days: "गेले 30 दिवस",
      sessionDetails: "सत्र तपशील",
      user: "वापरकर्ता",
      amount: "रक्कम",
      status: "स्थिती",
      statusCompleted: "पैसे दिले",
      statusPending: "प्रलंबित",
      rewardsProgress: "बक्षीस प्रगती",
      monthlyBonusGoal: "मासिक बोनस ध्येय",
      milestoneText: "तुम्ही तुमच्या <span class=\"text-health-green font-bold\">कामगिरी टप्पा बोनस</span> च्या दिशेने काम करत आहात. ते चालू ठेवा!",
      viewBonusRules: "बोनस नियम पहा"
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

console.log('Earnings translations fixed successfully!');
