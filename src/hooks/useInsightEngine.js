import { useMemo } from 'react';
import { useWellnessStore } from '../store/wellnessStore';
import { insightChains } from '../data/insightChains';

export const useInsightEngine = () => {
  const familyStress = useWellnessStore((s) => s.familyStress);
  const lastMood = useWellnessStore((s) => s.lastMood);

  const activeChain = useMemo(() => {
    const ctx = { familyStress, lastMood };
    const matched = insightChains
      .filter((c) => c.match(ctx))
      .sort((a, b) => b.priority - a.priority);
    return matched[0] || insightChains[insightChains.length - 1];
  }, [familyStress, lastMood]);

  const hasPersonalData = Boolean(familyStress || lastMood);

  return { activeChain, hasPersonalData, familyStress, lastMood };
};
