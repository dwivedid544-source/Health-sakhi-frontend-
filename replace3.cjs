const fs = require('fs');
let content = fs.readFileSync('src/screens/LandingPage.jsx', 'utf-8');
let lines = content.split('\n');
lines.splice(137, 67, `              <img 
                src="/Images/mobilecard.png" 
                alt="HealthSakhi App Mockup" 
                className="w-full h-auto drop-shadow-2xl hover:-translate-y-2 transition-transform duration-700"
              />`);
fs.writeFileSync('src/screens/LandingPage.jsx', lines.join('\n'));
