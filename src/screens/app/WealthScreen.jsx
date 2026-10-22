import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, PieChart, ArrowUpRight, ArrowDownRight, Wallet, Target, Sparkles, ArrowRight } from 'lucide-react';

const WealthScreen = () => {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const goals = [
    { title: 'Dream House', target: '₹50,00,000', current: '₹12,40,000', progress: 24, color: '#ff69b4' },
    { title: 'World Tour', target: '₹5,00,000', current: '₹3,20,000', progress: 64, color: '#9079C1' },
    { title: 'New Car', target: '₹15,00,000', current: '₹1,50,000', progress: 10, color: '#CCAA3D' },
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full pb-20 px-4"
    >
      <div className="space-y-12 pt-8">
        <motion.section variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tight" style={{ color: '#15192c' }}>Wealth Sakhi 💰</h2>
            <span className="text-[11px] font-black uppercase tracking-[0.3em]" style={{ color: '#C4A0AC' }}>Financial Empowerment</span>
          </div>
          <div className="flex gap-4">
             <div className="px-6 py-4 bg-white border border-[#F5E6EA] rounded-3xl shadow-sm text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#C4A0AC] mb-1">Net Worth</p>
                <p className="text-xl font-black text-[#ff69b4]">₹18,50,400</p>
             </div>
          </div>
        </motion.section>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-12">
            {/* Overview Card */}
            <motion.section variants={item} className="bg-[#15192c] rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff69b4]/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff69b4] mb-3">Portfolio Balance</p>
                     <h3 className="text-5xl font-black mb-10 tracking-tighter">₹15,40,200</h3>
                     <div className="flex gap-6">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black uppercase text-white/40 mb-1">Monthly Growth</span>
                           <span className="text-lg font-black text-emerald-400 flex items-center gap-1">
                              <ArrowUpRight size={20} /> 12.4%
                           </span>
                        </div>
                        <div className="flex flex-col border-l border-white/10 pl-6">
                           <span className="text-[9px] font-black uppercase text-white/40 mb-1">Total Assets</span>
                           <span className="text-lg font-black">24 Items</span>
                        </div>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm">
                        <TrendingUp className="text-[#ff69b4] mb-4" />
                        <p className="text-[9px] font-black uppercase text-white/40 mb-1">Equity</p>
                        <p className="text-lg font-black">₹8.4L</p>
                     </div>
                     <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm">
                        <Wallet className="text-[#CCAA3D] mb-4" />
                        <p className="text-[9px] font-black uppercase text-white/40 mb-1">Savings</p>
                        <p className="text-lg font-black">₹3.2L</p>
                     </div>
                  </div>
               </div>
            </motion.section>

            {/* Savings Goals */}
            <motion.section variants={item}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: '#C4A0AC' }}>Savings Goals</h3>
                <button className="text-[10px] font-black uppercase text-[#ff69b4]">Add New Goal +</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {goals.map((goal, i) => (
                   <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-[#F5E6EA] shadow-sm hover:shadow-xl transition-all group">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-[#ff69b4] mb-6 shadow-sm group-hover:scale-110 transition-transform">
                         <Target size={24} />
                      </div>
                      <h4 className="font-black text-lg mb-4" style={{ color: '#15192c' }}>{goal.title}</h4>
                      <div className="mb-4">
                         <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                            <span style={{ color: '#C4A0AC' }}>Target</span>
                            <span style={{ color: '#15192c' }}>{goal.target}</span>
                         </div>
                         <div className="h-1.5 w-full bg-rose-50 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${goal.progress}%` }}
                              className="h-full rounded-full" 
                              style={{ backgroundColor: goal.color }} 
                            />
                         </div>
                      </div>
                      <p className="text-xs font-bold" style={{ color: '#ff69b4' }}>{goal.progress}% Achieved</p>
                   </div>
                 ))}
              </div>
            </motion.section>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-10">
            {/* Asset Allocation */}
            <motion.section variants={item} className="bg-white rounded-[3rem] p-8 border border-[#F5E6EA] shadow-sm">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6" style={{ color: '#C4A0AC' }}>Asset Allocation</h3>
               <div className="space-y-4">
                  {[
                    { label: 'Equity', value: 45, color: '#ff69b4' },
                    { label: 'Mutual Funds', value: 30, color: '#9079C1' },
                    { label: 'Gold', value: 15, color: '#CCAA3D' },
                    { label: 'Cash', value: 10, color: '#15192c' }
                  ].map((asset, i) => (
                    <div key={i}>
                       <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                          <span style={{ color: '#6B5E63' }}>{asset.label}</span>
                          <span style={{ color: '#15192c' }}>{asset.value}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-rose-50 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${asset.value}%`, backgroundColor: asset.color }} />
                       </div>
                    </div>
                  ))}
               </div>
            </motion.section>

            {/* Wealth Tip */}
            <motion.section variants={item} className="rounded-[3rem] p-8 bg-gradient-to-br from-[#FFF9EE] to-[#FEF9E3] border border-[#F5E6EA]">
               <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#CCAA3D] shadow-sm mb-6">
                  <Sparkles size={24} />
               </div>
               <h3 className="text-xl font-black mb-3" style={{ color: '#15192c' }}>Financial Wisdom</h3>
               <p className="text-xs font-bold leading-relaxed opacity-60 mb-6 font-medium italic">
                  "Wealth is not about having a lot of money; it's about having a lot of options."
               </p>
               <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#CCAA3D]">
                  Investment Guide <ArrowRight size={14} />
               </button>
            </motion.section>

            {/* Recent Activity */}
            <motion.section variants={item} className="bg-white rounded-[3rem] p-8 border border-[#F5E6EA] shadow-sm">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6" style={{ color: '#C4A0AC' }}>Growth Pulse</h3>
               <div className="space-y-6">
                  {[
                    { label: 'SIP Decucted', date: 'Oct 12', amount: '-₹5,000', type: 'out' },
                    { label: 'Dividend Payout', date: 'Oct 08', amount: '+₹1,200', type: 'in' },
                    { label: 'Gold Purchase', date: 'Oct 05', amount: '-₹10,000', type: 'out' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex flex-col">
                          <span className="text-[11px] font-black text-[#15192c]">{item.label}</span>
                          <span className="text-[9px] font-bold text-[#C4A0AC] uppercase">{item.date}</span>
                       </div>
                       <span className={`text-xs font-black ${item.type === 'in' ? 'text-emerald-500' : 'text-rose-500'}`}>{item.amount}</span>
                    </div>
                  ))}
               </div>
            </motion.section>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default WealthScreen;
