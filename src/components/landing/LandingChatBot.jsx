import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  MessageCircle, X, Send, Lock, UserPlus, Loader, LogOut, 
  Compass, User, Eye, EyeOff, ShieldCheck 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://health-sakhi-production.up.railway.app/api/v1';

const ALL_LANDING_BOOKS = [
  { title: "Heart to Heart", img: "/Images/heart to heart.png", author: "Dr. Pratap Madhukar" },
  { title: "Fountain of Family", img: "/Images/final cover fountain of family.png", author: "Dr. Pratap Madhukar" },
  { title: "PCOD Wellness", img: "/Images/final pcod book cover.png", author: "Dr. Pratap Madhukar" },
  { title: "Weight Loss", img: "/Images/final wt loss book cover.png", author: "Dr. Pratap Madhukar" },
  { title: "Life After Shaadi", img: "/Images/HS LIFE AFTRE SHAADI COVER.png", author: "Dr. Pratap Madhukar" },
  { title: "Menopause", img: "/Images/HS MENOPAUSE.png", author: "Dr. Pratap Madhukar" },
  { title: "Beauty Without Parlour", img: "/Images/final cover beauty without parlour.png", author: "Dr. Pratap Madhukar" },
  { title: "How to Read Husband", img: "/Images/HS HOW TO READ HUSBAND COVE R.png", author: "Dr. Pratap Madhukar" },
  { title: "How to Read Woman", img: "/Images/HOW TO READ WOMAN LIKE A POEM.png", author: "Dr. Pratap Madhukar" },
  { title: "100 Operations", img: "/Images/100 operations.png", author: "Dr. Pratap Madhukar" }
];

