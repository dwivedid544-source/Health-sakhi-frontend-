const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src/data/i18n/en.json');
const hiPath = path.join(__dirname, 'src/data/i18n/hi.json');
const mrPath = path.join(__dirname, 'src/data/i18n/mr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const mr = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

const translations = {
  adminUsers: {
    en: {
      title: "Member Portal Management",
      totalSisters: "Total Sisters",
      premiumTier: "Premium Tier",
      suspendedPool: "Suspended Pool",
      pendingApproval: "Pending Approval",
      searchPlaceholder: "Search member database...",
      filters: "Filters",
      exportDb: "Export DB",
      sisterDetails: "Sister Details",
      accessTier: "Access Tier",
      contact: "Contact",
      status: "Status",
      console: "Console",
      addNewMember: "Add New Member",
      noMatching: "No matching records found."
    },
    hi: {
      title: "सदस्य पोर्टल प्रबंधन",
      totalSisters: "कुल बहनें",
      premiumTier: "प्रीमियम टियर",
      suspendedPool: "निलंबित खाते",
      pendingApproval: "लंबित अनुमोदन",
      searchPlaceholder: "सदस्य डेटाबेस खोजें...",
      filters: "फिल्टर",
      exportDb: "डेटाबेस निर्यात करें",
      sisterDetails: "बहन का विवरण",
      accessTier: "एक्सेस टियर",
      contact: "संपर्क",
      status: "स्थिति",
      console: "कंसोल",
      addNewMember: "नया सदस्य जोड़ें",
      noMatching: "कोई मिलान रिकॉर्ड नहीं मिला।"
    },
    mr: {
      title: "सदस्य पोर्टल व्यवस्थापन",
      totalSisters: "एकूण बहिणी",
      premiumTier: "प्रीमियम टियर",
      suspendedPool: "निलंबित खाती",
      pendingApproval: "प्रलंबित मान्यता",
      searchPlaceholder: "सदस्य डेटाबेस शोधा...",
      filters: "फिल्टर",
      exportDb: "डेटाबेस निर्यात करा",
      sisterDetails: "बहिणीचा तपशील",
      accessTier: "अॅक्सेस टियर",
      contact: "संपर्क",
      status: "स्थिती",
      console: "कन्सोल",
      addNewMember: "नवीन सदस्य जोडा",
      noMatching: "कोणतेही जुळणारे रेकॉर्ड आढळले नाही."
    }
  },
  adminContent: {
    en: {
      title: "Content Management",
      desc: "Upload and oversee your wellness repository.",
      createNew: "Create New Content",
      searchPlaceholder: "Search by title, category or author...",
      filterCategory: "Filter Category",
      resourceType: "Resource Type",
      contentAsset: "Content Asset",
      type: "Type",
      category: "Category",
      status: "Status",
      actions: "Actions"
    },
    hi: {
      title: "सामग्री प्रबंधन",
      desc: "अपने वेलनेस रिपॉजिटरी को अपलोड और प्रबंधित करें।",
      createNew: "नई सामग्री बनाएँ",
      searchPlaceholder: "शीर्षक, श्रेणी या लेखक द्वारा खोजें...",
      filterCategory: "श्रेणी फ़िल्टर करें",
      resourceType: "संसाधन प्रकार",
      contentAsset: "सामग्री एसेट",
      type: "प्रकार",
      category: "श्रेणी",
      status: "स्थिति",
      actions: "कार्रवाई"
    },
    mr: {
      title: "सामग्री व्यवस्थापन",
      desc: "तुमची वेलनेस रिपॉझिटरी अपलोड करा आणि व्यवस्थापित करा.",
      createNew: "नवीन सामग्री तयार करा",
      searchPlaceholder: "शीर्षक, श्रेणी किंवा लेखकानुसार शोधा...",
      filterCategory: "श्रेणी फिल्टर करा",
      resourceType: "संसाधन प्रकार",
      contentAsset: "सामग्री अ‍ॅसेट",
      type: "प्रकार",
      category: "श्रेणी",
      status: "स्थिती",
      actions: "कृती"
    }
  },
  adminBooks: {
    en: {
      title: "Sakhi Academy CMS",
      desc: "MANAGE CONTENT & TRACK ENGAGEMENT",
      manageBooks: "MANAGE BOOKS",
      readerInsights: "READER INSIGHTS",
      libraryTotal: "LIBRARY TOTAL",
      totalReads: "TOTAL READS",
      categorySplit: "CATEGORY SPLIT",
      draftAssets: "DRAFT ASSETS",
      searchPlaceholder: "Search title, author or keywords...",
      allCategories: "ALL CATEGORIES",
      allStatus: "ALL STATUS",
      bookId: "BOOK IDENTIFICATION",
      category: "CATEGORY",
      engagement: "ENGAGEMENT",
      status: "STATUS",
      console: "CONSOLE"
    },
    hi: {
      title: "सखी अकादमी सीएमएस",
      desc: "सामग्री प्रबंधित करें और जुड़ाव ट्रैक करें",
      manageBooks: "किताबें प्रबंधित करें",
      readerInsights: "पाठक अंतर्दृष्टि",
      libraryTotal: "पुस्तकालय कुल",
      totalReads: "कुल पढ़े गए",
      categorySplit: "श्रेणी विभाजन",
      draftAssets: "ड्राफ्ट एसेट",
      searchPlaceholder: "शीर्षक, लेखक या कीवर्ड खोजें...",
      allCategories: "सभी श्रेणियां",
      allStatus: "सभी स्थितियां",
      bookId: "पुस्तक पहचान",
      category: "श्रेणी",
      engagement: "जुड़ाव",
      status: "स्थिति",
      console: "कंसोल"
    },
    mr: {
      title: "सखी अकादमी सीएमएस",
      desc: "सामग्री व्यवस्थापित करा आणि प्रतिबद्धता ट्रॅक करा",
      manageBooks: "पुस्तके व्यवस्थापित करा",
      readerInsights: "वाचक अंतर्दृष्टी",
      libraryTotal: "ग्रंथालय एकूण",
      totalReads: "एकूण वाचले",
      categorySplit: "श्रेणी विभाजन",
      draftAssets: "ड्राफ्ट अ‍ॅसेट",
      searchPlaceholder: "शीर्षक, लेखक किंवा कीवर्ड शोधा...",
      allCategories: "सर्व श्रेणी",
      allStatus: "सर्व स्थिती",
      bookId: "पुस्तक ओळख",
      category: "श्रेणी",
      engagement: "प्रतिबद्धता",
      status: "स्थिती",
      console: "कन्सोल"
    }
  },
  adminAdvisors: {
    en: {
      title: "Expert Management",
      recruitAdvisor: "Recruit Advisor",
      totalPool: "TOTAL POOL",
      approvals: "APPROVALS",
      certified: "CERTIFIED",
      searchPlaceholder: "Find advisor by name or specialty...",
      expertProfile: "EXPERT PROFILE",
      specialtyArea: "SPECIALTY AREA",
      hourlyRate: "HOURLY RATE",
      status: "STATUS",
      console: "CONSOLE"
    },
    hi: {
      title: "विशेषज्ञ प्रबंधन",
      recruitAdvisor: "सलाहकार भर्ती करें",
      totalPool: "कुल पूल",
      approvals: "अनुमोदन",
      certified: "प्रमाणित",
      searchPlaceholder: "नाम या विशेषता द्वारा सलाहकार खोजें...",
      expertProfile: "विशेषज्ञ प्रोफ़ाइल",
      specialtyArea: "विशेषज्ञता क्षेत्र",
      hourlyRate: "प्रति घंटा दर",
      status: "स्थिति",
      console: "कंसोल"
    },
    mr: {
      title: "तज्ञ व्यवस्थापन",
      recruitAdvisor: "सल्लागार नियुक्त करा",
      totalPool: "एकूण पूल",
      approvals: "मंजुरी",
      certified: "प्रमाणित",
      searchPlaceholder: "नाव किंवा वैशिष्ट्यानुसार सल्लागार शोधा...",
      expertProfile: "तज्ञ प्रोफाइल",
      specialtyArea: "वैशिष्ट्य क्षेत्र",
      hourlyRate: "प्रति तास दर",
      status: "स्थिती",
      console: "कन्सोल"
    }
  },
  adminAppointments: {
    en: {
      title: "Consultation Master-View",
      desc: "Monitoring all active wellness sessions across the platform.",
      realTimeGrid: "REAL-TIME GRID",
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
      nodeLatencyDesc: "Global server sync is operating at 24ms. Real-time session monitoring is nominal."
    },
    hi: {
      title: "परामर्श मास्टर-व्यू",
      desc: "प्लेटफ़ॉर्म पर सभी सक्रिय वेलनेस सत्रों की निगरानी।",
      realTimeGrid: "रीयल-टाइम ग्रिड",
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
      nodeLatencyDesc: "वैश्विक सर्वर सिंक 24ms पर काम कर रहा है। रीयल-टाइम सत्र निगरानी नाममात्र है।"
    },
    mr: {
      title: "सल्लामसलत मास्टर-व्ह्यू",
      desc: "प्लॅटफॉर्मवरील सर्व सक्रिय वेलनेस सत्रांचे निरीक्षण.",
      realTimeGrid: "रिअल-टाइम ग्रिड",
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
      nodeLatencyDesc: "ग्लोबल सर्व्हर सिंक 24ms वर कार्यरत आहे. रिअल-टाइम सत्र निरीक्षण नाममात्र आहे."
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

console.log('Admin translations added successfully!');
