const fs = require('fs');
let content = fs.readFileSync('src/screens/LandingPage.jsx', 'utf-8');
let lines = content.split('\n');
lines.splice(44, 25, `        {/* Top Header - Center Aligned */}
        <div className="w-full flex flex-col items-center justify-center text-center mt-6 z-10 space-y-3.5">
          <p className="text-[11px] font-black text-[#C69214] tracking-[0.25em] opacity-80 uppercase">
            Gyan Badhao Dhan Kamao
          </p>
          
          <h2 className="font-serif font-black text-xl sm:text-2xl tracking-[0.02em] text-[#4B1E5A]">
            Unique HealthSakhi Program – <span className="text-[#E91E63]">Learn To Earn</span>
          </h2>
          
          <button className="group flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/50 hover:bg-white/80 backdrop-blur-md border border-[#E91E63]/20 shadow-[0_4px_20px_rgba(233,30,99,0.1)] hover:shadow-[0_8px_25px_rgba(233,30,99,0.25)] transition-all duration-300">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E91E63] to-[#FF5E9B] flex items-center justify-center shadow-[0_0_15px_rgba(233,30,99,0.4)] group-hover:scale-110 transition-transform duration-300">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
            </div>
            <span className="text-[#4B1E5A] font-black text-[10px] uppercase tracking-widest group-hover:text-[#E91E63] transition-colors">
              See the demo video to know more
            </span>
          </button>
        </div>`);
fs.writeFileSync('src/screens/LandingPage.jsx', lines.join('\n'));
