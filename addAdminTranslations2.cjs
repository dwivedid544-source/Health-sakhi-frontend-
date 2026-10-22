const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src/data/i18n/en.json');
const hiPath = path.join(__dirname, 'src/data/i18n/hi.json');
const mrPath = path.join(__dirname, 'src/data/i18n/mr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const mr = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

const translations = {
  adminGlobalAppointments: {
    en: {
      title: "Consultation Master-View",
      desc: "Monitoring all active wellness sessions across the platform.",
      realtimeGrid: "REAL-TIME GRID",
      historyLog: "HISTORY LOG",
      searchPlaceholder: "Search by patient name, advisor or appointment ID...",
      allMode: "ALL MODE",
      live: "LIVE",
      scheduled: "SCHEDULED",
      idSchedule: "ID & SCHEDULE",
      participants: "PARTICIPANTS",
      platformMode: "PLATFORM MODE",
      liveStatus: "LIVE STATUS",
      console: "CONSOLE",
      operationCenter: "Operation Center",
      liveSessions: "LIVE SESSIONS",
      pendingSlots: "PENDING SLOTS",
      dailyCompletion: "DAILY COMPLETION",
      generateLog: "GENERATE FULL LOG",
      nodeLatency: "NODE LATENCY",
      nodeLatencyDesc: "Global server sync is operating at 24ms. Real-time session monitoring is nominal.",
      compilingLogs: "Compiling Logs...",
      mode: {
        allmode: "All Mode",
        live: "Live",
        scheduled: "Scheduled"
      }
    },
    hi: {
      title: "परामर्श मास्टर-व्यू",
      desc: "प्लेटफ़ॉर्म पर सभी सक्रिय वेलनेस सत्रों की निगरानी।",
      realtimeGrid: "रीयल-टाइम ग्रिड",
      historyLog: "इतिहास लॉग",
      searchPlaceholder: "रोगी के नाम, सलाहकार या नियुक्ति आईडी द्वारा खोजें...",
      allMode: "सभी मोड",
      live: "लाइव",
      scheduled: "अनुसूचित",
      idSchedule: "आईडी और अनुसूची",
      participants: "प्रतिभागी",
      platformMode: "प्लेटफ़ॉर्म मोड",
      liveStatus: "लाइव स्थिति",
      console: "कंसोल",
      operationCenter: "ऑपरेशन सेंटर",
      liveSessions: "लाइव सत्र",
      pendingSlots: "लंबित स्लॉट",
      dailyCompletion: "दैनिक पूर्णता",
      generateLog: "पूर्ण लॉग जनरेट करें",
      nodeLatency: "नोड विलंबता",
      nodeLatencyDesc: "वैश्विक सर्वर सिंक 24ms पर काम कर रहा है। रीयल-टाइम सत्र निगरानी नाममात्र है।",
      compilingLogs: "लॉग संकलित हो रहा है...",
      mode: {
        allmode: "सभी मोड",
        live: "लाइव",
        scheduled: "अनुसूचित"
      }
    },
    mr: {
      title: "सल्लामसलत मास्टर-व्ह्यू",
      desc: "प्लॅटफॉर्मवरील सर्व सक्रिय वेलनेस सत्रांचे निरीक्षण.",
      realtimeGrid: "रिअल-टाइम ग्रिड",
      historyLog: "इतिहास लॉग",
      searchPlaceholder: "रुग्णाचे नाव, सल्लागार किंवा नियुक्ती आयडीद्वारे शोधा...",
      allMode: "सर्व मोड",
      live: "थेट",
      scheduled: "नियोजित",
      idSchedule: "आयडी आणि वेळापत्रक",
      participants: "सहभागी",
      platformMode: "प्लॅटफॉर्म मोड",
      liveStatus: "थेट स्थिती",
      console: "कन्सोल",
      operationCenter: "ऑपरेशन सेंटर",
      liveSessions: "थेट सत्रे",
      pendingSlots: "प्रलंबित स्लॉट",
      dailyCompletion: "दैनिक पूर्णता",
      generateLog: "संपूर्ण लॉग व्युत्पन्न करा",
      nodeLatency: "नोड विलंब",
      nodeLatencyDesc: "ग्लोबल सर्व्हर सिंक 24ms वर कार्यरत आहे. रिअल-टाइम सत्र निरीक्षण नाममात्र आहे.",
      compilingLogs: "लॉग संकलित करत आहे...",
      mode: {
        allmode: "सर्व मोड",
        live: "थेट",
        scheduled: "नियोजित"
      }
    }
  },
  adminPlans: {
    en: {
      title: "Plan Management",
      desc: "Create pricing tiers and approve subscription requests.",
      subscriptionPlans: "SUBSCRIPTION PLANS",
      planRequests: "PLAN REQUESTS",
      createNewPlan: "CREATE NEW PLAN",
      searchPlaceholder: "Search plans...",
      slug: "SLUG",
      name: "NAME",
      price: "PRICE",
      billingCycle: "BILLING CYCLE",
      status: "STATUS",
      actions: "ACTIONS",
      totalPlans: "TOTAL: {count} PLANS"
    },
    hi: {
      title: "प्लान प्रबंधन",
      desc: "मूल्य निर्धारण स्तर बनाएँ और सदस्यता अनुरोधों को स्वीकृति दें।",
      subscriptionPlans: "सदस्यता योजनाएं",
      planRequests: "योजना अनुरोध",
      createNewPlan: "नया प्लान बनाएँ",
      searchPlaceholder: "प्लान खोजें...",
      slug: "स्लग",
      name: "नाम",
      price: "कीमत",
      billingCycle: "बिलिंग चक्र",
      status: "स्थिति",
      actions: "कार्रवाइयां",
      totalPlans: "कुल: {count} प्लान"
    },
    mr: {
      title: "प्लॅन व्यवस्थापन",
      desc: "किंमत स्तर तयार करा आणि सबस्क्रिप्शन विनंत्यांना मान्यता द्या.",
      subscriptionPlans: "सबस्क्रिप्शन प्लॅन्स",
      planRequests: "प्लॅन विनंत्या",
      createNewPlan: "नवीन प्लॅन तयार करा",
      searchPlaceholder: "प्लॅन शोधा...",
      slug: "स्लग",
      name: "नाव",
      price: "किंमत",
      billingCycle: "बिलिंग सायकल",
      status: "स्थिती",
      actions: "कृती",
      totalPlans: "एकूण: {count} प्लॅन"
    }
  },
  adminPayments: {
    en: {
      title: "Financial Console",
      desc: "Tracking subscriptions, payouts, and GST compliance.",
      generateReports: "GENERATE REPORTS",
      auditPayouts: "AUDIT PAYOUTS",
      netCoreRevenue: "NET CORE REVENUE",
      gstAccrued: "GST ACCRUED (18%)",
      pendingPayouts: "PENDING PAYOUTS",
      searchPlaceholder: "Find Txn ID or Customer...",
      allStatus: "ALL STATUS",
      transactionCore: "TRANSACTION CORE",
      customerProfile: "CUSTOMER PROFILE",
      subscriptionTier: "SUBSCRIPTION TIER",
      netAmount: "NET AMOUNT",
      status: "STATUS",
      console: "CONSOLE"
    },
    hi: {
      title: "वित्तीय कंसोल",
      desc: "सदस्यता, भुगतान और जीएसटी अनुपालन को ट्रैक करना।",
      generateReports: "रिपोर्ट जनरेट करें",
      auditPayouts: "भुगतान ऑडिट करें",
      netCoreRevenue: "शुद्ध कोर राजस्व",
      gstAccrued: "उपार्जित जीएसटी (18%)",
      pendingPayouts: "लंबित भुगतान",
      searchPlaceholder: "लेनदेन आईडी या ग्राहक खोजें...",
      allStatus: "सभी स्थितियां",
      transactionCore: "लेनदेन कोर",
      customerProfile: "ग्राहक प्रोफ़ाइल",
      subscriptionTier: "सदस्यता टियर",
      netAmount: "शुद्ध राशि",
      status: "स्थिति",
      console: "कंसोल"
    },
    mr: {
      title: "आर्थिक कन्सोल",
      desc: "सबस्क्रिप्शन, पेआउट आणि जीएसटी अनुपालनाचा मागोवा घेणे.",
      generateReports: "अहवाल तयार करा",
      auditPayouts: "पेआउट ऑडिट करा",
      netCoreRevenue: "निव्वळ कोर महसूल",
      gstAccrued: "जमा झालेले जीएसटी (18%)",
      pendingPayouts: "प्रलंबित पेआउट्स",
      searchPlaceholder: "व्यवहार आयडी किंवा ग्राहक शोधा...",
      allStatus: "सर्व स्थिती",
      transactionCore: "व्यवहार कोर",
      customerProfile: "ग्राहक प्रोफाइल",
      subscriptionTier: "सबस्क्रिप्शन टियर",
      netAmount: "निव्वळ रक्कम",
      status: "स्थिती",
      console: "कन्सोल"
    }
  },
  adminSakhiCms: {
    en: {
      title: "Sakhi Content Hub",
      desc: "UNIFIED WELLNESS MANAGEMENT",
      addMeditation: "ADD NEW MEDITATION CONTENT",
      meditation: "MEDITATION",
      affirmations: "AFFIRMATIONS",
      grooming: "GROOMING",
      gitaWisdom: "GITA WISDOM",
      searchPlaceholder: "Search meditation content...",
      titleAuthor: "TITLE / AUTHOR",
      mapping: "MAPPING",
      status: "STATUS"
    },
    hi: {
      title: "सखी कंटेंट हब",
      desc: "एकीकृत कल्याण प्रबंधन",
      addMeditation: "नई ध्यान सामग्री जोड़ें",
      meditation: "ध्यान",
      affirmations: "सकारात्मक विचार",
      grooming: "सज्जा",
      gitaWisdom: "गीता ज्ञान",
      searchPlaceholder: "ध्यान सामग्री खोजें...",
      titleAuthor: "शीर्षक / लेखक",
      mapping: "मैपिंग",
      status: "स्थिति"
    },
    mr: {
      title: "सखी कंटेंट हब",
      desc: "एकात्मिक वेलनेस व्यवस्थापन",
      addMeditation: "नवीन ध्यान सामग्री जोडा",
      meditation: "ध्यान",
      affirmations: "सकारात्मक विचार",
      grooming: "ग्रूमिंग",
      gitaWisdom: "गीता ज्ञान",
      searchPlaceholder: "ध्यान सामग्री शोधा...",
      titleAuthor: "शीर्षक / लेखक",
      mapping: "मॅपिंग",
      status: "स्थिती"
    }
  },
  adminAnalytics: {
    en: {
      title: "Business Intelligence",
      desc: "Real-time meta-analysis of HealthSakhi's",
      growthMetrics: "growth and revenue metrics.",
      customRange: "Custom Range",
      auditAnalytics: "AUDIT ANALYTICS",
      platformRevenue: "PLATFORM REVENUE",
      activeSubscriptions: "ACTIVE SUBSCRIPTIONS",
      averageStreak: "AVERAGE STREAK",
      wellnessScore: "WELLNESS SCORE (AVG)",
      live: "LIVE",
      users: "USERS",
      loyalty: "LOYALTY",
      health: "HEALTH",
      platformCohorts: "Platform Users Cohorts",
      cohortsDesc: "ACTIVE / SUSPENDED / PENDING DISTRIBUTION",
      planSubscriptions: "Plan Subscriptions",
      subscriptionsDesc: "MODULAR SUBSCRIPTION BREAKDOWNS",
      metaIntelligence: "META INTELLIGENCE",
      metaIntelligenceDesc: "Ledger audit node reconciles logs.",
      detailedLog: "DETAILED LOG"
    },
    hi: {
      title: "बिजनेस इंटेलिजेंस",
      desc: "हेल्थ सखी के रियल-टाइम मेटा-विश्लेषण",
      growthMetrics: "वृद्धि और राजस्व मेट्रिक्स।",
      customRange: "कस्टम रेंज",
      auditAnalytics: "ऑडिट एनालिटिक्स",
      platformRevenue: "प्लेटफ़ॉर्म राजस्व",
      activeSubscriptions: "सक्रिय सदस्यताएँ",
      averageStreak: "औसत स्ट्रीक",
      wellnessScore: "वेलनेस स्कोर (औसत)",
      live: "लाइव",
      users: "उपयोगकर्ता",
      loyalty: "निष्ठा",
      health: "स्वास्थ्य",
      platformCohorts: "प्लेटफ़ॉर्म उपयोगकर्ता कोहॉर्ट्स",
      cohortsDesc: "सक्रिय / निलंबित / लंबित वितरण",
      planSubscriptions: "प्लान सदस्यताएँ",
      subscriptionsDesc: "मॉड्यूलर सदस्यता विश्लेषण",
      metaIntelligence: "मेटा इंटेलिजेंस",
      metaIntelligenceDesc: "बहीखाता ऑडिट नोड लॉग का मिलान करता है।",
      detailedLog: "विस्तृत लॉग"
    },
    mr: {
      title: "बिझनेस इंटेलिजन्स",
      desc: "हेल्थ सखीचे रिअल-टाइम मेटा-विश्लेषण",
      growthMetrics: "वाढ आणि महसूल मेट्रिक्स.",
      customRange: "कस्टम रेंज",
      auditAnalytics: "ऑडिट ॲनालिटिक्स",
      platformRevenue: "प्लॅटफॉर्म महसूल",
      activeSubscriptions: "सक्रिय सबस्क्रिप्शन",
      averageStreak: "सरासरी स्ट्रीक",
      wellnessScore: "वेलनेस स्कोअर (सरासरी)",
      live: "थेट",
      users: "वापरकर्ते",
      loyalty: "निष्ठा",
      health: "आरोग्य",
      platformCohorts: "प्लॅटफॉर्म वापरकर्ते कोहोर्ट्स",
      cohortsDesc: "सक्रिय / निलंबित / प्रलंबित वितरण",
      planSubscriptions: "प्लॅन सबस्क्रिप्शन्स",
      subscriptionsDesc: "मॉड्यूलर सबस्क्रिप्शन ब्रेकडाउन्स",
      metaIntelligence: "मेटा इंटेलिजन्स",
      metaIntelligenceDesc: "खातेवही ऑडिट नोड लॉगचे जुळणी करते.",
      detailedLog: "तपशीलवार लॉग"
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

console.log('Admin translations phase 2 added successfully!');
