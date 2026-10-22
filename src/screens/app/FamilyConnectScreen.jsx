import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWellnessStore } from '../../store/wellnessStore';

const PROMPTS = [
  'What made you feel loved today?',
  'Is there something you wish I understood?',
  'One small kindness we can try tomorrow?',
  'How are you really feeling — honestly?'
];

const FamilyConnectScreen = () => {
  const navigate = useNavigate();
  const { gratitudeNotes, addGratitude, markCheckInToday } = useWellnessStore();
  const [gratitude, setGratitude] = useState('');
  const [checkIn, setCheckIn] = useState('');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto pb-12">
      <header className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] mb-2">Family connect</p>
        <h1 className="text-2xl font-black text-[#15192c] mb-2">Heal through connection</h1>
        <p className="text-sm text-[#9A8A8E]">Gratitude, check-ins, and gentle conversation starters.</p>
      </header>

      <section className="mb-6 p-5 rounded-[2rem] bg-gradient-to-br from-rose-50 to-purple-50 border border-rose-100">
        <motion.div className="flex items-center gap-2 mb-3">
          <MessageCircle size={18} className="text-[#ff69b4]" />
          <h2 className="font-black text-sm text-[#15192c]">How are you really feeling?</h2>
        </motion.div>
        <textarea
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          placeholder="Share honestly — saved on your device..."
          className="w-full min-h-[80px] p-3 rounded-xl border border-rose-100 text-sm mb-3 bg-white/80"
        />
        <button
          type="button"
          onClick={() => {
            if (checkIn.trim()) addGratitude(`Check-in: ${checkIn.trim()}`);
            markCheckInToday();
            setCheckIn('');
          }}
          className="w-full py-2.5 rounded-full bg-[#ff69b4] text-white text-[10px] font-black uppercase"
        >
          Save today&apos;s check-in
        </button>
      </section>

      <section className="mb-6 p-5 rounded-[2rem] bg-white border border-rose-50 shadow-sm">
        <motion.div className="flex items-center gap-2 mb-3">
          <Heart size={18} className="text-[#ff69b4]" />
          <h2 className="font-black text-sm">Daily appreciation</h2>
        </motion.div>
        <div className="flex gap-2 mb-3">
          <input
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="I appreciate you because..."
            className="flex-1 p-3 rounded-xl border border-rose-100 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              addGratitude(gratitude);
              setGratitude('');
            }}
            className="px-4 rounded-xl bg-[#15192c] text-white text-[10px] font-black uppercase shrink-0"
          >
            Send
          </button>
        </div>
        <ul className="space-y-2 max-h-40 overflow-y-auto">
          {gratitudeNotes.map((n) => (
            <li key={n.id} className="text-xs p-3 rounded-xl bg-rose-50 text-[#15192c]">
              {n.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="p-5 rounded-[2rem] bg-white border border-rose-50 mb-6">
        <motion.div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-[#ff69b4]" />
          <h2 className="font-black text-sm">Conversation starters</h2>
        </motion.div>
        <ul className="space-y-2">
          {PROMPTS.map((p) => (
            <li key={p} className="p-3 rounded-xl bg-violet-50/80 text-sm font-medium text-[#15192c] border border-violet-100">
              {p}
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={() => navigate('/app/ai-sakhi')}
        className="w-full py-3 rounded-full bg-[#15192c] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ff69b4] transition-colors"
      >
        Talk to AI Sakhi about family
      </button>
    </motion.div>
  );
};

export default FamilyConnectScreen;
