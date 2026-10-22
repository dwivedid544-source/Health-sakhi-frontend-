const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src/data/i18n/en.json');
const hiPath = path.join(__dirname, 'src/data/i18n/hi.json');
const mrPath = path.join(__dirname, 'src/data/i18n/mr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const mr = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

const translations = {
  advisorAppointments: {
    en: {
      title: "Schedule Registry",
      desc: "Manage your consultation pipeline and connect with sisters.",
      upcoming: "Upcoming",
      completed: "Completed",
      searchPlaceholder: "Search patient or topic...",
      noAppointmentsFound: "No Appointments Found",
      noAppointmentsDesc: "There are no {type} appointments matching your criteria.",
      videoCall: "Video CALL",
      phoneCall: "Phone CALL",
      archive: "Archive",
      duration: "Duration:",
      reviewConfirm: "Review & Confirm",
      confirmedSynced: "Confirmed & Synced",
      confirmSlot: "Confirm Slot",
      verifyTime: "Verify time before calendar sync",
      consultationDate: "Consultation Date",
      proposedTime: "Proposed Time",
      confirmationNotice: "Upon confirmation, the sister will be notified via WhatsApp and the slot will be locked in your clinical calendar.",
      confirmSync: "Confirm & Sync",
      cancel: "Cancel",
      sessionSynchronized: "Session Synchronized"
    },
    hi: {
      title: "शेड्यूल रजिस्ट्री",
      desc: "अपनी परामर्श पाइपलाइन प्रबंधित करें और बहनों से जुड़ें।",
      upcoming: "आगामी",
      completed: "पूरा हुआ",
      searchPlaceholder: "मरीज़ या विषय खोजें...",
      noAppointmentsFound: "कोई अपॉइंटमेंट नहीं मिला",
      noAppointmentsDesc: "आपके मानदंडों से मेल खाने वाला कोई {type} अपॉइंटमेंट नहीं है।",
      videoCall: "वीडियो कॉल",
      phoneCall: "फ़ोन कॉल",
      archive: "पुरालेख",
      duration: "अवधि:",
      reviewConfirm: "समीक्षा और पुष्टि करें",
      confirmedSynced: "पुष्टि और समन्वयित",
      confirmSlot: "स्लॉट की पुष्टि करें",
      verifyTime: "कैलेंडर सिंक करने से पहले समय सत्यापित करें",
      consultationDate: "परामर्श की तिथि",
      proposedTime: "प्रस्तावित समय",
      confirmationNotice: "पुष्टि होने पर, बहन को व्हाट्सएप के माध्यम से सूचित किया जाएगा और आपके क्लिनिकल कैलेंडर में स्लॉट लॉक हो जाएगा।",
      confirmSync: "पुष्टि और सिंक करें",
      cancel: "रद्द करें",
      sessionSynchronized: "सत्र समन्वयित"
    },
    mr: {
      title: "वेळापत्रक नोंदणी",
      desc: "आपली सल्लामसलत पाइपलाइन व्यवस्थापित करा आणि बहिणींशी कनेक्ट व्हा.",
      upcoming: "आगामी",
      completed: "पूर्ण",
      searchPlaceholder: "रुग्ण किंवा विषय शोधा...",
      noAppointmentsFound: "कोणतीही अपॉइंटमेंट आढळली नाही",
      noAppointmentsDesc: "तुमच्या निकषांशी जुळणारी कोणतीही {type} अपॉइंटमेंट नाही.",
      videoCall: "व्हिडिओ कॉल",
      phoneCall: "फोन कॉल",
      archive: "संग्रहण",
      duration: "कालावधी:",
      reviewConfirm: "पुनरावलोकन आणि पुष्टी करा",
      confirmedSynced: "पुष्टी आणि समक्रमित",
      confirmSlot: "स्लॉटची पुष्टी करा",
      verifyTime: "कॅलेंडर सिंक करण्यापूर्वी वेळ तपासा",
      consultationDate: "सल्लामसलत तारीख",
      proposedTime: "प्रस्तावित वेळ",
      confirmationNotice: "पुष्टी केल्यावर, बहिणीला व्हॉट्सअॅपद्वारे सूचित केले जाईल आणि स्लॉट तुमच्या क्लिनिकल कॅलेंडरमध्ये लॉक केला जाईल.",
      confirmSync: "पुष्टी आणि सिंक करा",
      cancel: "रद्द करा",
      sessionSynchronized: "सत्र समक्रमित"
    }
  },
  advisorUsers: {
    en: {
      title: "Sisters under your care",
      desc: "Review health history and engagement metrics for your assigned users.",
      searchPlaceholder: "Search by name, ID or health condition...",
      adherence: "ADHERENCE",
      status: "STATUS",
      active: "ACTIVE",
      memberUser: "Member User",
      yearsGeneralWellness: "Years • General Wellness",
      yearsConsultationFollowUp: "Years • Consultation Follow up",
      endOfRotation: "END OF ASSIGNED ROTATION - CHECK GLOBAL LIST FOR NEW REQUESTS"
    },
    hi: {
      title: "आपकी देखभाल में बहनें",
      desc: "अपने सौंपे गए उपयोगकर्ताओं के लिए स्वास्थ्य इतिहास और जुड़ाव मैट्रिक्स की समीक्षा करें।",
      searchPlaceholder: "नाम, आईडी या स्वास्थ्य स्थिति से खोजें...",
      adherence: "अनुपालन",
      status: "स्थिति",
      active: "सक्रिय",
      memberUser: "सदस्य उपयोगकर्ता",
      yearsGeneralWellness: "वर्ष • सामान्य कल्याण",
      yearsConsultationFollowUp: "वर्ष • परामर्श अनुवर्ती",
      endOfRotation: "निर्धारित रोटेशन का अंत - नए अनुरोधों के लिए वैश्विक सूची जांचें"
    },
    mr: {
      title: "तुमच्या काळजीखाली असलेल्या बहिणी",
      desc: "तुमच्या नियुक्त वापरकर्त्यांसाठी आरोग्य इतिहास आणि प्रतिबद्धता मेट्रिक्सचे पुनरावलोकन करा.",
      searchPlaceholder: "नाव, आयडी किंवा आरोग्य स्थितीनुसार शोधा...",
      adherence: "पालन",
      status: "स्थिती",
      active: "सक्रिय",
      memberUser: "सदस्य वापरकर्ता",
      yearsGeneralWellness: "वर्षे • सामान्य निरोगीपणा",
      yearsConsultationFollowUp: "वर्षे • सल्लामसलत फॉलो-अप",
      endOfRotation: "नियुक्त रोटेशनचा शेवट - नवीन विनंत्यांसाठी जागतिक सूची तपासा"
    }
  },
  advisorConsultations: {
    en: {
      title: "Consultation Center",
      desc: "Manage wellness advice for your assigned Sakhis",
      searchMembers: "Search members...",
      noConsultationsFound: "No consultations found.",
      noConsultationSelected: "No Consultation Selected",
      selectConsultationDesc: "Select a sister's consultation case from the sidebar to review and add your advice.",
      recentCheckin: "Recent check-in details and vitals",
      prescribeAction: "Prescribe Action",
      addClinicalNote: "Add Clinical Note",
      notePlaceholder: "Add internal clinical note or private observation...",
      prescribePlaceholder: "Write specific action, protocol or advice for the user...",
      recommendModule: "Recommend Module",
      selectModule: "Select a wellness module to assign...",
      submitAdvice: "Submit Advice",
      submitting: "Submitting..."
    },
    hi: {
      title: "परामर्श केंद्र",
      desc: "अपनी असाइन की गई सखियों के लिए कल्याण सलाह प्रबंधित करें",
      searchMembers: "सदस्यों को खोजें...",
      noConsultationsFound: "कोई परामर्श नहीं मिला।",
      noConsultationSelected: "कोई परामर्श चयनित नहीं",
      selectConsultationDesc: "समीक्षा करने और अपनी सलाह जोड़ने के लिए साइडबार से किसी बहन का परामर्श मामला चुनें।",
      recentCheckin: "हाल के चेक-इन विवरण और वाइटल्स",
      prescribeAction: "कार्रवाई निर्धारित करें",
      addClinicalNote: "क्लिनिकल नोट जोड़ें",
      notePlaceholder: "आंतरिक क्लिनिकल नोट या निजी अवलोकन जोड़ें...",
      prescribePlaceholder: "उपयोगकर्ता के लिए विशिष्ट कार्रवाई, प्रोटोकॉल या सलाह लिखें...",
      recommendModule: "मॉड्यूल की सिफारिश करें",
      selectModule: "असाइन करने के लिए एक वेलनेस मॉड्यूल चुनें...",
      submitAdvice: "सलाह जमा करें",
      submitting: "जमा किया जा रहा है..."
    },
    mr: {
      title: "सल्लामसलत केंद्र",
      desc: "तुमच्या नियुक्त सखींसाठी आरोग्य सल्ले व्यवस्थापित करा",
      searchMembers: "सदस्य शोधा...",
      noConsultationsFound: "कोणतीही सल्लामसलत आढळली नाही.",
      noConsultationSelected: "कोणतीही सल्लामसलत निवडलेली नाही",
      selectConsultationDesc: "पुनरावलोकन करण्यासाठी आणि तुमचा सल्ला जोडण्यासाठी साइडबारमधून बहिणीचा सल्लामसलत केस निवडा.",
      recentCheckin: "अलीकडील चेक-इन तपशील आणि महत्त्वपूर्ण",
      prescribeAction: "कृती विहित करा",
      addClinicalNote: "क्लिनिकल नोट जोडा",
      notePlaceholder: "अंतर्गत क्लिनिकल नोट किंवा खाजगी निरीक्षण जोडा...",
      prescribePlaceholder: "वापरकर्त्यासाठी विशिष्ट कृती, प्रोटोकॉल किंवा सल्ला लिहा...",
      recommendModule: "मॉड्यूलची शिफारस करा",
      selectModule: "नियुक्त करण्यासाठी वेलनेस मॉड्यूल निवडा...",
      submitAdvice: "सल्ला सबमिट करा",
      submitting: "सबमिट करत आहे..."
    }
  },
  advisorChat: {
    en: {
      messages: "Messages",
      searchSisters: "Search sisters...",
      now: "NOW",
      onlineSecureSession: "ONLINE • SECURE SESSION",
      endToEndEncrypted: "END-TO-END ENCRYPTED BY HEALTHSAKHI CLINICAL CORE",
      typeAdvice: "Type your medical advice...",
      activeFocus: "ACTIVE FOCUS",
      medicalNotes: "MEDICAL NOTES",
      quickStats: "QUICK STATS",
      adherence: "ADHERENCE",
      sessions: "SESSIONS",
      healthPassport: "HEALTH PASSPORT V2.1",
      pcodManagement: "PCOD Management & Hormonal Balance",
      followingLowGiDiet: "Following low-GI diet",
      regularEveningWalks: "Regular evening walks",
      syncingCycleData: "Syncing cycle data"
    },
    hi: {
      messages: "संदेश",
      searchSisters: "बहनें खोजें...",
      now: "अभी",
      onlineSecureSession: "ऑनलाइन • सुरक्षित सत्र",
      endToEndEncrypted: "हेल्थसखी क्लिनिकल कोर द्वारा एंड-टू-एंड एन्क्रिप्टेड",
      typeAdvice: "अपनी चिकित्सा सलाह टाइप करें...",
      activeFocus: "सक्रिय ध्यान",
      medicalNotes: "चिकित्सा नोट्स",
      quickStats: "त्वरित आँकड़े",
      adherence: "अनुपालन",
      sessions: "सत्र",
      healthPassport: "स्वास्थ्य पासपोर्ट V2.1",
      pcodManagement: "PCOD प्रबंधन और हार्मोनल संतुलन",
      followingLowGiDiet: "कम-GI आहार का पालन",
      regularEveningWalks: "नियमित शाम की सैर",
      syncingCycleData: "साइकिल डेटा सिंक हो रहा है"
    },
    mr: {
      messages: "संदेश",
      searchSisters: "बहिणींना शोधा...",
      now: "आता",
      onlineSecureSession: "ऑनलाइन • सुरक्षित सत्र",
      endToEndEncrypted: "हेल्थसखी क्लिनिकल कोर द्वारे एंड-टू-एंड एन्क्रिप्टेड",
      typeAdvice: "तुमचा वैद्यकीय सल्ला टाईप करा...",
      activeFocus: "सक्रिय फोकस",
      medicalNotes: "वैद्यकीय नोट्स",
      quickStats: "त्वरित आकडेवारी",
      adherence: "पालन",
      sessions: "सत्रे",
      healthPassport: "हेल्थ पासपोर्ट V2.1",
      pcodManagement: "PCOD व्यवस्थापन आणि हार्मोनल संतुलन",
      followingLowGiDiet: "कमी-GI आहाराचे पालन करणे",
      regularEveningWalks: "नियमित संध्याकाळी चालणे",
      syncingCycleData: "सायकल डेटा सिंक करत आहे"
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

console.log('Translations injected successfully!');
