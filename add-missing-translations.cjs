const fs = require('fs');

const missingKeys = {
  nav: {
    adminLabel: "Admin Console",
    adminSubtitle: "System Administrator",
    advisorLabel: "Advisor Portal",
    advisorSubtitle: "Wellness Advisor",
    memberLabel: "Member Portal",
    memberSubtitle: "Wellness Member",
    partnerLabel: "Partner Portal",
    partnerSubtitle: "Affiliate Partner",
    foodSakhi: "Food Sakhi",
    sleepSakhi: "Sleep Sakhi"
  },
  dashboard: {
    affirmations: "Affirmations",
    books: "Books",
    defaultAffirmation: "I am strong, capable, and worthy of wellness.",
    familyWellnessJourney: "Family Wellness Journey",
    markAllRead: "Mark all as read",
    noNotifications: "No new notifications",
    notifMessages: "You have new messages.",
    notifMessagesTime: "Just now",
    notifPcod: "New wellness module added: Navigating PCOD.",
    notifPcodTime: "2h ago",
    notifSession: "Your session with Dr. Sakshi is in 30 mins.",
    notifSessionTime: "30m ago",
    notifUpdate: "System update scheduled for midnight.",
    notifUpdateTime: "1h ago",
    notifications: "Notifications"
  },
  sessions: {
    apptId: "Appt ID",
    cancel: "Cancel",
    processing: "Processing...",
    start_chat: "Start Chat",
    today: "Today",
    tomorrow: "Tomorrow"
  }
};

const files = ['en', 'hi', 'mr'];

for (const lang of files) {
  const path = `./src/data/i18n/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));

  // Ensure namespaces exist
  if (!data.nav) data.nav = {};
  if (!data.dashboard) data.dashboard = {};
  if (!data.sessions) data.sessions = {};

  // Add missing keys
  for (const [namespace, keys] of Object.entries(missingKeys)) {
    for (const [key, value] of Object.entries(keys)) {
      if (data[namespace][key] === undefined) {
        data[namespace][key] = value;
      }
    }
  }

  // Handle special case with trailing dots like 'dashboard.affirmations.'
  // The script reported 'dashboard.affirmations.', let's ensure it's not a typo in code
  // Oh, wait, 'dashboard.affirmations.' is a weird key. Let's see if the UI expects it.

  fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${lang}.json`);
}
