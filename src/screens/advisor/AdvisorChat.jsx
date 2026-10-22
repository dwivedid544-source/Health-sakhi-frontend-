import React from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Image, Paperclip, MoreVertical, Search, Phone, Video, Smile, ShieldCheck, User, Check, CheckCheck, MessageSquare, CheckCircle } from 'lucide-react';
import { appendAdvisorMessage, getAdvisorThreads, logCallEvent, markThreadRead, upsertAdvisorThread } from '../../data/advisorFlow';
import { useLanguage } from '../../context/LanguageContext';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const AdvisorChat = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const advisorName = user?.fullName || 'Your Health Advisor';
  
  const [sisters, setSisters] = React.useState([]);
  const [activeChat, setActiveChat] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [appointments, setAppointments] = React.useState([]);

  const fetchAppointments = async () => {
    try {
      const res = await axiosClient.get('/appointments');
      const data = res.data?.appointments || res.data || [];
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching appointments in chat:", err);
    }
  };

  React.useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const getActiveAppointment = () => {
    if (!activeChat || !appointments.length) return null;

    const now = new Date();
    const localYear = now.getFullYear();
    const localMonth = String(now.getMonth() + 1).padStart(2, '0');
    const localDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${localYear}-${localMonth}-${localDay}`;
    
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    return appointments.find(apt => {
      if (apt.participantUserId !== activeChat.id) return false;
      if (apt.status !== 'scheduled') return false;

      const d = new Date(apt.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const aptDateStr = `${year}-${month}-${day}`;
      
      if (aptDateStr !== todayStr) return false;

      if (!apt.start_time || !apt.end_time) return false;

      const [sh, sm] = apt.start_time.split(':').map(Number);
      const [eh, em] = apt.end_time.split(':').map(Number);
      const startMinutes = sh * 60 + sm;
      const endMinutes = eh * 60 + em;

      return nowMinutes >= (startMinutes - 5) && nowMinutes <= endMinutes;
    });
  };

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/chats/threads');
      if (res.data?.threads) {
        setSisters(res.data.threads);
        
        if (location.state?.user) {
          const found = res.data.threads.find(t => t.id === location.state.user.id || t.memberEmail === location.state.user.email);
          if (found) {
            setActiveChat(found);
          } else {
            const temp = {
              id: location.state.user.id,
              memberName: location.state.user.name,
              memberEmail: location.state.user.email,
              lastMsg: 'Session booked. Ready to chat.',
              time: 'now',
              unread: 0,
              active: true
            };
            setSisters(prev => [temp, ...prev]);
            setActiveChat(temp);
          }
        } else if (res.data.threads.length > 0 && !activeChat) {
          setActiveChat(res.data.threads[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching threads:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!activeChat) return;
    try {
      const res = await axiosClient.get(`/chats/messages?partnerId=${activeChat.id}`);
      if (res.data?.messages) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  React.useEffect(() => {
    fetchThreads();
  }, [location.state?.user]);

  React.useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeChat]);

  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);
  const fileInputRef = React.useRef(null);
  const imageInputRef = React.useRef(null);
  const messagesEndRef = React.useRef(null);

  const handleCall = async () => {
    if (!activeChat) return;
    const activeApt = getActiveAppointment();
    if (!activeApt) return;
    
    const inviteText = `${advisorName} has invited you to a voice call. Join here: ${activeApt.meeting_link}`;
    try {
      const res = await axiosClient.post('/chats/messages', {
        receiverId: activeChat.id,
        text: inviteText
      });
      if (res.data?.success) {
        fetchMessages();
      }
    } catch (err) {
      console.error("Error sending voice call invite:", err);
    }
    window.open(activeApt.meeting_link, '_blank');
  };

  const handleVideoCall = async () => {
    if (!activeChat) return;
    const activeApt = getActiveAppointment();
    if (!activeApt) return;
    
    const inviteText = `${advisorName} has invited you to a video call. Join here: ${activeApt.meeting_link}`;
    try {
      const res = await axiosClient.post('/chats/messages', {
        receiverId: activeChat.id,
        text: inviteText
      });
      if (res.data?.success) {
        fetchMessages();
      }
    } catch (err) {
      console.error("Error sending video call invite:", err);
    }
    window.open(activeApt.meeting_link, '_blank');
  };

  const handleMore = () => {
    setShowMoreMenu((prev) => !prev);
  };

  const handleMoreAction = (action) => {
    setShowMoreMenu(false);
    if (action === 'End Chat') {
      setActiveChat(null);
      return;
    }
    window.alert(action + ' selected');
  };

  const emojiList = ['😊', '👍', '🙏', '❤️', '🔥', '🙂', '💬', '✨', '🎉', '👩‍⚕️'];

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleUploadAndSend = async (file, isImage) => {
    if (!activeChat) return;
    try {
      const formData = new FormData();
      formData.append('chatFile', file);

      // Upload file to backend
      const uploadRes = await axiosClient.post('/chats/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data?.success) {
        const fileUrl = uploadRes.data.url;
        const contentType = isImage ? 'image' : 'file';
        const text = file.name;

        const res = await axiosClient.post('/chats/messages', {
          receiverId: activeChat.id,
          text,
          contentType,
          fileUrl
        });

        if (res.data?.success) {
          fetchMessages();
          setSisters(prev => prev.map(t => t.id === activeChat.id ? { ...t, lastMsg: isImage ? '📷 Image' : '📁 Attachment', time: 'now' } : t));
        }
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      window.alert("Failed to upload file. Please try again.");
    }
  };

  const handleFileUpload = (files) => {
    if (!files?.length) return;
    handleUploadAndSend(files[0], false);
  };

  const handleImageUpload = (files) => {
    if (!files?.length) return;
    handleUploadAndSend(files[0], true);
  };

  const handleSend = async () => {
    if (!message.trim() || !activeChat) return;
    try {
      const res = await axiosClient.post('/chats/messages', {
        receiverId: activeChat.id,
        text: message.trim()
      });
      if (res.data?.success) {
        setMessage('');
        fetchMessages();
        setSisters(prev => prev.map(t => t.id === activeChat.id ? { ...t, lastMsg: message.trim(), time: 'now' } : t));
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-white">
      {/* Sidebar: Sister List */}
      <div className="w-64 border-r border-black/5 flex flex-col h-full min-h-0">
        <div className="p-4 border-b border-black/5">
           <h2 className="text-lg font-black text-slate-800 tracking-tight mb-3">{t('advisorChat.messages', 'Messages')}</h2>
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-health-green transition-colors" size={16} />
              <input type="text" placeholder={t('advisorChat.searchSisters', 'Search sisters...')} className="w-full h-10 pl-11 pr-3 bg-slate-50 border border-black/5 rounded-2xl text-[11px] font-bold outline-none focus:bg-white focus:border-health-green transition-all" />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-black/5 chat-scrollbar">
           {sisters.map((sister) => (
             <div 
                key={sister.id}
                onClick={() => {
                  setActiveChat(sister);
                  setMessages(sister.messages || []);
                  markThreadRead(sister.id);
                }}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-all hover:bg-slate-50 relative ${activeChat?.id === sister.id ? 'bg-emerald-50/50 border-l-4 border-health-green' : ''}`}
             >
                <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 italic text-xs border border-black/5 uppercase">
                        {sister.memberName.split(' ').map(n => n[0]).join('')}
                    </div>
                    {sister.active && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-white"></div>}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="font-black text-slate-800 text-sm tracking-tight truncate">{sister.memberName}</h3>
                        <span className="text-[9px] font-black text-slate-400 uppercase">{sister.time === 'NOW' ? t('advisorChat.now', 'NOW') : sister.time}</span>
                    </div>
                        <p className={`text-xs truncate ${sister.unread > 0 ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'}`}>{sister.lastMsg}</p>
                </div>
                {sister.unread > 0 && (
                    <div className="w-5 h-5 bg-health-green text-white rounded-full flex items-center justify-center text-[9px] font-black">{sister.unread}</div>
                )}
             </div>
           ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white h-full min-h-0">
        {activeChat ? (
            <>
               {/* Chat Header */}
               <div className="sticky top-0 z-10 px-5 py-3 border-b border-black/5 flex items-center justify-between gap-3 bg-white">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-2xl bg-health-green text-white flex items-center justify-center font-black italic shadow-lg shadow-health-green/20 uppercase">
                        {activeChat.memberName.split(' ').map(n => n[0]).join('')}
                     </div>
                     <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">{activeChat.memberName}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black text-health-green uppercase tracking-widest leading-none">{t('advisorChat.onlineSecureSession', 'Online • Secure Session')}</span>
                        </div>
                     </div>
                  </div>
                   <div className="relative flex items-center gap-4">
                     <button onClick={handleMore} type="button" className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-all">
                       <MoreVertical size={20}/>
                     </button>
                     {showMoreMenu && (
                       <div className="absolute right-0 top-full mt-3 w-44 rounded-3xl bg-white border border-black/5 shadow-xl py-2 z-20">
                         {[ 'Mute Notifications', 'End Chat'].map((option) => (
                           <button
                             key={option}
                             type="button"
                             onClick={() => handleMoreAction(option)}
                             className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                           >
                             {option}
                           </button>
                         ))}
                       </div>
                     )}
                  </div>
               </div>

               {/* Messages */}
               <div className="flex-1 min-h-0 overflow-y-auto p-5 pb-28 space-y-6 bg-slate-50/30 chat-scrollbar">
                  <div className="flex justify-center mb-6">
                    <div className="px-4 py-2 bg-white/50 backdrop-blur rounded-full border border-black/5 text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 shadow-sm">
                        <ShieldCheck size={12} className="text-health-green" />
                        {t('advisorChat.endToEndEncrypted', 'End-to-end Encrypted by HealthSakhi Clinical Core')}
                    </div>
                  </div>

                 {messages.map((msg) => {
                    const isOutgoing = msg.senderType ? msg.senderType === 'advisor' : msg.type === 'outgoing';
                    return (
                    <div key={msg.id} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 duration-300`}>
                       <div className="max-w-[65%] space-y-2">
                          <div className={`px-5 py-4 rounded-[1.75rem] shadow-sm relative ${
                            isOutgoing
                            ? 'bg-slate-900 text-white rounded-tr-none' 
                            : 'bg-white text-slate-800 rounded-tl-none border border-black/5'
                          }`}>
                            {msg.contentType === 'image' ? (
                               <div className="space-y-2">
                                 <img 
                                   src={msg.fileUrl} 
                                   alt={msg.text || "Image attachment"} 
                                   className="rounded-2xl max-w-full max-h-64 object-cover border border-black/10"
                                 />
                                 {msg.text && <p className="text-sm font-medium leading-relaxed break-words">{msg.text}</p>}
                               </div>
                             ) : msg.contentType === 'file' ? (
                               <div className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5">
                                 <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center">
                                   <Paperclip size={18} />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                   <p className="text-sm font-bold truncate">{msg.text || 'Document'}</p>
                                   <a 
                                     href={msg.fileUrl} 
                                     target="_blank" 
                                     rel="noopener noreferrer" 
                                     className="text-[11px] font-black text-emerald-500 hover:underline uppercase tracking-wider"
                                   >
                                     Download File
                                   </a>
                                 </div>
                               </div>
                             ) : (
                               <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                             )}
                            <div className={`flex items-center gap-2 mt-3 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                               <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{msg.time}</span>
                               {isOutgoing && (
                                  msg.status === 'read' ? <CheckCheck size={12} className="text-health-green" /> : <Check size={12} className="opacity-40" />
                               )}
                            </div>
                          </div>
                       </div>
                    </div>
                    );
                 })}
                  <div ref={messagesEndRef} className="h-0" />
               </div>

               {/* Input Area */}
               <div className="sticky bottom-0 z-20 px-6 py-4 bg-white border-t border-black/5">
                  <div>
                     <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-[2rem] border border-black/5 transition-all shadow-inner">
                        <div className="relative flex items-center gap-2 px-3">
                           <button
                              type="button"
                              onClick={() => setShowEmojiPicker((prev) => !prev)}
                              className="w-9 h-9 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"
                           ><Smile size={18}/></button>
                           {showEmojiPicker && (
                              <div className="absolute bottom-full left-0 mb-3 w-52 rounded-3xl bg-white border border-black/5 shadow-xl p-3 grid grid-cols-5 gap-2 z-20">
                                 {emojiList.map((emoji) => (
                                    <button
                                       key={emoji}
                                       type="button"
                                       onClick={() => handleEmojiSelect(emoji)}
                                       className="h-10 w-10 rounded-2xl flex items-center justify-center text-lg hover:bg-slate-100"
                                    >
                                       {emoji}
                                    </button>
                                 ))}
                              </div>
                           )}
                            <button
                               type="button"
                               onClick={() => fileInputRef.current?.click()}
                               className="w-9 h-9 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"
                               title="Upload document"
                            ><Paperclip size={18}/></button>
                            <button
                               type="button"
                               onClick={() => imageInputRef.current?.click()}
                               className="w-9 h-9 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"
                               title="Upload image"
                            ><Image size={18}/></button>
                          
                        </div>
                        <input 
                           type="text" 
                           value={message}
                           onChange={(e) => setMessage(e.target.value)}
                           onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                           placeholder={t('advisorChat.typeAdvice', 'Type your medical advice...')} 
                           className="flex-1 bg-transparent py-3 outline-none text-sm font-bold text-slate-800"
                        />
                        <div className="flex items-center gap-3 pr-2">
                         
                           <button 
                               onClick={handleSend}
                               className="w-14 h-14 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-black hover:scale-105 transition-all shadow-xl shadow-slate-900/10"
                           >
                               <Send size={22}/>
                           </button>
                        </div>
                     </div>
                   
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileUpload(e.target.files)} />
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
               </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-slate-50/30">
               <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center shadow-xl border border-black/5 mb-8 animate-bounce transition-all">
                  <MessageSquare size={48} className="text-health-green opacity-20" />
               </div>
               <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{t('advisorChat.selectSister', 'Select a Sister to start chatting')}</h2>
               <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm leading-relaxed">{t('advisorChat.provideSupport', 'Provide real-time clinical support and guidance to members under your care.')}</p>
            </div>
        )}
      </div>
      
      {/* Right Sidebar: Health Summary (Optional/Conditional) */}
      {activeChat && (
        <div className="w-64 bg-slate-50 border-l border-black/5 flex flex-col h-full min-h-0 animate-in slide-in-from-right duration-500">
           <div className="p-5 border-b border-black/5 bg-white text-center">
              <div className="w-20 h-20 rounded-[1.75rem] bg-slate-50 flex items-center justify-center font-black text-slate-400 border border-black/5 mx-auto mb-5 text-xl italic shadow-inner">
                 {activeChat.memberName.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{activeChat.memberName}</h3>
              <p className="text-[10px] font-black text-health-green uppercase tracking-[0.2em] mt-2">{t('advisorChat.healthPassport', 'Health Passport v2.1')}</p>
           </div>
           
           <div className="flex-1 overflow-y-auto p-8 space-y-10 chat-scrollbar">
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('advisorChat.activeFocus', 'Active Focus')}</h4>
                 <div className="p-4 bg-white rounded-2xl border border-black/5 shadow-sm">
                    <p className="text-xs font-bold text-slate-800">{t('advisorChat.pcodManagement', 'PCOD Management & Hormonal Balance')}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('advisorChat.medicalNotes', 'Medical Notes')}</h4>
                 <div className="space-y-3">
                    {[t('advisorChat.followingLowGiDiet', 'Following low-GI diet'), t('advisorChat.regularEveningWalks', 'Regular evening walks'), t('advisorChat.syncingCycleData', 'Syncing cycle data')].map((note, i) => (
                       <div key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                          <CheckCircle size={14} className="text-health-green" />
                          {note}
                       </div>
                    ))}
                 </div>
              </div>

              <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                 <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4">{t('advisorChat.quickStats', 'Quick Stats')}</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <p className="text-2xl font-black italic">92%</p>
                       <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">{t('advisorChat.adherence', 'Adherence')}</p>
                    </div>
                    <div>
                       <p className="text-2xl font-black italic">12</p>
                       <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">{t('advisorChat.sessions', 'Sessions')}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdvisorChat;
