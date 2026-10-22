import fs from 'fs';

const CD = '</motion.div>';
const DD = '</div>';

const fileFixes = {
  'src/components/landing/FamilyWellnessLandingSections.jsx': [
    ['            ))}\r\n          </motion.div>\r\n          <motion.div className="flex flex-wrap justify-center gap-3 mt-10"', `            ))}\r\n          ${DD}\r\n          <div className="flex flex-wrap justify-center gap-3 mt-10"`],
    ['            ))}\r\n          </motion.div>\r\n        </motion.div>\r\n      </section>\r\n\r\n      {/* Invisible Load */}', `            ))}\r\n          ${DD}\r\n        </motion.div>\r\n      </section>\r\n\r\n      {/* Invisible Load */}`],
    ['            ))}\r\n          </motion.div>\r\n        </motion.div>\r\n      </section>\r\n\r\n      {/* Family Wellness Matters */}', `            ))}\r\n          ${DD}\r\n        </motion.div>\r\n      </section>\r\n\r\n      {/* Family Wellness Matters */}`],
    ['            ))}\r\n          </motion.div>\r\n        </motion.div>\r\n      </section>\r\n\r\n      {/* Symptoms Behind Stress */}', `            ))}\r\n          ${DD}\r\n        </motion.div>\r\n      </section>\r\n\r\n      {/* Symptoms Behind Stress */}`],
    ['            ))}\r\n          </motion.div>\r\n          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">', `            ))}\r\n          ${DD}\r\n          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">`],
    ['            ))}\r\n          </motion.div>\r\n        </motion.div>\r\n      </section>\r\n\r\n      {/* Programs */}', `            ))}\r\n          ${DD}\r\n        </motion.div>\r\n      </section>\r\n\r\n      {/* Programs */}`],
    ['            ))}\r\n          </motion.div>\r\n        </motion.div>\r\n      </section>\r\n\r\n      {/* Emergency */}', `            ))}\r\n          ${DD}\r\n        </motion.div>\r\n      </section>\r\n\r\n      {/* Emergency */}`]
  ],
  'src/screens/app/FamilyConnectScreen.jsx': [
    ['            Send\r\n          </button>\r\n        </motion.div>\r\n        <ul', `            Send\r\n          </button>\r\n        ${DD}\r\n        <ul`]
  ],
  'src/components/home/EmotionalCheckInModal.jsx': [
    ['              <h2 className="text-lg font-black text-[#15192c]">How are you really feeling?</h2>\r\n            </motion.div>', `              <h2 className="text-lg font-black text-[#15192c]">How are you really feeling?</h2>\r\n            ${DD}`],
    ['            </button>\r\n          </motion.div>\r\n          <textarea', `            </button>\r\n          ${DD}\r\n          <textarea`]
  ]
};

for (const [file, pairs] of Object.entries(fileFixes)) {
  let s = fs.readFileSync(file, 'utf8');
  for (const [from, to] of pairs) {
    if (s.includes(from)) {
      s = s.replace(from, to);
      console.log('patched', file);
    } else {
      console.log('MISS', file, from.slice(0, 40));
    }
  }
  fs.writeFileSync(file, s);
}
