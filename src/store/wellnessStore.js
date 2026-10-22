import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_LANGUAGE } from '../data/languages';

export const useWellnessStore = create(
  persist(
    (set, get) => ({
      language: DEFAULT_LANGUAGE,
      familyStress: null,
      lastMood: null,
      savedReelIds: [],
      watchedReelIds: [],
      familyProfileType: null,
      sakhiMode: 'women',
      lastCheckInDate: null,
      dailyEmotional: { stress: null, burnout: null, anxiety: null },
      relationshipHealth: { communication: null, connection: null, conflict: null, support: null },
      journalEntries: [],
      familyGoals: [],
      gratitudeNotes: [],

      setFamilyProfileType: (type) => set({ familyProfileType: type }),
      setSakhiMode: (mode) => set({ sakhiMode: mode }),

      setDailyEmotional: (patch) =>
        set({ dailyEmotional: { ...get().dailyEmotional, ...patch } }),

      setRelationshipHealth: (patch) =>
        set({ relationshipHealth: { ...get().relationshipHealth, ...patch } }),

      addJournalEntry: (text, moodTag = '') => {
        const entry = { id: Date.now(), text, moodTag, date: new Date().toISOString() };
        set({ journalEntries: [entry, ...get().journalEntries].slice(0, 50) });
      },

      addFamilyGoal: (title) => {
        if (!title?.trim()) return;
        set({
          familyGoals: [
            { id: Date.now(), title: title.trim(), done: false },
            ...get().familyGoals
          ].slice(0, 20)
        });
      },

      toggleFamilyGoal: (id) =>
        set({
          familyGoals: get().familyGoals.map((g) =>
            g.id === id ? { ...g, done: !g.done } : g
          )
        }),

      addGratitude: (text) => {
        if (!text?.trim()) return;
        set({
          gratitudeNotes: [
            { id: Date.now(), text: text.trim(), date: new Date().toISOString() },
            ...get().gratitudeNotes
          ].slice(0, 30)
        });
      },

      markCheckInToday: () =>
        set({ lastCheckInDate: new Date().toISOString().slice(0, 10) }),

      setLanguage: (lang) => set({ language: lang }),

      setFamilyStress: (level) => set({ familyStress: level }),

      setLastMood: (mood) => set({ lastMood: mood }),

      markReelWatched: (id) => {
        const ids = get().watchedReelIds;
        if (ids.includes(id)) return;
        set({ watchedReelIds: [...ids, id] });
      },

      toggleSaveReel: (id) => {
        const saved = get().savedReelIds;
        set({
          savedReelIds: saved.includes(id)
            ? saved.filter((x) => x !== id)
            : [...saved, id]
        });
      },

      isReelSaved: (id) => get().savedReelIds.includes(id)
    }),
    {
      name: 'hs_wellness_store',
      partialize: (s) => ({
        language: s.language,
        familyStress: s.familyStress,
        lastMood: s.lastMood,
        savedReelIds: s.savedReelIds,
        watchedReelIds: s.watchedReelIds,
        familyProfileType: s.familyProfileType,
        sakhiMode: s.sakhiMode,
        lastCheckInDate: s.lastCheckInDate,
        dailyEmotional: s.dailyEmotional,
        relationshipHealth: s.relationshipHealth,
        journalEntries: s.journalEntries,
        familyGoals: s.familyGoals,
        gratitudeNotes: s.gratitudeNotes
      })
    }
  )
);
