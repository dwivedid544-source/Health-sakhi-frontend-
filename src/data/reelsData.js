/** Sakhi Reels — multilingual emotional micro-stories */

const L = (en, hi, mr, ta, te, bn, ar) => ({ en, hi, mr, mr, ta, te, bn, ar });

// Fix: mr duplicated - let me write properly

export const reelsList = [
  {
    id: 'reel_husband_stress',
    layers: ['family', 'relationship'],
    gradient: 'from-[#4a1942] via-[#7b2d5e] to-[#2d1b3d]',
    emoji: '💑',
    title: {
      en: 'When husband is stressed, wife absorbs it',
      hi: 'जब पति तनाव में हो, पत्नी सब सोख लेती है',
      mr: 'पती तणावात असतो तेव्हा पत्नी ते शोषते',
      ta: 'கணவர் மன அழுத்தத்தில் இருக்கும்போது, மனைவி அதை உறிஞ்சுகிறார்',
      te: 'భర్త ఒత్తిడిలో ఉన్నప్పుడు, భార్య దానిని శోషిస్తుంది',
      bn: 'স্বামী চাপে থাকলে, স্ত্রী তা শোষে নেয়',
      ar: 'عندما يكون الزوج متوتراً، الزوجة تمتص ذلك'
    },
    caption: {
      en: 'His silence becomes your worry. His anger becomes your headache. You are not weak — your body is translating family stress.',
      hi: 'उसकी खामोशी आपकी चिंता बन जाती है। उसका गुस्सा आपके सिरदर्द में बदल जाता है। आप कमज़ोर नहीं — आपका शरीर परिवार का तनाव समझ रहा है।',
      mr: 'त्याची शांतता तुमची काळजी बनते. त्याचा राग तुमच्या डोकेदुखीत बदलतो. तुम्ही कमकुवत नाही — तुमचे शरीर कुटुंबातील तणाव भाषांतर करत आहे.',
      ta: 'அவரது மௌனம் உங்கள் கவலையாகிறது. உங்கள் உடல் குடும்ப மன அழுத்தத்தை மொழிபெயர்க்கிறது.',
      te: 'అతని నిశ్శబ్దం మీ ఆందోళనగా మారుతుంది. మీ శరీరం కుటుంబ ఒత్తిడిని అనువదిస్తోంది.',
      bn: 'তার নীরবতা আপনার চিন্তা হয়ে ওঠে। আপনার শরীর পরিবারের চাপ অনুবাদ করছে।',
      ar: 'صمته تصبح قلقك. جسدك يترجم ضغط العائلة.'
    },
    sakhiPrompt: {
      en: 'My husband is very stressed and I feel it in my body. What can I do?',
      hi: 'मेरा पति बहुत स्ट्रेस में है और मुझे अपने शरीर में महसूस हो रहा है। मैं क्या करूँ?'
    }
  },
  {
    id: 'reel_no_one_listens',
    layers: ['emotional', 'mental'],
    gradient: 'from-[#1e3a5f] via-[#4a6fa5] to-[#2d3748]',
    emoji: '🌙',
    title: {
      en: 'When no one listens, the body starts speaking',
      hi: 'जब कोई सुनता नहीं, शरीर बोलने लगता है',
      mr: 'कोणी ऐकत नाही तेव्हा शरीर बोलू लागते',
      ta: 'யாரும் கேட்காதபோது, உடல் பேசத் தொடங்குகிறது',
      te: 'ఎవరూ వినకపోతే, శరీరం మాట్లాడటం మొదలుపెడుతుంది',
      bn: 'কেউ শোনে না, তখন শরীর কথা বলতে শুরু করে',
      ar: 'عندما لا أحد يستمع، الجسد يبدأ بالحديث'
    },
    caption: {
      en: 'Unsaid words become back pain, fatigue, or tears without reason. Your body is not betraying you — it is asking to be heard.',
      hi: 'अनकहे शब्द कमर दर्द, थकान, या बिना वजह आँसू बन जाते हैं। शरीर धोखा नहीं दे रहा — सुनने की गुहार लगा रहा है।',
      mr: 'न सांगितलेले शब्द पाठदुखी, थकवा किंवा अकारण अश्रू बनतात. शरीर विश्वासघात करत नाही — ऐकण्याची विनंती करत आहे.',
      ta: 'சொல்லாத வார்த்தைகள் உடல் வலியாகிறது. உடல் கேட்கச் சொல்கிறது.',
      te: 'చెప్పని మాటలు నొప్పిగా మారుతాయి. శరీరం వినమనం చేస్తోంది.',
      bn: 'না বলা কথা ব্যথায় পরিণত হয়। শরীর শোনার অনুরোধ করছে।',
      ar: 'الكلمات غير المقالة تصبح ألماً. جسدك يطلب أن يُسمع.'
    },
    sakhiPrompt: {
      en: 'I feel unheard at home. My body hurts and I do not know why.',
      hi: 'मुझे लगता है घर पर कोई नहीं सुनता। शरीर दुखता है और समझ नहीं आता क्यों।'
    }
  },
  {
    id: 'reel_mil_tension',
    layers: ['family', 'relationship'],
    gradient: 'from-[#5c3d2e] via-[#8b5a3c] to-[#3d2914]',
    emoji: '🏠',
    title: {
      en: 'Maa-saas tension — and your health pays',
      hi: 'माँ-सास का तनाव — और आपकी सेहत भुगतती है',
      mr: 'सासू-सुनबाई तणाव — आणि तुमचे आरोग्य भरतं',
      ta: 'குடும்ப பதற்றம் — உங்கள் ஆரோக்கியம் பாதிக்கப்படுகிறது',
      te: 'కుటుంబ ఉత్తేజం — మీ ఆరోగ్యం ధర చెల్లిస్తుంది',
      bn: 'শ্বশুরবাড়ির চাপ — আর আপনার স্বাস্থ্য খরচ দেয়',
      ar: 'توتر العائلة — وصحتك تدفع الثمن'
    },
    caption: {
      en: 'You are the bridge between two generations. That role is heavy. It is okay to set boundaries with love.',
      hi: 'आप दो पीढ़ियों के बीच पुल हैं। यह भारी भूमिका है। प्यार से सीमा तय करना ठीक है।',
      mr: 'तुम्ही दोन पिढ्यांमधील पूल आहात. प्रेमाने मर्यादा ठरवणे योग्य आहे.',
      ta: 'நீங்கள் இரண்டு தலைமுறைகளுக்கு இடையே பாலமாக இருக்கிறீர்கள்.',
      te: 'మీరు రెండు తరాల మధ్య వంతెన.',
      bn: 'আপনি দুই প্রজন্মের সেতু। ভালোবাসায় সীমা রাখা ঠিক।',
      ar: 'أنت الجسر بين جيلين. وضع حدود بالحب أمر جيد.'
    },
    sakhiPrompt: {
      en: 'There is tension between elders at home and it affects me deeply.',
      hi: 'घर में बड़ों के बीच तनाव है और मुझे बहुत प्रभावित करता है।'
    }
  },
  {
    id: 'reel_parenting_silent',
    layers: ['family', 'parenting'],
    gradient: 'from-[#2d4a3e] via-[#4a7c59] to-[#1a2f23]',
    emoji: '👧',
    title: {
      en: 'Teen won\'t talk — is your chest tight too?',
      hi: 'टीनेजर बात नहीं करता — क्या आपकी छाती भी भारी है?',
      mr: 'किशोर बोलत नाही — तुमच्या छातीतही भार आहे का?',
      ta: 'பதின்வயதினர் பேசவில்லை — உங்கள் மார்பும் கனமா?',
      te: 'టీన్ మాట్లాడడు — మీ ఛాతీ కూడా బరువుగా ఉందా?',
      bn: 'কিশোর কথা বলে না — আপনার বুকও ভারী?',
      ar: 'المراهق لا يتحدث — هل صدرك مثقل أيضاً؟'
    },
    caption: {
      en: 'Parenting is not control — it is presence. Sometimes the bravest thing is to sit quietly beside them.',
      hi: 'पेरेंटिंग कंट्रोल नहीं — उपस्थिति है। कभी सबसे बहादुर काम चुपचाप पास बैठना है।',
      mr: 'पालकत्व म्हणजे नियंत्रण नाही — उपस्थिती. शांत बसणे ही धाडस आहे.',
      ta: 'பெற்றோர்த்துவம் கட்டுப்பாடு அல்ல — இருப்பு.',
      te: 'పేరెంటింగ్ నియంత్రణ కాదు — ఉనికి.',
      bn: 'প্যারেন্টিং নিয়ন্ত্রণ নয় — উপস্থিতি।',
      ar: 'الأبوة ليست سيطرة — إنها حضور.'
    },
    sakhiPrompt: {
      en: 'My teenager has stopped talking to me. I feel like a failure.',
      hi: 'मेरा बच्चा मुझसे बात नहीं करता। मुझे असफल महसूस होता है।'
    }
  },
  {
    id: 'reel_elder_care',
    layers: ['family', 'elder'],
    gradient: 'from-[#3d4f5f] via-[#6b7f8f] to-[#2a3540]',
    emoji: '🤝',
    title: {
      en: 'Caring for parents — who cares for you?',
      hi: 'माता-पिता की देखभाल — आपकी देखभाल कौन करे?',
      mr: 'पालकांची काळजी — तुमची काळजी कोण करतो?',
      ta: 'பெற்றோர் பராமரிப்பு — உங்களை யார் பராமரிக்கிறார்?',
      te: 'తల్లిదండ్రుల సంరక్షణ — మిమ్మల్ని ఎవరు చూసుకుంటారు?',
      bn: 'বাবা-মায়ের যত্ন — আপনার যত্ন কে করবে?',
      ar: 'رعاية الوالدين — من يعتني بك؟'
    },
    caption: {
      en: 'Guilt is not love. You can honor your parents and still rest. Burnout helps no one in the family.',
      hi: 'अपराधबोध प्यार नहीं। आप माता-पिता का सम्मान कर सकती हैं और आराम भी ले सकती हैं। बर्नआउट परिवार में किसी के काम नहीं आता।',
      mr: 'अपराधीपणा म्हणजे प्रेम नाही. विश्रांती घ्या — बर्नआउट कुटुंबाला मदत करत नाही.',
      ta: 'குற்ற உணர்வு அன்பு அல்ல. ஓய்வு எடுக்கலாம்.',
      te: 'అపరాధ భావన ప్రేమ కాదు. విశ్రాంతి తీసుకోండి.',
      bn: 'অপরাধবোধ ভালোবাসা নয়। বিশ্রাম নিন।',
      ar: 'الشعور بالذنب ليس حباً. يمكنك الراحة أيضاً.'
    },
    sakhiPrompt: {
      en: 'I care for my elders but I am exhausted and guilty when I rest.',
      hi: 'मैं बड़ों की देखभाल करती हूँ पर आराम करूँ तो अपराधबोध होता है।'
    }
  },
  {
    id: 'reel_burnout',
    layers: ['emotional', 'stress'],
    gradient: 'from-[#4a3728] via-[#8b6914] to-[#2d2416]',
    emoji: '✨',
    title: {
      en: 'Strong for everyone, broken alone',
      hi: 'सबके लिए मज़बूत, अकेले टूटी हुई',
      mr: 'सगळ्यांसाठी मजबूत, एकट्याने तुटलेली',
      ta: 'அனைவருக்கும் வலுவான, தனியே உடைந்த',
      te: 'అందరికీ బలంగా, ఒంటరిగా విరిగిన',
      bn: 'সবার জন্য শক্তিশালী, একা ভেঙে পড়া',
      ar: 'قوية للجميع، محطمة وحدها'
    },
    caption: {
      en: 'Superwoman is a myth. Your family needs your wellbeing, not your exhaustion.',
      hi: 'सुपरवूमन एक मिथक है। परिवार को आपकी थकान नहीं — आपकी खुशी चाहिए।',
      mr: 'सुपरवूमन हा मिथक आहे. कुटुंबाला तुमचे आरोग्य हवे आहे.',
      ta: 'சூப்பர்வுமன் ஒரு புராணம். குடும்பத்திற்கு உங்கள் நல்வாழ்வு வேண்டும்.',
      te: 'సూపర్‌వోమన్ ఒక పురావృత్తం.',
      bn: 'সুপারওম্যান একটি মিথ্যা। পরিবারের আপনার সুস্থতা দরকার।',
      ar: 'المرأة الخارقة أسطورة. عائلتك تحتاج رفاهيتك.'
    },
    sakhiPrompt: {
      en: 'I take care of everyone but nobody asks how I am.',
      hi: 'मैं सबकी देखभाल करती हूँ पर कोई पूछता नहीं मैं कैसी हूँ।'
    }
  },
  {
    id: 'reel_period_stress',
    layers: ['women', 'family'],
    gradient: 'from-[#5c2d4a] via-[#9b4d72] to-[#3d1f32]',
    emoji: '🌸',
    title: {
      en: 'Family stress can delay your cycle',
      hi: 'परिवार का तनाव पीरियड भी बिगाड़ सकता है',
      mr: 'कुटुंबातील तणाव चक्र विलंबित करू शकतो',
      ta: 'குடும்ப மன அழுத்தம் சுழற்சியை தாமதப்படுத்தலாம்',
      te: 'కుటుంబ ఒత్తిడి చక్రాన్ని ఆలస్యం చేయవచ్చు',
      bn: 'পরিবারের চাপ চক্র বিলম্বিত করতে পারে',
      ar: 'ضغط العائلة قد يؤخر دورتك'
    },
    caption: {
      en: 'Stress → cortisol → hormonal signals shift. Your body and your home are connected. Track both.',
      hi: 'तनाव → कॉर्टिसोल → हार्मोन बदलते हैं। शरीर और घर जुड़े हैं। दोनों देखें।',
      mr: 'तणाव → हार्मोन बदलतात. शरीर आणि घर जोडलेले आहेत.',
      ta: 'மன அழுத்தம் ஹார்மோன்களை மாற்றுகிறது.',
      te: 'ఒత్తిడి హార్మోన్లను మారుస్తుంది.',
      bn: 'চাপ হরমোন পরিবর্তন করে।',
      ar: 'الضغط يغير الهرمونات. جسدك ومنزلك متصلان.'
    },
    sakhiPrompt: {
      en: 'My periods are irregular and home has been very stressful.',
      hi: 'मेरा पीरियड अनियमित है और घर में बहुत तनाव रहा है।'
    }
  },
  {
    id: 'reel_child_anxiety',
    layers: ['family', 'parenting'],
    gradient: 'from-[#2e4a6f] via-[#5b8fb9] to-[#1e3348]',
    emoji: '🧒',
    title: {
      en: 'Child\'s anxiety — mother\'s mirror',
      hi: 'बच्चे की चिंता — माँ का आईना',
      mr: 'मुलाची चिंता — आईचे प्रतिबिंब',
      ta: 'குழந்தையின் கவலை — தாயின் கண்ணாடி',
      te: 'పిల్లల ఆందోళన — తల్లి అద్దం',
      bn: 'সন্তানের উদ্বেগ — মায়ের আয়না',
      ar: 'قلق الطفل — مرآة الأم'
    },
    caption: {
      en: 'Children absorb what we hide. Healing the home heals the child — and you.',
      hi: 'बच्चे वो सोख लेते हैं जो हम छुपाते हैं। घर ठीक हो तो बच्चा और आप — दोनों ठीक होते हैं।',
      mr: 'मुले आपण लपवतो ते शोषतात. घर बरे झाले की मूल आणि तुम्ही दोघे बरे.',
      ta: 'குழந்தைகள் நாம் மறைப்பதை உறிஞ்சுகிறார்கள்.',
      te: 'పిల్లలు మనం దాచేది శోషిస్తారు.',
      bn: 'শিশুরা আমরা যা লুকাই তা শোষে।',
      ar: 'الأطفال يمتصون ما نخفيه. شفاء البيت يشفي الطفل وأنت.'
    },
    sakhiPrompt: {
      en: 'My child seems anxious and I worry it is because of me.',
      hi: 'मेरा बच्चा चिंतित लगता है और मुझे लगता है यह मेरी वजह से है।'
    }
  },
  {
    id: 'reel_finance_stress',
    layers: ['family', 'stress'],
    gradient: 'from-[#3d3d1f] via-[#6b6b3a] to-[#262618]',
    emoji: '💰',
    title: {
      en: 'Money fights at night, pain by morning',
      hi: 'रात को पैसों पर झगड़ा, सुबह शरीर में दर्द',
      mr: 'रात्री पैशांचा वाद, सकाळी शरीरदुखी',
      ta: 'இரவில் பண வாதம், காலையில் வலி',
      te: 'రాత్రి డబు గొడవ, ఉదయం నొప్పి',
      bn: 'রাতে টাকার ঝগড়া, সকালে ব্যথা',
      ar: 'شجار المال ليلاً، ألم صباحاً'
    },
    caption: {
      en: 'Financial stress is emotional stress. It lives in the kitchen, the bedroom, and your nervous system.',
      hi: 'आर्थिक तनाव भावनात्मक तनाव है। यह रसोई, बेडरूम और आपकी नसों में रहता है।',
      mr: 'आर्थिक तणाव भावनिक तणाव आहे. तो संपूर्ण घरात राहतो.',
      ta: 'நிதி மன அழுத்தம் உணர்ச்சி மன அழுத்தம்.',
      te: 'ఆర్థిక ఒత్తిడి భావోద్వేగ ఒత్తిడి.',
      bn: 'আর্থিক চাপ আবেগের চাপ।',
      ar: 'الضغط المالي ضغط عاطفي. يعيش في كل البيت.'
    },
    sakhiPrompt: {
      en: 'Money stress is affecting our relationship and my sleep.',
      hi: 'पैसों का तनाव हमारे रिश्ते और नींद पर असर डाल रहा है।'
    }
  },
  {
    id: 'reel_domestic_tension',
    layers: ['family', 'domestic'],
    gradient: 'from-[#3d1f2e] via-[#7c2d4a] to-[#2a1520]',
    emoji: '🏠',
    title: {
      en: 'Domestic tension lives in silence',
      hi: 'घरेलू तनाव अक्सर खामोशी में रहता है',
      mr: 'घरगुती तणाव अनेकदा शांतपणे राहतो',
      ta: 'குடும்ப பதற்றம் அமைதியில் வாழ்கிறது',
      te: 'గృహ ఒత్తిడి నిశ్శబ్దంలో ఉంటుంది',
      bn: 'পারিবারিক উত্তেজনা নীরবতায় থাকে',
      ar: 'التوتر المنزلي يعيش في الصمت'
    },
    caption: {
      en: 'Criticism, control, money fights, or in-law pressure — your body feels it before you find words. Understanding is the first step to healing.',
      hi: 'आलोचना, नियंत्रण, पैसा, ससुराल — शब्दों से पहले शरीर महसूस करता है। समझना ठीक होने का पहला कदम है।',
      mr: 'टीका, नियंत्रण, पैसा, सासू-सासरे — शब्दांपूर्वी शरीर जाणवते. समज हे बरे होण्याचे पहिले पाऊल आहे.',
      ta: 'விமர்சனம், கட்டுப்பாடு, பணம் — வார்த்தைகளுக்கு முன் உடல் உணரும்.',
      te: 'విమర్శ, నియంత్రణ, డబ్బు — మాటలకు ముందు శరీరం అనుభవిస్తుంది.',
      bn: 'সমালোচনা, নিয়ন্ত্রণ, টাকা — কথার আগে শরীর অনুভব করে।',
      ar: 'النقد والسيطرة والمال — جسدك يشعر قبل الكلمات.'
    },
    sakhiPrompt: {
      en: 'There is tension at home and I do not know how to talk about it.',
      hi: 'घर में तनाव है और मुझे नहीं पता कैसे बात करूँ।'
    }
  },
  {
    id: 'reel_self_care',
    layers: ['emotional', 'women'],
    gradient: 'from-[#6b3a5c] via-[#c97b9b] to-[#4a2540]',
    emoji: '🪷',
    title: {
      en: 'Self-care is not selfish — it is family care',
      hi: 'खुद की देखभाल स्वार्थ नहीं — परिवार की देखभाल है',
      mr: 'स्व-काळजी स्वार्थ नाही — कुटुंबाची काळजी आहे',
      ta: 'சுய பராமரிப்பு சுயநலம் அல்ல — குடும்ப பராமரிப்பு',
      te: 'స్వీయ సంరక్షణ స్వార్థం కాదు — కుటుంబ సంరక్షణ',
      bn: 'নিজের যত্ন স্বার্থপর নয় — পরিবারের যত্ন',
      ar: 'العناية الذاتية ليست أنانية — إنها عناية بالعائلة'
    },
    caption: {
      en: 'When you rest, the whole home breathes easier. You are the emotional climate of your family.',
      hi: 'जब आप आराम करती हैं, पूरा घर साँस लेता है। आप अपने परिवार का मौसम हैं।',
      mr: 'तुम्ही विश्रांती घेतल्यावर संपूर्ण घर श्वास घेते. तुम्ही कुटुंबाचे हवामान आहात.',
      ta: 'நீங்கள் ஓய்வெடுக்கும்போது வீடு மூச்சு விடுகிறது.',
      te: 'మీరు విశ్రాంతి తీసుకున్నప్పుడు ఇల్లు శ్వాస తీసుకుంటుంది.',
      bn: 'আপনি বিশ্রাম নিলে ঘর শ্বাস নেয়।',
      ar: 'عندما ترتاحين، البيت كله يتنفس بسهولة.'
    },
    sakhiPrompt: {
      en: 'I feel guilty when I take time for myself.',
      hi: 'जब मैं अपने लिए समय निकालती हूँ तो अपराधबोध होता है।'
    }
  }
];

export const getReelField = (reel, field, langCode) => {
  const block = reel[field];
  if (!block) return '';
  return block[langCode] || block.hi || block.en || '';
};

export const getTodayReel = () => {
  const dayIndex = new Date().getDate() % reelsList.length;
  return reelsList[dayIndex];
};
