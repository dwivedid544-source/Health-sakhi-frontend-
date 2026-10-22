import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wind, Brain, Flame, CloudRain, Heart, Sparkles } from 'lucide-react';

const TOPICS = [
  { title: 'Stress management', desc: 'Calm your nervous system daily', icon: Wind, path: '/app/books' },
  { title: 'Anxiety support', desc: 'Gentle tools when worry rises', icon: Brain, path: '/app/mental-health' },
  { title: 'Burnout education', desc: 'Restore when you feel empty', icon: Flame, path: '/app/family/burnout' },
  { title: 'Emotional overload', desc: 'When feelings feel too heavy', icon: CloudRain, path: '/app/awareness' },
  { title: 'Loneliness support', desc: 'You deserve connection', icon: Heart, path: '/app/reels' },
  { title: 'Self-care routines', desc: 'Small rituals, big healing', icon: Sparkles, path: '/app/affirmation' }
];

const WellnessCenterScreen = () => {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto pb-12">
      <header className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] mb-2">Mental wellness center</p>
        <h1 className="text-2xl sm:text-3xl font-black text-[#15192c] mb-2">A calm space for your mind</h1>
        <p className="text-sm text-[#9A8A8E]">Guided support — soft, safe, and without judgment.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {TOPICS.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.button
              key={t.title}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(t.path)}
              className="text-left p-5 rounded-[1.75rem] bg-white border border-rose-50 hover:border-[#ff69b4]/40 shadow-sm hover:-translate-y-0.5 transition-all"
            >
              <Icon size={22} className="text-[#ff69b4] mb-3" />
              <h2 className="font-black text-sm text-[#15192c] mb-1">{t.title}</h2>
              <p className="text-xs text-[#9A8A8E]">{t.desc}</p>
            </motion.button>
          );
        })}
      </div>

      <div className="p-6 rounded-[2rem] bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 text-center">
        <p className="text-sm font-medium text-[#15192c] mb-4">Try 4-7-8 breathing — inhale 4, hold 7, exhale 8.</p>
        <button
          type="button"
          onClick={() => navigate('/app/mental-health')}
          className="px-8 py-3 rounded-full bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest"
        >
          Guided breathing
        </button>
      </div>
    </motion.div>
  );
};

export default WellnessCenterScreen;
