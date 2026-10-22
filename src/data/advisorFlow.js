const CHAT_THREADS_KEY = 'hs_advisor_chat_threads';
const CALL_EVENTS_KEY = 'hs_advisor_call_events';
const BOOKING_KEY = 'hs_booked_sessions';
const APPROVED_MEMBERS_KEY = 'hs_member_users';

const safeRead = (key, fallback = []) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
};

const safeWrite = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getAdvisorThreads = () => safeRead(CHAT_THREADS_KEY);

const titleCase = (value = '') =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const memberNameFromEmail = (email = 'member@gmail.com') => {
  const local = email.split('@')[0] || 'member';
  return titleCase(local.replace(/[._-]/g, ' '));
};

export const upsertAdvisorThread = ({ memberName, memberEmail, advisor }) => {
  const threads = getAdvisorThreads();
  const normalizedName = titleCase(memberName || memberNameFromEmail(memberEmail));
  const existing = threads.find((t) => t.memberEmail === memberEmail && t.advisor === advisor);
  if (existing) {
    if (existing.memberName !== normalizedName) {
      const updatedThreads = threads.map((thread) =>
        thread.id === existing.id ? { ...thread, memberName: normalizedName } : thread
      );
      safeWrite(CHAT_THREADS_KEY, updatedThreads);
      return updatedThreads.find((t) => t.id === existing.id);
    }
    return existing;
  }

  const newThread = {
    id: `TH-${Date.now()}`,
    memberName: normalizedName,
    memberEmail,
    advisor,
    lastMsg: 'Session booked. Ready to chat.',
    time: 'now',
    unread: 0,
    active: true,
    messages: [
      {
        id: `MSG-${Date.now()}`,
        sender: 'system',
        text: `${normalizedName} booked a session with ${advisor}.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'system',
        senderType: 'system'
      }
    ]
  };

  safeWrite(CHAT_THREADS_KEY, [newThread, ...threads]);
  return newThread;
};

export const appendAdvisorMessage = ({ threadId, senderType, senderName, text }) => {
  const threads = getAdvisorThreads();
  const updated = threads.map((thread) => {
    if (thread.id !== threadId) return thread;
    const nextMessage = {
      id: `MSG-${Date.now()}`,
      sender: senderName,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: senderType === 'advisor' ? 'outgoing' : 'incoming',
      status: senderType === 'advisor' ? 'sent' : undefined,
      senderType
    };
    return {
      ...thread,
      lastMsg: text,
      time: 'now',
      unread: senderType === 'member' ? (thread.unread || 0) + 1 : 0,
      messages: [...(thread.messages || []), nextMessage]
    };
  });
  safeWrite(CHAT_THREADS_KEY, updated);
  return updated.find((t) => t.id === threadId);
};

export const markThreadRead = (threadId) => {
  const threads = getAdvisorThreads();
  safeWrite(
    CHAT_THREADS_KEY,
    threads.map((thread) => (thread.id === threadId ? { ...thread, unread: 0 } : thread))
  );
};

export const logCallEvent = ({ memberName, advisor, source }) => {
  const events = safeRead(CALL_EVENTS_KEY);
  const event = {
    id: `CALL-${Date.now()}`,
    memberName,
    advisor,
    source,
    time: new Date().toISOString(),
    status: 'incoming'
  };
  safeWrite(CALL_EVENTS_KEY, [event, ...events].slice(0, 50));
  return event;
};

export const getCallEvents = () => safeRead(CALL_EVENTS_KEY);

export const updateBookedSessionStatus = (sessionId, status) => {
  const sessions = safeRead(BOOKING_KEY);
  const updated = sessions.map((s) => (s.id === sessionId ? { ...s, status } : s));
  safeWrite(BOOKING_KEY, updated);
  return updated;
};

export const getCurrentMemberProfile = () => {
  try {
    const parsed = JSON.parse(sessionStorage.getItem('hs_current_member') || '{}');
    const email = parsed.email || 'member@gmail.com';
    return {
      name: titleCase(parsed.name || memberNameFromEmail(email)),
      email
    };
  } catch (error) {
    return { name: 'Member', email: 'member@gmail.com' };
  }
};

export const getAssignedMembersForAdvisor = (advisorName = 'Dr. Sakshi Sharma') => {
  const approvedMembers = safeRead(APPROVED_MEMBERS_KEY);
  const bookings = safeRead(BOOKING_KEY);
  const threads = getAdvisorThreads().filter((t) => t.advisor === advisorName);

  const byEmail = new Map();

  approvedMembers.forEach((member) => {
    byEmail.set(member.email, {
      id: `MBR-${member.id || Date.now()}`,
      name: titleCase(member.name || memberNameFromEmail(member.email)),
      email: member.email,
      plan: member.plan || 'Free Sakhi',
      status: member.status || 'Active',
      condition: 'General Wellness',
      adherence: Number(member.progress || 70)
    });
  });

  threads.forEach((thread) => {
    const existing = byEmail.get(thread.memberEmail);
    byEmail.set(thread.memberEmail, {
      ...(existing || {}),
      id: existing?.id || thread.id,
      name: titleCase(thread.memberName || memberNameFromEmail(thread.memberEmail)),
      email: thread.memberEmail,
      status: existing?.status || 'Active',
      condition: existing?.condition || 'Consultation Follow-up',
      adherence: existing?.adherence || 78,
      lastMessage: thread.lastMsg || 'Ready to chat'
    });
  });

  bookings
    .filter((booking) => booking.advisor === advisorName)
    .forEach((booking) => {
      const email = booking.memberEmail || `${(booking.memberName || 'member').toLowerCase().replace(/\s+/g, '.')}@member.healthsakhi`;
      const existing = byEmail.get(email);
      byEmail.set(email, {
        ...(existing || {}),
        id: existing?.id || booking.id,
        name: titleCase(booking.memberName || memberNameFromEmail(email)),
        email,
        status: booking.status === 'Confirmed' ? 'Active' : 'Follow-up',
        condition: booking.topic || existing?.condition || 'Wellness Session',
        adherence: existing?.adherence || 82,
        nextSession: `${booking.date || ''} ${booking.slot || ''}`.trim()
      });
    });

  return Array.from(byEmail.values());
};
