import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LandingSectionHeader from './LandingSectionHeader';
import { MISSION_PILLARS, TRUST_BADGES } from '../../data/brand';
import {
  invisibleLoadCards,
  familyWellnessCards,
  symptomStressCards,
  healingHomePillars,
  emotionalTestimonials,
  wellnessPrograms,
  emergencyResources
} from '../../data/landingContent';

const cardMotion = (i) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, delay: i * 0.06 }
});

const FamilyWellnessLandingSections = ({ navigate }) => {
  const [activeSymptom, setActiveSymptom] = useState(0);

  return (
    <>
      {/* Combined Mission & Insights Section */}
      <section id="mission" className="relative w-full pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-10 overflow-hidden">
        {/* Background Decorative Element */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
        >
          <motion.div
            className="absolute top-0 right-0 w-[min(100%,600px)] h-[600px] bg-gradient-to-bl from-[#E91E63]/5 to-transparent rounded-full blur-[100px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </motion.div>

        <div className="w-full max-w-[1280px] mx-auto relative z-10 space-y-24">

          {/* 1. Our Mission */}
          <div className="space-y-12">
            <LandingSectionHeader
              badge="Our Mission"
              title="A safe healing home for women & families"
              subtitle="health sakhi is no longer only a women's health app — it is a complete family wellness ecosystem."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {MISSION_PILLARS.map((p, i) => (
                <motion.div
                  key={p.title}
                  {...cardMotion(i)}
                  className="p-8 rounded-[2.5rem] bg-white/70 backdrop-blur-md border border-white/80 shadow-sm hover:shadow-[0_20px_40px_rgba(233,30,99,0.08)] hover:-translate-y-1 transition-all duration-400"
                >
                  <span className="text-4xl mb-4 block">{p.emoji}</span>
                  <h3 className="font-black text-[#4B1E5A] text-base sm:text-lg mb-3">{p.title}</h3>
                  <p className="text-[#4B1E5A]/65 text-sm font-medium leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 2. Invisible Load */}
          <div className="space-y-12">
            <LandingSectionHeader
              badge="The invisible load"
              title="The weight women carry in silence"
              subtitle="This load is real. Naming it is the first step toward healing."
            />
            <motion.div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-5 gap-4">
              {invisibleLoadCards.map((c, i) => (
                <motion.div
                  key={c.title}
                  {...cardMotion(i + 3)}
                  className="p-6 rounded-[2rem] bg-white/60 backdrop-blur-md border border-rose-100/50 hover:bg-white transition-colors text-center sm:text-left h-full group"
                >
                  <span className="text-3xl block mb-4 group-hover:scale-110 transition-transform">{c.emoji}</span>
                  <h3 className="font-black text-[#4B1E5A] text-sm mb-2">{c.title}</h3>
                  <p className="text-[11px] text-[#4B1E5A]/60 font-medium leading-relaxed">{c.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>


        </div>
      </section>




    </>
  );
};

export default FamilyWellnessLandingSections;
