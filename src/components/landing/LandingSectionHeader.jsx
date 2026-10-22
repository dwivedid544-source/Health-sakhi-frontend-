import React from 'react';
import { motion } from 'framer-motion';

const LandingSectionHeader = ({ badge, title, subtitle, accent = 'pink', id }) => (
  <motion.div
    id={id}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.6 }}
    className="text-center mb-10 sm:mb-14 space-y-3 max-w-3xl mx-auto px-2"
  >
    {badge && (
      <span className="inline-block px-4 py-1.5 rounded-full bg-pink-50/90 border border-pink-100 text-[10px] sm:text-xs font-black text-[#E91E63] uppercase tracking-[0.2em]">
        {badge}
      </span>
    )}
    <h2 className="text-[#4B1E5A] font-serif font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight">
      {title}
    </h2>
    {subtitle && (
      <p className="text-sm sm:text-base text-[#4B1E5A]/65 font-medium leading-relaxed max-w-2xl mx-auto">
        {subtitle}
      </p>
    )}
    <motion.div
      className={`h-1 w-16 mx-auto rounded-full bg-gradient-to-r ${
        accent === 'gold' ? 'from-[#C69214] to-amber-300' : 'from-[#E91E63] to-[#FF5E9B]'
      }`}
    />
  </motion.div>
);

export default LandingSectionHeader;
