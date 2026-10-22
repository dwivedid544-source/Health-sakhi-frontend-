/**
 * useFeatureAccess — Health Sakhi Feature Gating Hook
 *
 * Plan Tiers:
 *  - FREE  (Free Sakhi)          → Books (5 only), Community, FAQ, ToDo, Budget, Mental, Period
 *  - BASIC (Basic Sakhi ₹499)    → + All Books, AI Chat, Certificate  |  Partner & AskSakhi still locked
 *  - PREMIUM (Premium Sakhi)     → Everything unlocked
 *
 * Usage:
 *   const { canAccess, planTier, isLocked } = useFeatureAccess('aiChat');
 */

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

// ── Plan Slug/Name → Tier Mapping ─────────────────────────────────────────────
const getPlanTier = (planBadge) => {
  const badge = (planBadge || '').toLowerCase().trim();

  // Premium tier detection
  if (
    badge.includes('premium') ||
    badge.includes('pro') ||
    badge.includes('plus') ||
    badge.includes('elite') ||
    badge.includes('partner')
  ) {
    return 'premium';
  }

  // Basic tier detection
  if (badge.includes('basic')) {
    return 'basic';
  }

  // Default: free tier
  return 'free';
};

// ── Feature Access Matrix ──────────────────────────────────────────────────────
// true  = feature is accessible
// false = feature is locked (show LockedFeature component)
const FEATURE_MATRIX = {
  free: {
    home: true,
    books: true,          // Only 5 books (limit enforced by BookScreen separately)
    booksAll: false,      // Unlimited access
    community: true,
    certificate: false,
    partnerSakhi: false,
    faq: true,
    askSakhi: false,
    aiChat: false,
    todo: true,
    budget: true,
    mentalHealth: true,
    period: true,
    rewards: true,
    sessions: false,
  },
  basic: {
    home: true,
    books: true,
    booksAll: true,       // All books unlocked
    community: true,
    certificate: true,    // Unlocked in basic
    partnerSakhi: false,  // Still locked
    faq: true,
    askSakhi: true,       // Unlocked in basic & premium
    aiChat: true,         // Unlocked in basic
    todo: true,
    budget: true,
    mentalHealth: true,
    period: true,
    rewards: true,
    sessions: false,
  },
  premium: {
    home: true,
    books: true,
    booksAll: true,
    community: true,
    certificate: true,
    partnerSakhi: true,
    faq: true,
    askSakhi: true,
    aiChat: true,
    todo: true,
    budget: true,
    mentalHealth: true,
    period: true,
    rewards: true,
    sessions: true,
  },
};

// ── Book Limits per tier ───────────────────────────────────────────────────────
export const BOOK_LIMIT = {
  free: 5,
  basic: Infinity,
  premium: Infinity,
};

// ── Plan Display Labels ────────────────────────────────────────────────────────
export const PLAN_LABELS = {
  free: 'Free Sakhi',
  basic: 'Basic Sakhi',
  premium: 'Premium Sakhi',
};

// ── Main Hook ─────────────────────────────────────────────────────────────────
export const useFeatureAccess = (featureName) => {
  const { user } = useAuth();

  const planTier = useMemo(() => {
    // First check AuthContext user object
    let badge = user?.planBadge || '';

    // Fallback: check sessionStorage (compatibility with existing code)
    if (!badge) {
      try {
        const stored = sessionStorage.getItem('hs_current_member');
        if (stored) {
          const parsed = JSON.parse(stored);
          badge = parsed?.plan || '';
        }
      } catch (e) {
        // silent fail
      }
    }

    return getPlanTier(badge);
  }, [user]);

  const canAccess = useMemo(() => {
    if (!featureName) return true;
    const tierMatrix = FEATURE_MATRIX[planTier] || FEATURE_MATRIX.free;
    return tierMatrix[featureName] ?? true; // Unknown features = accessible by default
  }, [featureName, planTier]);

  const isLocked = !canAccess;

  const bookLimit = useMemo(() => BOOK_LIMIT[planTier] ?? 5, [planTier]);

  const planLabel = PLAN_LABELS[planTier] || 'Free Sakhi';

  const isFree = planTier === 'free';
  const isBasic = planTier === 'basic';
  const isPremium = planTier === 'premium';

  return {
    canAccess,
    isLocked,
    planTier,
    planLabel,
    bookLimit,
    isFree,
    isBasic,
    isPremium,
  };
};

// ── Utility: Get tier from a raw plan badge string (for non-hook contexts) ────
export const getPlanTierFromBadge = (planBadge) => getPlanTier(planBadge);

export default useFeatureAccess;
