const fs = require('fs');
let content = fs.readFileSync('src/screens/LandingPage.jsx', 'utf-8');
let lines = content.split('\n');
lines.splice(104, 17, `            <div className="flex flex-col items-center gap-6 w-full justify-center mt-3">
              <div className="flex items-center gap-5 w-full justify-center">
                <button className="px-9 py-4 rounded-full bg-[#E91E63] text-white font-black text-[11px] uppercase tracking-widest shadow-[0_4px_15px_rgba(233,30,99,0.2)] hover:scale-105 hover:shadow-[0_8px_25px_rgba(233,30,99,0.35)] transition-all">
                  Explore Services
                </button>
                <button className="px-9 py-4 rounded-full border-2 border-[#4B1E5A] bg-white/20 backdrop-blur-sm text-[#4B1E5A] font-black text-[11px] uppercase tracking-widest hover:bg-[#4B1E5A] hover:text-white transition-all">
                  Learn More
                </button>
              </div>
            </div>`);
fs.writeFileSync('src/screens/LandingPage.jsx', lines.join('\n'));
