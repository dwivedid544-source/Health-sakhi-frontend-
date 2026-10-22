import React from 'react';
import { ChevronRight } from 'lucide-react';
import { getLocalizedInsight } from '../../data/insightChains';

const InsightChain = ({ chain, langCode }) => {
  if (!chain?.nodes?.length) return null;

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-min px-1">
        {chain.nodes.map((node, i) => (
          <React.Fragment key={node.id}>
            <div className="flex flex-col items-center shrink-0 w-[100px] sm:w-[120px]">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-rose-100 shadow-sm flex items-center justify-center text-2xl mb-2">
                {node.emoji}
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold text-[#15192c] text-center leading-tight">
                {getLocalizedInsight(node.label, langCode)}
              </p>
            </div>
            {i < chain.nodes.length - 1 && (
              <ChevronRight size={18} className="text-[#ff69b4] shrink-0 opacity-60" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default InsightChain;

