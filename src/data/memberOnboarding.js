export const PENDING_SIGNUPS_KEY = 'hs_member_signups_pending';
export const APPROVED_MEMBERS_KEY = 'hs_member_users';
export const DEFAULT_APPROVED_MEMBERS = [
  {
    id: 1,
    name: 'Member User',
    phone: '+91 98XXX XXX29',
    email: 'member@gmail.com',
    password: 'member123',
    plan: 'HealthSakhi Family Wellness Premium',
    status: 'Active',
    progress: 65,
    active: '2h ago',
    role: 'Member'
  }
];

export const readJsonArray = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

export const writeJsonArray = (key, data) => {
  localStorage.setItem(key, JSON.stringify(Array.isArray(data) ? data : []));
};

export const getApprovedMembers = () => {
  const saved = readJsonArray(APPROVED_MEMBERS_KEY);
  if (saved.length === 0) {
    writeJsonArray(APPROVED_MEMBERS_KEY, DEFAULT_APPROVED_MEMBERS);
    return DEFAULT_APPROVED_MEMBERS;
  }

  const hasDefaultMember = saved.some(
    (member) => member.email?.toLowerCase() === 'member@gmail.com'
  );
  if (hasDefaultMember) return saved;

  const merged = [DEFAULT_APPROVED_MEMBERS[0], ...saved];
  writeJsonArray(APPROVED_MEMBERS_KEY, merged);
  return merged;
};