const LandingChatBot = () => {
  const { langCode } = useLanguage();

  // ── Chatbot UI translations (EN / HI / MR) ──────────────────────────────
  const cb = {
    en: {
      login: 'Login', requestSignup: 'Request Signup',
      fullName: 'Full Name', emailAddress: 'Email Address',
      password: 'Password', phoneNumber: 'Phone Number',
      selectRole: 'Select Role', selectPlan: 'Select Plan',
      specialization: 'Specialization',
      memberUser: 'Member (User)', advisorExpert: 'Advisor (Health Expert)', partnerAffiliate: 'Partner (Affiliate)',
      termsCheckbox: 'I have read and agree to the', termsOf: 'Terms of Service', and: 'and', privacyPolicy: 'Privacy Policy',
      processing: 'Processing...', logIn: 'Log In', requestSignupBtn: 'Request Signup',
      termsTitle: 'Terms & Privacy Policy', termsSubtitle: 'Please read carefully',
      termsFooter: 'By accepting, you agree to all the terms listed above.',
      acceptAgree: 'I Accept & Agree',
    },
    hi: {
      login: 'लॉगिन', requestSignup: 'साइनअप अनुरोध',
      fullName: 'पूरा नाम', emailAddress: 'ईमेल पता',
      password: 'पासवर्ड', phoneNumber: 'फोन नंबर',
      selectRole: 'भूमिका चुनें', selectPlan: 'प्लान चुनें',
      specialization: 'विशेषज्ञता',
      memberUser: 'सदस्य (यूजर)', advisorExpert: 'सलाहकार (स्वास्थ्य विशेषज्ञ)', partnerAffiliate: 'पार्टनर (एफिलिएट)',
      termsCheckbox: 'मैंने पढ़ा और सहमत हूँ', termsOf: 'सेवा की शर्तें', and: 'और', privacyPolicy: 'गोपनीयता नीति',
      processing: 'प्रोसेस हो रहा है...', logIn: 'लॉगिन करें', requestSignupBtn: 'साइनअप अनुरोध',
      termsTitle: 'नियम एवं गोपनीयता नीति', termsSubtitle: 'कृपया ध्यान से पढ़ें',
      termsFooter: 'स्वीकार करके, आप ऊपर सूचीबद्ध सभी शर्तों से सहमत होती हैं।',
      acceptAgree: 'मैं स्वीकार करती हूँ',
    },
    mr: {
      login: 'लॉगिन', requestSignup: 'साइनअप विनंती',
      fullName: 'पूर्ण नाव', emailAddress: 'ईमेल पत्ता',
      password: 'पासवर्ड', phoneNumber: 'फोन नंबर',
      selectRole: 'भूमिका निवडा', selectPlan: 'प्लान निवडा',
      specialization: 'विशेषज्ञता',
      memberUser: 'सदस्य (वापरकर्ता)', advisorExpert: 'सल्लागार (आरोग्य तज्ञ)', partnerAffiliate: 'भागीदार (अफिलिएट)',
      termsCheckbox: 'मी वाचले आणि सहमत आहे', termsOf: 'सेवेच्या अटी', and: 'आणि', privacyPolicy: 'गोपनीयता धोरण',
      processing: 'प्रक्रिया होत आहे...', logIn: 'लॉगिन करा', requestSignupBtn: 'साइनअप विनंती',
      termsTitle: 'नियम व गोपनीयता धोरण', termsSubtitle: 'कृपया काळजीपूर्वक वाचा',
      termsFooter: 'स्वीकार करून, आपण वरील सर्व अटींशी सहमत आहात.',
      acceptAgree: 'मी स्वीकार करतो / करते',
    },
  };
  const T = cb[langCode] || cb.en;
  const [isOpen, setIsOpen] = useState(false);
  
  // Welcome messages per language code
  const welcomeMessages = {
    en: 'Hello Sakhi! 👋 I am your HealthSakhi Assistant. How can I help you today? You can ask me about our features, signup/login directly, or explore our demo flows.',
    hi: 'नमस्ते सखी! 👋 मैं आपकी हेल्थसखी असिस्टेंट हूँ। आज मैं आपकी क्या मदद कर सकती हूँ? आप मुझसे हमारी सुविधाओं के बारे में पूछ सकती हैं, सीधे साइनअप/लॉगिन कर सकती हैं, या हमारे डेमो फ्लो को एक्सप्लोर कर सकती हैं।',
    mr: 'नमस्कार सखी! 👋 मी तुमची हेल्थसखी असिस्टंट आहे. आज मी तुम्हाला कशी मदत करू शकते? तुम्ही मला आमच्या वैशिष्ट्यांबद्दल विचारू शकता, थेट साइनअप/लॉगिन करू शकता किंवा आमचे डेमो फ्लो एक्सप्लोर करू शकता.'
  };

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      isUser: false,
      text: welcomeMessages[langCode] || welcomeMessages.en
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState('login'); // 'login' | 'signup'
  
  // Auth state synced with sessionStorage
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userFeatures, setUserFeatures] = useState([]);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member', // 'member' | 'advisor' | 'partner'
    phone: '',
    specialty: 'Hormonal Health',
    plan: 'Free Sakhi'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsText, setTermsText] = useState('');
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);

  useEffect(() => {
    // Pick the right disclaimer file based on selected language
    const fileMap = {
      hi: '/disclaimer_text_hi.txt',
      mr: '/disclaimer_text_mr.txt',
      en: '/disclaimer_text.txt',
    };
    const file = fileMap[langCode] || '/disclaimer_text.txt';
    fetch(file)
      .then(res => res.ok ? res.text() : 'Failed to load terms.')
      .then(text => setTermsText(text))
      .catch(() => setTermsText('Error loading terms.'));
  }, [langCode]);

  // Conversational Signup state machine
  const [signupStep, setSignupStep] = useState(null); // null | 'name' | 'email' | 'password' | 'plan' | 'specialty' | 'phone' | 'terms'
  const [signupFlowData, setSignupFlowData] = useState({
    name: '',
    email: '',
    password: '',
    role: '', // 'member' | 'advisor' | 'partner'
    plan: 'Free Sakhi',
    specialty: 'Hormonal Health',
    phone: ''
  });

  // Prompt keys translation dictionary
  const signupPrompts = {
    en: {
      memberSignupReq: "Requesting Member Signup Flow 🌸",
      advisorSignupReq: "Requesting Advisor Application Flow 🩺",
      partnerSignupReq: "Requesting Partner Program Flow 🤝",
      askName: "What is your full name?",
      askEmail: "Please provide your email address:",
      askPassword: "Create a password for your account (minimum 6 characters):",
      askPlan: "Which plan do you want to select for your membership?",
      askSpecialty: "What is your medical specialization?",
      askPhone: "Please enter your phone number:",
      askTerms: "Please review and agree to our Terms of Service & Privacy Policy to submit your registration request.",
      submitting: "Submitting your signup request... Please wait.",
      success: "Your registration request has been submitted successfully! Once approved by the administrator, you can log in.",
      error: "Signup failed. Please try again."
    },
    hi: {
      memberSignupReq: "मेंबर साइनअप प्रक्रिया शुरू हो रही है 🌸",
      advisorSignupReq: "सलाहकार साइनअप प्रक्रिया शुरू हो रही है 🩺",
      partnerSignupReq: "पार्टनर साइनअप प्रक्रिया शुरू हो रही है 🤝",
      askName: "आपका पूरा नाम क्या है?",
      askEmail: "कृपया अपना ईमेल पता दर्ज करें:",
      askPassword: "अपने अकाउंट के लिए एक पासवर्ड बनाएं (कम से कम 6 अक्षर):",
      askPlan: "आप अपनी मेंबरशिप के लिए कौन सा प्लान चुनना चाहते हैं?",
      askSpecialty: "आपका मेडिकल स्पेशलाइजेशन क्या है?",
      askPhone: "कृपया अपना फोन नंबर दर्ज करें:",
      askTerms: "अपना साइनअप सबमिट करने के लिए कृपया हमारी सेवा की शर्तें और गोपनीयता नीति पढ़ें और स्वीकार करें।",
      submitting: "आपका साइनअप अनुरोध सबमिट किया जा रहा है... कृपया प्रतीक्षा करें।",
      success: "आपका साइनअप अनुरोध सफलतापूर्वक सबमिट हो गया है! जैसे ही एडमिन इसे मंजूरी देंगे, आप लॉगिन कर सकते हैं।",
      error: "साइनअप विफल रहा। कृपया पुन: प्रयास करें।"
    },
    mr: {
      memberSignupReq: "सदस्य साइनअप प्रक्रिया सुरू होत आहे 🌸",
      advisorSignupReq: "सल्लागार साइनअप प्रक्रिया सुरू होत आहे 🩺",
      partnerSignupReq: "भागीदार साइनअप प्रक्रिया सुरू होत आहे 🤝",
      askName: "तुमचे पूर्ण नाव काय आहे?",
      askEmail: "कृपया तुमचा ईमेल पत्ता प्रविष्ट करा:",
      askPassword: "तुमच्या खात्यासाठी एक पासवर्ड तयार करा (किमान ६ अक्षरे):",
      askPlan: "तुम्हाला तुमच्या सदस्यत्वासाठी कोणती योजना निवडायची आहे?",
      askSpecialty: "तुमचे वैद्यकीय स्पेशलायझेशन काय आहे?",
      askPhone: "कृपया तुमचा फोन नंबर प्रविष्ट करा:",
      askTerms: "तुमची साइनअप विनंती सबमिट करण्यासाठी कृपया आमच्या सेवा अटी आणि गोपनीयता धोरणाचे पुनरावलोकन करून ते स्वीकारा.",
      submitting: "तुमची साइनअप विनंती सबमिट केली जात आहे... कृपया प्रतीक्षा करा.",
      success: "तुमची साइनअप विनंती यशस्वीरित्या सबमिट झाली आहे! प्रशासकाद्वारे मंजुरी मिळाल्यानंतर तुम्ही लॉगिन करू शकता.",
      error: "साइनअप अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा."
    }
  };
  
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Generate or retrieve session ID for rate-limiting
  const [sessionId] = useState(() => {
    const existing = sessionStorage.getItem('hs_chatbot_session_id');
    if (existing) return existing;
    const newId = 'session_' + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('hs_chatbot_session_id', newId);
    return newId;
  });

  // Sync auth state on mount
  useEffect(() => {
    checkAuthState();
  }, []);

  // Update initial welcome message dynamically if it is the only message and language changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{
          id: 'welcome',
          isUser: false,
          text: welcomeMessages[langCode] || welcomeMessages.en
        }];
      }
      return prev;
    });
  }, [langCode]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (!isLoading && !isFormOpen) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }
    }
  }, [messages, isOpen, isLoading, isFormOpen]);

  const checkAuthState = () => {
    const storedMember = sessionStorage.getItem('hs_current_member');
    const token = sessionStorage.getItem('hs_access_token') || localStorage.getItem('hs_access_token');
    
    if (storedMember && token) {
      try {
        const parsed = JSON.parse(storedMember);
        setIsLoggedIn(true);
        setUserData(parsed);
        fetchUserFeatures(token);
      } catch (err) {
        console.error('Error parsing hs_current_member:', err);
      }
    } else {
      setIsLoggedIn(false);
      setUserData(null);
      setUserFeatures([]);
    }
  };

  const fetchUserFeatures = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/features`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setUserFeatures(response.data.features || []);
      }
    } catch (err) {
      console.error('Failed to fetch accessible features:', err);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Start Conversational Signup Workflow
  const startConversationalSignup = (role) => {
    setIsTermsAgreed(false);
    setSignupStep('name');
    setSignupFlowData({
      name: '',
      email: '',
      password: '',
      role: role,
      plan: 'Free Sakhi',
      specialty: 'Hormonal Health',
      phone: ''
    });

    const lang = signupPrompts[langCode] ? langCode : 'en';
    let reqMsg = signupPrompts[lang].memberSignupReq;
    if (role === 'advisor') reqMsg = signupPrompts[lang].advisorSignupReq;
    if (role === 'partner') reqMsg = signupPrompts[lang].partnerSignupReq;

    setMessages(prev => [
      ...prev,
      {
        id: 'signup_req_' + Date.now(),
        isUser: true,
        text: reqMsg
      },
      {
        id: 'signup_ask_name_' + Date.now(),
        isUser: false,
        text: signupPrompts[lang].askName
      }
    ]);
  };

  // Handle choice selections inside chat log (plans & specialties)
  const handleConversationalChoice = async (stepName, choiceValue, displayLabel) => {
    // 1. Log the choice as a user reply bubble
    setMessages(prev => [
      ...prev,
      {
        id: `choice_reply_${Date.now()}`,
        isUser: true,
        text: displayLabel
      }
    ]);

    const updatedData = { ...signupFlowData, [stepName]: choiceValue };
    setSignupFlowData(updatedData);

    const lang = signupPrompts[langCode] ? langCode : 'en';

    if (stepName === 'plan' || stepName === 'specialty') {
      // Transition directly to phone
      setSignupStep('phone');
      setIsLoading(true);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: `signup_ask_phone_${Date.now()}`,
            isUser: false,
            text: signupPrompts[lang].askPhone
          }
        ]);
        setIsLoading(false);
      }, 500);
    }
  };

  // Submit complete signup details to the backend
  const submitConversationalSignup = async (completedData) => {
    setIsLoading(true);
    const lang = signupPrompts[langCode] ? langCode : 'en';

    try {
      const response = await axios.post(`${API_BASE_URL}/user/signup`, {
        name: completedData.name,
        email: completedData.email,
        password: completedData.password,
        role: completedData.role,
        phone: completedData.phone,
        specialty: completedData.role === 'advisor' ? completedData.specialty : undefined,
        plan: completedData.role === 'member' ? completedData.plan : undefined
      });

      if (response.data && response.data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: 'signup_success_' + Date.now(),
            isUser: false,
            text: `🎉 ${signupPrompts[lang].success}`
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: 'signup_err_' + Date.now(),
            isUser: false,
            text: `⚠️ ${response.data.message || signupPrompts[lang].error}`
          }
        ]);
      }
    } catch (err) {
      console.error('Conversational Signup Error:', err);
      const errMsg = err.response?.data?.message || signupPrompts[lang].error;
      setMessages(prev => [
        ...prev,
        {
          id: 'signup_err_' + Date.now(),
          isUser: false,
          text: `⚠️ ${errMsg}`
        }
      ]);
    } finally {
      setIsLoading(false);
      setSignupStep(null);
    }
  };

  const handleConfirmTermsAndSubmit = async () => {
    if (!isTermsAgreed || isLoading) return;
    setIsLoading(true);
    setSignupStep('submitting');
    const lang = signupPrompts[langCode] ? langCode : 'en';

    setMessages(prev => [
      ...prev,
      {
        id: 'terms_agreed_msg_' + Date.now(),
        isUser: true,
        text: lang === 'hi' ? 'मैंने सेवा की शर्तें और गोपनीयता नीति स्वीकार कर ली है।' : (lang === 'mr' ? 'मी सेवा अटी आणि गोपनीयता धोरण स्वीकारले आहे.' : 'I have read and agree to the Terms of Service and Privacy Policy.')
      },
      {
        id: 'bot_submitting_' + Date.now(),
        isUser: false,
        text: signupPrompts[lang].submitting
      }
    ]);

    await submitConversationalSignup(signupFlowData);
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userText = inputText;
    setInputText('');

    const lang = signupPrompts[langCode] ? langCode : 'en';

    // INTERCEPT: If in conversational signup mode, feed values to state machine
    if (signupStep) {
      const lowerText = userText.toLowerCase().trim();
      const cancelKeywords = ['cancel', 'exit', 'stop', 'quit', 'radd', 'cancel signup', 'features', 'bata', 'batao', 'help', 'menu', 'exit signup'];
      
      // If user types cancel keyword, abort conversational signup flow
      if (cancelKeywords.some(keyword => lowerText.includes(keyword))) {
        setSignupStep(null);
        setMessages(prev => [
          ...prev,
          { id: 'msg_' + Date.now(), isUser: true, text: userText },
          { 
            id: 'bot_' + Date.now(), 
            isUser: false, 
            text: lang === 'hi' 
              ? 'साइनअप रद्द कर दिया गया है। आप मुझसे कुछ भी पूछ सकते हैं!' 
              : (lang === 'mr' ? 'साइनअप रद्द केले आहे. तुम्ही मला काहीही विचारू शकता!' : 'Signup cancelled. You can ask me anything!') 
          }
        ]);
        return;
      }

      // Log user message
      setMessages(prev => [...prev, { id: 'msg_' + Date.now(), isUser: true, text: userText }]);
      setIsLoading(true);

      const currentData = { ...signupFlowData };

      setTimeout(async () => {
        if (signupStep === 'name') {
          currentData.name = userText;
          setSignupFlowData(currentData);
          setSignupStep('email');
          setMessages(prev => [
            ...prev,
            { id: 'bot_' + Date.now(), isUser: false, text: signupPrompts[lang].askEmail }
          ]);
          setIsLoading(false);
        } else if (signupStep === 'email') {
          // Simple validation check
          if (!userText.includes('@')) {
            setMessages(prev => [
              ...prev,
              { id: 'bot_' + Date.now(), isUser: false, text: lang === 'hi' ? 'कृपया एक मान्य ईमेल आईडी दर्ज करें (जैसे test@gmail.com):' : (lang === 'mr' ? 'कृपया वैध ईमेल प्रविष्ट करा (उदा. test@gmail.com):' : 'Please provide a valid email address (e.g. test@gmail.com):') }
            ]);
            setIsLoading(false);
            return;
          }
          currentData.email = userText;
          setSignupFlowData(currentData);
          setSignupStep('password');
          setMessages(prev => [
            ...prev,
            { id: 'bot_' + Date.now(), isUser: false, text: signupPrompts[lang].askPassword }
          ]);
          setIsLoading(false);
        } else if (signupStep === 'password') {
          if (userText.length < 6) {
            setMessages(prev => [
              ...prev,
              { id: 'bot_' + Date.now(), isUser: false, text: lang === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए। कृपया पुनः दर्ज करें:' : (lang === 'mr' ? 'पासवर्ड किमान ६ अक्षरांचा असावा. कृपया पुन्हा प्रविष्ट करा:' : 'Password must be at least 6 characters. Please try again:') }
            ]);
            setIsLoading(false);
            return;
          }
          currentData.password = userText;
          setSignupFlowData(currentData);

          if (currentData.role === 'member') {
            setSignupStep('plan');
            setMessages(prev => [
              ...prev,
              { 
                id: 'bot_' + Date.now(), 
                isUser: false, 
                text: signupPrompts[lang].askPlan,
                options: [
                  { label: 'Free Sakhi', value: 'Free Sakhi' },
                  { label: 'Premium Sakhi', value: 'Premium Sakhi' }
                ],
                stepName: 'plan'
              }
            ]);
            setIsLoading(false);
          } else if (currentData.role === 'advisor') {
            setSignupStep('specialty');
            setMessages(prev => [
              ...prev,
              { 
                id: 'bot_' + Date.now(), 
                isUser: false, 
                text: signupPrompts[lang].askSpecialty,
                options: [
                  { label: 'Hormonal Health', value: 'Hormonal Health' },
                  { label: 'Nutritionist', value: 'Nutritionist' },
                  { label: 'PCOS Expert', value: 'PCOS Expert' },
                  { label: 'Mental Wellness', value: 'Mental Wellness' }
                ],
                stepName: 'specialty'
              }
            ]);
            setIsLoading(false);
          } else {
            // Partner goes straight to phone
            setSignupStep('phone');
            setMessages(prev => [
              ...prev,
              { id: 'bot_' + Date.now(), isUser: false, text: signupPrompts[lang].askPhone }
            ]);
            setIsLoading(false);
          }
        } else if (signupStep === 'phone') {
          currentData.phone = userText;
          setSignupFlowData(currentData);
          setSignupStep('terms');
          setIsLoading(false);
          
          setMessages(prev => [
            ...prev,
            { 
              id: 'bot_terms_' + Date.now(), 
              isUser: false, 
              text: signupPrompts[lang].askTerms,
              isTermsStep: true
            }
          ]);
        }
      }, 600);

      return;
    }

    // Default conversational AI interaction via backend
    const userTextCopy = userText;
    setMessages(prev => [...prev, { id: 'msg_' + Date.now(), isUser: true, text: userTextCopy }]);
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem('hs_access_token') || localStorage.getItem('hs_access_token');
      const response = await axios.post(`${API_BASE_URL}/chat/message`, {
        message: userTextCopy,
        sessionId: sessionId,
        langCode: langCode // dynamic landing page language context
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data && response.data.success) {
        let text = response.data.response || '';
        let showBooks = false;
        
        const lowerUserMsg = userTextCopy.toLowerCase();
        const bookKeywords = ['book', 'books', 'read', 'library', 'kitab', 'pustak', 'pcod', 'weight', 'shaadi', 'husband', 'family', 'beauty', 'growth', 'read book'];
        
        if (text.includes('[SHOW_BOOKS]') || bookKeywords.some(k => lowerUserMsg.includes(k))) {
          text = text.replace('[SHOW_BOOKS]', '').trim();
          showBooks = true;
        }

        setMessages(prev => [
          ...prev, 
          { 
            id: 'bot_' + Date.now(), 
            isUser: false, 
            text: text,
            books: showBooks ? ALL_LANDING_BOOKS : undefined
          }
        ]);
      } else {
        const lang = langCode;
        setMessages(prev => [...prev, { id: 'bot_' + Date.now(), isUser: false, text: lang === 'hi' ? 'क्षमा करें, मैं अभी इसका उत्तर नहीं दे सकता।' : (lang === 'mr' ? 'क्षमस्व, मी आता याचे उत्तर देऊ शकत नाही.' : 'Sorry, I cannot answer that right now.') }]);
      }
    } catch (err) {
      console.error('Chatbot API Error:', err);
      const lang = langCode;
      setMessages(prev => [...prev, { id: 'bot_' + Date.now(), isUser: false, text: lang === 'hi' ? 'क्षमा करें, मैं अभी इसका उत्तर नहीं दे सकता।' : (lang === 'mr' ? 'क्षमस्व, मी आता याचे उत्तर देऊ शकत नाही.' : 'Sorry, I cannot answer that right now.') }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo flows triggered by greeting buttons
  const triggerDemoFlow = (flowType) => {
    const isHindi = (langCode === 'hi');
    const isMarathi = (langCode === 'mr');

    if (flowType === 'explore_ai') {
      const userText = isHindi ? 'AI फीचर्स एक्सप्लोर करें' : (isMarathi ? 'AI वैशिष्ट्ये एक्सप्लोर करा' : 'Explore AI Features');
      const replyText = isHindi 
        ? '✨ **AI सखी हेल्थ हेल्पर** बेसिक सखी (₹499/महीना) और प्रीमियम सखी (₹999/महीना) प्लान में उपलब्ध है! सदस्य लक्षणों के बारे में पूछ सकते हैं, मानसिक स्वास्थ्य को ट्रैक कर सकते हैं और सुरक्षित लॉग रिकॉर्ड रख सकते हैं। आज ही साइन अप करें!'
        : (isMarathi 
          ? '✨ **AI सखी हेल्थ हेल्पर** बेसिक सखी (₹499/महिना) आणि प्रीमियम सखी (₹999/महिना) प्लॅनमध्ये उपलब्ध आहे! सदस्य लक्षणांबद्दल विचारू शकतात, मानसिक आरोग्याचा मागोवा घेऊ शकतात आणि सुरक्षित लॉग रेकॉर्ड ठेवू शकतात. आजच साइन अप करा!'
          : '✨ **AI Sakhi Health Helper** is available on Basic Sakhi (₹499/mo) and Premium Sakhi (₹999/mo) plans! Members can ask about symptoms, track mental health wellness, get custom suggestions, and keep secure log records. Sign up now to get started!');
      
      setMessages(prev => [
        ...prev,
        { id: 'user_flow_' + Date.now(), isUser: true, text: userText },
        { id: 'bot_flow_' + Date.now(), isUser: false, text: replyText }
      ]);
    } else if (flowType === 'member_flow') {
      const userText = isHindi ? 'मेंबर फ्लो देखें' : (isMarathi ? 'सदस्य फ्लो पहा' : 'See Member Flow');
      const replyText = isHindi
        ? '🌸 **मेंबर फ्लो डेमो**:\n- वेलनेस स्कोर और स्ट्रैक ट्रैकर के साथ डैशबोर्ड।\n- फर्टाइल दिनों की गणना और पीरियड साइकिल लॉग करने के लिए **पीरियड ट्रैकर**।\n- आय-व्यय ट्रैक करने के लिए **होम बजट सखी**।\n- **बुक लाइब्रेरी**: फ्री सखी प्लान (आजीवन मुफ्त) में 5 पुस्तकें पढ़ सकती हैं। बेसिक सखी (₹499/महीना) में असीमित पुस्तकें + AI चैट बॉट + वेलनेस सर्टिफिकेट! प्रीमियम सखी (₹999/महीना) में सब कुछ अनलिमिटेड + पार्टनर सखी + आस्क हेल्थ सखी!'
        : (isMarathi
          ? '🌸 **सदस्य फ्लो डेमो**:\n- वेलनेस स्कोअर आणि स्ट्रीक ट्रॅकरसह डॅशबोर्ड.\n- सुपीक दिवसांची गणना करण्यासाठी आणि पीरियड सायकल नोंदवण्यासाठी **पीरियड ट्रॅकर**.\n- उत्पन्न व खर्च ट्रॅक करण्यासाठी **होम बजेट सखी**.\n- **बुक लायब्ररी**: फ्री सखी प्लॅन (आयुष्यभर मोफत) मध्ये ५ पुस्तके. बेसिक सखी (₹499/महिना) मध्ये अमर्यादित पुस्तके + AI चॅट बॉट + वेलनेस सर्टिफिकेट! प्रीमियम सखी (₹999/महिना) मध्ये सर्व काही अमर्यादित + पार्टनर सखी + आस्क हेल्थ सखी!'
          : '🌸 **See Member Flow Demo**:\n- Dashboard overview with Wellness Score & Streak Tracker.\n- **Period Tracker** to log cycles and calculate fertile days.\n- **Home Budget Sakhi** to track income & expenses.\n- **Book Library**: 🌸 Free Sakhi (Lifetime Free) = 5 books. ⚡ Basic Sakhi (₹499/mo) = Unlimited Books + AI Chat Bot + Wellness Certificate! 👑 Premium Sakhi (₹999/mo) = All features including Partner Sakhi earnings & Ask Health Sakhi!');

      setMessages(prev => [
        ...prev,
        { id: 'user_flow_' + Date.now(), isUser: true, text: userText },
        { id: 'bot_flow_' + Date.now(), isUser: false, text: replyText }
      ]);
    } else if (flowType === 'advisor_flow') {
      const userText = isHindi ? 'सलाहकार फ्लो देखें' : (isMarathi ? 'सल्लागार फ्लो पहा' : 'See Advisor Flow');
      const replyText = isHindi
        ? '🩺 **सलाहकार फ्लो डेमो**:\n- उपलब्धता स्लॉट बनाने का मैनेजर।\n- आगामी अपॉइंटमेंट्स और सदस्य परामर्श का विवरण।\n- डिजिटल रूप से परामर्श नोट्स और नुस्खे लिखना।'
        : (isMarathi
          ? '🩺 **सल्लागार फ्लो डेमो**:\n- उपलब्धता स्लॉट व्यवस्थापित करण्यासाठी स्लॉट व्यवस्थापक.\n- आगामी भेटी आणि सदस्य सल्लामसलत तपशील.\n- डिजिटल सल्लामसलत नोट्स आणि प्रिस्क्रिप्शन लिहिणे.'
          : '🩺 **Advisor Flow Demo**:\n- Complete slot availability manager.\n- View upcoming consultation slots and student appointments.\n- Write digital consultation notes and share prescriptions securely.');

      setMessages(prev => [
        ...prev,
        { id: 'user_flow_' + Date.now(), isUser: true, text: userText },
        { id: 'bot_flow_' + Date.now(), isUser: false, text: replyText }
      ]);
    }
  };

  const handleBookCardClick = (bookTitle) => {
    const isHindi = (langCode === 'hi');
    const isMarathi = (langCode === 'mr');

    const replyText = isHindi
      ? `🔒 **"${bookTitle}" पढ़ने या सुनने के लिए अपना प्लान चुनें!**\n\n- **🌸 फ्री सखी (आजीवन मुफ्त):** 5 पुस्तकें पढ़ सकती हैं।\n- **⚡ बेसिक सखी (₹499/महीना):** सभी पुस्तकें असीमित + AI चैट बॉट 24/7 + वेलनेस सर्टिफिकेट अनलॉक्ड!\n- **👑 प्रीमियम सखी (₹999/महीना):** सब कुछ अनलिमिटेड — पार्टनर सखी कमाई और आस्क हेल्थ सखी भी अनलॉक्ड!\n\nअभी साइन अप करें और अपना मनपसंद प्लान चुनें! 🌸`
      : (isMarathi
        ? `🔒 **"${bookTitle}" वाचण्यासाठी किंवा ऐकण्यासाठी तुमचा प्लॅन निवडा!**\n\n- **🌸 फ्री सखी (आयुष्यभर मोफत):** ५ पुस्तके वाचू शकता.\n- **⚡ बेसिक सखी (₹499/महिना):** सर्व पुस्तके अमर्यादित + AI चॅट बॉट 24/7 + वेलनेस सर्टिफिकेट अनलॉक्ड!\n- **👑 प्रीमियम सखी (₹999/महिना):** सर्व काही अमर्यादित — पार्टनर सखी कमाई आणि आस्क हेल्थ सखी अनलॉक्ड!\n\nआत्ताच साइन अप करा आणि तुमचा आवडता प्लॅन निवडा! 🌸`
        : `🔒 **Sign up & select your plan to read or listen to "${bookTitle}"!**\n\n- **🌸 Free Sakhi (Lifetime Free):** Access up to 5 wellness books.\n- **⚡ Basic Sakhi (₹499 / 1 Month):** Unlimited Books + AI Chat Bot 24/7 + Wellness Certificate Unlocked!\n- **👑 Premium Sakhi (₹999 / 1 Month):** All features Unlimited including Partner Sakhi referral earnings & Ask Health Sakhi direct chat!\n\nSign up as a Member now to unlock full access! 🌸`);

    setMessages(prev => [
      ...prev,
      { id: 'user_book_click_' + Date.now(), isUser: true, text: `📖 Clicked "${bookTitle}"` },
      { id: 'bot_book_click_reply_' + Date.now(), isUser: false, text: replyText }
    ]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormSubmitting(true);

    try {
      if (formType === 'login') {
        const response = await axios.post(`${API_BASE_URL}/user/login`, {
          email: formData.email,
          password: formData.password,
          role: formData.role
        });

        if (response.data && response.data.success) {
          // Store token in local and session storages
          localStorage.setItem('hs_access_token', response.data.token);
          localStorage.setItem('hs_refresh_token', response.data.refreshToken);
          sessionStorage.setItem('hs_access_token', response.data.token);
          sessionStorage.setItem('hs_refresh_token', response.data.refreshToken);
          
          const userObj = {
            id: response.data.user.id,
            name: response.data.user.profile.full_name,
            email: response.data.user.email,
            plan: response.data.user.profile.plan_badge
          };
          
          sessionStorage.setItem('hs_current_member', JSON.stringify(userObj));
          sessionStorage.setItem('temp_role', response.data.role);

          setFormSuccess('Logged in successfully!');
          setIsLoggedIn(true);
          setUserData(userObj);
          fetchUserFeatures(response.data.token);
          
          // Add system bot message
          setMessages(prev => [...prev, {
            id: 'sys_' + Date.now(),
            isUser: false,
            text: `Welcome back, ${userObj.name}! 🎉 You are now logged in as a **${response.data.role}** and full features are unlocked.`
          }]);

          setTimeout(() => {
            setIsFormOpen(false);
            setFormSuccess('');
          }, 1500);
        } else if (response.data && response.data.code === 'PENDING_APPROVAL') {
          setFormError('Your account registration is pending admin approval.');
        } else {
          setFormError(response.data.message || 'Login failed. Please verify credentials.');
        }
      } else {
        // Signup
        const response = await axios.post(`${API_BASE_URL}/user/signup`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
          specialty: formData.role === 'advisor' ? formData.specialty : undefined,
          plan: formData.role === 'member' ? formData.plan : undefined
        });

        if (response.data && response.data.success) {
          setFormSuccess('Signup request submitted successfully! Awaiting admin approval.');
          setMessages(prev => [...prev, {
            id: 'sys_' + Date.now(),
            isUser: false,
            text: `Thank you for signing up, ${formData.name || formData.email}! 🌸 Your registration is pending admin approval. You will receive an alert once approved.`
          }]);
          
          setTimeout(() => {
            setFormType('login');
            setFormSuccess('');
          }, 2000);
        } else {
          setFormError(response.data.message || 'Signup failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Auth Error:', err);
      setFormError(err.response?.data?.message || 'Authentication error. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hs_access_token');
    localStorage.removeItem('hs_refresh_token');
    sessionStorage.removeItem('hs_access_token');
    sessionStorage.removeItem('hs_refresh_token');
    sessionStorage.removeItem('hs_current_member');
    sessionStorage.removeItem('temp_role');
    
    setIsLoggedIn(false);
    setUserData(null);
    setUserFeatures([]);
    
    setMessages(prev => [...prev, {
      id: 'sys_' + Date.now(),
      isUser: false,
      text: 'You have been logged out. The chatbot has returned to demo mode.'
    }]);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 font-['Poppins']">
      {/* 1. Floating Action Chatbot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg hover:scale-105 transition-all duration-300 animate-float"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* 2. Chat Window Drawer */}
      {isOpen && (
        <div className="flex flex-col w-[330px] sm:w-[370px] h-[460px] sm:h-[490px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold flex-shrink-0 z-10 shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm">HealthSakhi Guide</h3>
                <p className="text-[9px] text-pink-100">AI Assistant Online</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1.5">
              {isLoggedIn ? (
                <button 
                  onClick={handleLogout} 
                  title="Logout"
                  className="p-1 hover:bg-rose-700/50 rounded-full transition-all text-pink-100"
                >
                  <LogOut size={15} />
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setFormType('login');
                    setIsFormOpen(true);
                  }}
                  className="text-[11px] px-2 py-0.5 bg-white/20 hover:bg-white/35 rounded-md font-semibold text-white transition-all"
                >
                  Sign In
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 active:scale-95 transition-all text-white font-extrabold cursor-pointer"
                title="Close Assistant"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* User Info Bar if Logged In */}
          {isLoggedIn && userData && (
            <div className="flex items-center justify-between px-4 py-1.5 bg-pink-50 border-b border-pink-100 text-xs text-pink-800">
              <span className="font-medium truncate max-w-[200px]">👤 {userData.name}</span>
              <span className="px-1.5 py-0.5 bg-pink-200/50 rounded text-[10px] font-bold uppercase">{userData.plan || 'Free'}</span>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 no-scrollbar relative">
            
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.isUser 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {msg.text}
                </div>

                {/* Render Conversational Choice Options if Present */}
                {!msg.isUser && msg.options && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleConversationalChoice(msg.stepName, opt.value, opt.label)}
                        className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 active:scale-95 text-pink-700 rounded-lg text-xs font-semibold border border-pink-200 shadow-sm transition-all"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Render Terms & Privacy Agreement Box in Chat */}
                {!msg.isUser && msg.isTermsStep && (
                  <div className="mt-3 p-3.5 bg-rose-50/80 border border-rose-200/90 rounded-2xl space-y-3 max-w-[90%] shadow-sm animate-fadeIn">
                    <div className="flex items-start gap-2.5">
                      <input
                        id={`bot-terms-cb-${msg.id}`}
                        type="checkbox"
                        checked={isTermsAgreed}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setShowTermsModal(true);
                          } else {
                            setIsTermsAgreed(false);
                          }
                        }}
                        className="w-4 h-4 rounded border-rose-300 text-pink-600 focus:ring-pink-500 cursor-pointer mt-0.5"
                      />
                      <label htmlFor={`bot-terms-cb-${msg.id}`} className="text-[11px] font-bold text-gray-700 leading-snug cursor-pointer">
                        I have read and agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-pink-600 font-extrabold hover:underline"
                        >
                          Terms of Service
                        </button>{' '}
                        and{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-pink-600 font-extrabold hover:underline"
                        >
                          Privacy Policy
                        </button>
                      </label>
                    </div>

                    <button
                      type="button"
                      disabled={!isTermsAgreed || isLoading}
                      onClick={handleConfirmTermsAndSubmit}
                      className={`w-full py-2.5 px-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-[11px] uppercase tracking-wider rounded-xl shadow-md transition-all ${
                        !isTermsAgreed || isLoading ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'
                      }`}
                    >
                      {isLoading ? 'Submitting...' : 'Confirm & Submit Signup Request'}
                    </button>
                  </div>
                )}

                {/* Render Book Cards if Present */}
                {!msg.isUser && msg.books && (
                  <div className="mt-3 w-full max-w-[100%] overflow-x-auto pb-2 pt-1 no-scrollbar">
                    <div className="flex gap-2.5">
                      {msg.books.map((book, idx) => (
                        <div 
                          key={idx}
                          onClick={() => handleBookCardClick(book.title)}
                          className="flex flex-col w-[125px] shrink-0 p-2 bg-white hover:bg-pink-50/50 border border-gray-100 hover:border-pink-300 rounded-xl cursor-pointer shadow-sm active:scale-95 transition-all group"
                        >
                          <div className="aspect-[1/1.4] rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center mb-1.5 p-0.5 shadow-inner">
                            <img 
                              src={book.img} 
                              alt={book.title} 
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 rounded-md"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400';
                              }}
                            />
                          </div>
                          <span className="font-bold text-gray-800 text-[11px] leading-tight truncate">{book.title}</span>
                          <span className="text-gray-500 text-[9px] truncate">{book.author || 'Dr. Pratap Madhukar'}</span>
                          <span className="mt-1 text-[9px] text-pink-600 font-semibold bg-pink-50 rounded py-0.5 text-center border border-pink-100">📖 Read Book</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            {/* Scroll Anchor */}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Actions (Signup triggers & simulated flows) */}
          {!isLoggedIn && !isLoading && (
            <div className="p-2.5 bg-white border-t border-gray-100 space-y-2">
              
              {signupStep ? (
                // Show a Cancel button when in active signup flow
                <div className="flex gap-1.5 justify-center">
                  <button
                    onClick={() => {
                      setSignupStep(null);
                      setMessages(prev => [
                        ...prev,
                        {
                          id: 'signup_cancel_' + Date.now(),
                          isUser: false,
                          text: langCode === 'hi' ? 'साइनअप रद्द कर दिया गया है। आप मुझसे कुछ भी पूछ सकते हैं!' : (langCode === 'mr' ? 'साइनअप रद्द केले आहे. तुम्ही मला काहीही विचारू शकता!' : 'Signup cancelled. You can ask me anything!')
                        }
                      ]);
                    }}
                    className="w-full py-1.5 px-3 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-full text-[12px] font-semibold shadow-sm transition-all text-center"
                  >
                    ❌ {langCode === 'hi' ? 'साइनअप रद्द करें' : (langCode === 'mr' ? 'साइनअप रद्द करा' : 'Cancel Signup')}
                  </button>
                </div>
              ) : (
                <>
                  {/* Row 1: Conversational Signup Buttons */}
                  <div className="flex gap-1.5 justify-center">
                    <button
                      onClick={() => startConversationalSignup('member')}
                      className="w-full py-1.5 px-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90 active:scale-95 text-white rounded-full text-[12px] font-semibold shadow-sm transition-all text-center"
                    >
                      🌸 {langCode === 'hi' ? 'मेंबर साइनअप' : (langCode === 'mr' ? 'सदस्य नोंदणी' : 'Member Signup')}
                    </button>
                  </div>

                  {/* Row 2: Demo Explorer flows */}
                  <div className="flex gap-1.5 justify-center">
                    <button 
                      onClick={() => triggerDemoFlow('explore_ai')}
                      className="flex-1 py-1.5 px-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full text-[11px] font-medium transition-all border border-gray-200 text-center"
                    >
                      🧭 {langCode === 'hi' ? 'AI फीचर्स' : (langCode === 'mr' ? 'AI वैशिष्ट्ये' : 'Explore AI')}
                    </button>
                    <button 
                      onClick={() => triggerDemoFlow('member_flow')}
                      className="flex-1 py-1.5 px-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full text-[11px] font-medium transition-all border border-gray-200 text-center"
                    >
                      👩 {langCode === 'hi' ? 'मेंबर फ्लो' : (langCode === 'mr' ? 'सदस्य फ्लो' : 'Member Flow')}
                    </button>
                  </div>
                </>
              )}

            </div>
          )}

          {/* Logged in Features Preview */}
          {isLoggedIn && userFeatures.length > 0 && (
            <div className="px-4 py-2 bg-pink-50/50 border-t border-pink-100">
              <p className="text-[10px] font-semibold text-pink-800 mb-1.5 uppercase tracking-wider">Your Dashboard Features:</p>
              <div className="grid grid-cols-2 gap-1.5">
                {userFeatures.map((feat, index) => (
                  <a 
                    key={index} 
                    href={feat.path}
                    className="flex flex-col p-1.5 bg-white hover:bg-pink-100/50 border border-pink-100 rounded text-left transition-all text-xs"
                  >
                    <span className="font-semibold text-pink-900 text-[11px] truncate">{feat.name}</span>
                    <span className="text-[9px] text-gray-500 line-clamp-1">{feat.description}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input Bar */}
          <form onSubmit={handleSend} className="flex items-center p-3 border-t border-gray-100 bg-white">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={signupStep ? "Type response..." : "Ask about HealthSakhi..."}
              className="flex-1 px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500 focus:bg-white transition-all text-gray-800"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="ml-2 p-2 rounded-xl bg-pink-500 hover:bg-rose-600 text-white disabled:opacity-50 disabled:hover:bg-pink-500 transition-all shadow-sm"
            >
              <Send size={16} />
            </button>
          </form>

          {/* 3. In-Chat Signup/Login Lightbox Form */}
          {isFormOpen && (
            <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fadeIn font-['Poppins']">
              <div className="bg-white w-full max-w-[340px] rounded-2xl shadow-2xl p-5 border border-gray-100 flex flex-col relative">
                
                {/* Close modal */}
                <button 
                  onClick={() => {
                    setIsFormOpen(false);
                    setFormError('');
                    setFormSuccess('');
                  }}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={18} />
                </button>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 mb-4 text-sm font-semibold">
                  <button 
                    onClick={() => {
                      setFormType('login');
                      setFormError('');
                    }}
                    className={`flex-1 pb-2 text-center border-b-2 transition-all ${
                      formType === 'login' 
                        ? 'border-pink-500 text-pink-600' 
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {T.login}
                  </button>
                  <button 
                    onClick={() => {
                      setFormType('signup');
                      setFormError('');
                      setFormData(prev => ({ ...prev, role: 'member' })); // Reset to member role for signup
                    }}
                    className={`flex-1 pb-2 text-center border-b-2 transition-all ${
                      formType === 'signup' 
                        ? 'border-pink-500 text-pink-600' 
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {T.requestSignup}
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleFormSubmit} className="space-y-3">
                  
                  {/* Name field (Signup only) */}
                  {formType === 'signup' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">{T.fullName}</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Aditi Sharma" 
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500 text-gray-800"
                      />
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">{T.emailAddress}</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="aditi@example.com" 
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500 text-gray-800"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">{T.password}</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="••••••••" 
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500 pr-8 text-gray-800"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Phone (Signup only) */}
                  {formType === 'signup' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">{T.phoneNumber}</label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+91 98765 43210" 
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500 text-gray-800"
                      />
                    </div>
                  )}




                  {/* Plan dropdown (Signup member only) */}
                  {formType === 'signup' && formData.role === 'member' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">{T.selectPlan}</label>
                      <select 
                        value={formData.plan}
                        onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500 bg-white text-gray-800"
                      >
                        <option value="Free Sakhi">Free Sakhi</option>
                        <option value="Premium Sakhi">Premium Sakhi</option>
                      </select>
                    </div>
                  )}

                  {/* Specialty dropdown (Advisor signup only) */}
                  {formType === 'signup' && formData.role === 'advisor' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">{T.specialization}</label>
                      <select 
                        value={formData.specialty}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500 bg-white text-gray-800"
                      >
                        <option value="Hormonal Health">Hormonal Health</option>
                        <option value="Nutritionist">Nutritionist</option>
                        <option value="PCOS Expert">PCOS Expert</option>
                        <option value="Mental Wellness">Mental Wellness</option>
                      </select>
                    </div>
                  )}

                  {/* Terms & Privacy Checkbox (Signup only) */}
                  {formType === 'signup' && (
                    <div className="flex items-start gap-2 py-1">
                      <input
                        id="lightbox-terms-checkbox"
                        type="checkbox"
                        checked={isTermsAgreed}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setShowTermsModal(true);
                          } else {
                            setIsTermsAgreed(false);
                          }
                        }}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-pink-600 focus:ring-pink-500 cursor-pointer mt-0.5"
                      />
                      <label htmlFor="lightbox-terms-checkbox" className="text-[10px] font-semibold text-gray-600 leading-tight cursor-pointer">
                        {T.termsCheckbox}{' '}
                        <button type="button" onClick={() => setShowTermsModal(true)} className="text-pink-600 font-extrabold hover:underline">{T.termsOf}</button>{' '}
                        {T.and}{' '}
                        <button type="button" onClick={() => setShowTermsModal(true)} className="text-pink-600 font-extrabold hover:underline">{T.privacyPolicy}</button>
                      </label>
                    </div>
                  )}

                  {/* Message Alert Boxes */}
                  {formError && (
                    <div className="text-[10px] text-red-600 bg-red-50 p-2 rounded-lg text-center font-medium">
                      ⚠️ {formError}
                    </div>
                  )}
                  {formSuccess && (
                    <div className="text-[10px] text-green-700 bg-green-50 p-2 rounded-lg text-center font-medium">
                      ✅ {formSuccess}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={formSubmitting || (formType === 'signup' && !isTermsAgreed)}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold text-xs shadow-md hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
                  >
                    {formSubmitting ? (
                      <>
                        <Loader size={12} className="animate-spin" />
                        <span>{T.processing}</span>
                      </>
                    ) : (
                      <>
                        {formType === 'login' ? <Lock size={12} /> : <UserPlus size={12} />}
                        <span>{formType === 'login' ? T.logIn : T.requestSignupBtn}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      )}
      
      {/* Terms & Privacy Policy Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-['Poppins']">
          <div className="bg-white w-full max-w-lg md:max-w-xl rounded-2xl md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden h-[70vh] max-h-[520px] relative animate-fadeIn mx-4 sm:mx-0">
            {/* Modal Header */}
            <div className="flex-shrink-0 p-4 md:p-6 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-white flex justify-between items-center">
              <div>
                <h3 className="font-serif font-black text-[#4B1E5A] text-xl md:text-2xl">{T.termsTitle}</h3>
                <p className="text-[10px] md:text-xs font-bold text-[#C4A0AC] tracking-widest uppercase mt-1">{T.termsSubtitle}</p>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Scrollable Text */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50">
              <div className="prose prose-sm max-w-none text-[#4B1E5A]/80 whitespace-pre-wrap font-medium leading-relaxed">
                {termsText || 'Loading terms...'}
              </div>
            </div>

            {/* Modal Footer / Accept Button */}
            <div className="flex-shrink-0 p-4 md:p-6 border-t border-gray-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row gap-4 items-center justify-between">
              <p className="text-[10px] font-bold text-gray-400">{T.termsFooter}</p>
              <button
                onClick={() => {
                  setIsTermsAgreed(true);
                  setShowTermsModal(false);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#E91E63] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-[#D81B60] hover:shadow-lg transition-all"
              >
                {T.acceptAgree}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Light keyframes styling for animate-fadeIn */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
      `}} />
    </div>
  );
};

export default LandingChatBot;
