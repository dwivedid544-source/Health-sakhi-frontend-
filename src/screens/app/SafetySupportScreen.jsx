import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Phone } from 'lucide-react';
import { SAFETY_HELPLINES, SAFETY_PLAN_STEPS } from '../../data/safetyResources';

const SafetySupportScreen = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto pb-12">
    <header className="mb-8">
      <div className="flex items-center gap-2 text-red-600 mb-2">
        <Shield size={20} />
        <span className="text-[10px] font-black uppercase tracking-widest">Safety & support</span>
      </div>
      <h1 className="text-2xl font-black text-[#15192c] mb-2">You deserve to be safe</h1>
      <p className="text-sm text-[#9A8A8E]">Helplines, guidance, and a gentle safety plan.</p>
    </header>

    <div className="space-y-3 mb-8">
      {SAFETY_HELPLINES.map((h) => (
        <div key={h.id} className="p-5 rounded-2xl bg-red-50 border border-red-100">
          <p className="text-[10px] font-black uppercase text-red-800 mb-1">{h.title}</p>
          <p className="font-black text-xl text-[#15192c] flex items-center gap-2">
            <Phone size={18} /> {h.number}
          </p>
          <p className="text-xs text-[#4a3f55] mt-1">{h.note}</p>
        </div>
      ))}
    </div>

    <section className="p-5 rounded-[2rem] bg-white border border-rose-50 mb-6">
      <h2 className="font-black text-sm mb-4">Safety planning steps</h2>
      <ol className="list-decimal list-inside space-y-2 text-sm text-[#15192c] font-medium">
        {SAFETY_PLAN_STEPS.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </section>

    <div className="flex flex-col gap-3">
      <Link
        to="/app/guidance"
        className="text-center py-3 rounded-full bg-[#15192c] text-white text-[10px] font-black uppercase"
      >
        Therapy & guidance wizard
      </Link>
      <Link
        to="/app/awareness"
        className="text-center py-3 rounded-full bg-rose-50 text-[#ff69b4] text-[10px] font-black uppercase border border-rose-100"
      >
        Awareness & domestic support
      </Link>
      <Link
        to="/app/sessions"
        className="text-center py-3 rounded-full border border-[#15192c] text-[#15192c] text-[10px] font-black uppercase"
      >
        Book advisor session
      </Link>
    </div>

    <p className="text-[10px] text-center text-[#9A8A8E] mt-8">
      health sakhi ers wellness guidance, not emergency medical services.
    </p>
  </motion.div>
);

export default SafetySupportScreen;
