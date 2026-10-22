import fs from 'fs';

const D = 'div';
const M = 'motion.div';
const p = 'src/components/BookReaderModal.jsx';
let s = fs.readFileSync(p, 'utf8');

const leftMarker = '              {/* Left Page */}';
const rightIdx = s.indexOf('              {/* Right Page */}');
const start = s.indexOf('                {loading ? (', s.indexOf(leftMarker));
const afterIdx = s.indexOf('            </div>\n\n            <button', rightIdx);

if (start < 0 || afterIdx < 0) {
  console.error('markers not found', { start, afterIdx });
  process.exit(1);
}

const bookNew = `                {loading && !translateProgress ? (
                  <${D} className="h-full flex items-center justify-center pt-8">
                    <${M} className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E91E63]" />
                  </${D}>
                ) : !loading ? (
                  <${D} className="prose prose-sm max-w-none pt-6">
                    <${D}
                      className="text-[#4B1E5A]/80 leading-relaxed text-justify book-content"
                      dangerouslySetInnerHTML={{ __html: pages[currentPage] || 'End of Book.' }}
                    />
                    <SakhiNote pageHtml={pages[currentPage]} index={currentPage} />
                  </${D}>
                ) : null}
              </${D}>

              {/* Right Page */}
              <${D} className="relative min-h-[180px] lg:min-h-0 lg:h-full p-5 sm:p-8 lg:p-16 overflow-visible lg:overflow-y-auto no-scrollbar bg-gradient-to-b lg:bg-gradient-to-l from-gray-50/30 to-white">
                <${D} className="absolute top-3 right-4 sm:top-6 sm:right-8 lg:right-12 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
                  Page {pages[currentPage + 1] ? currentPage + 2 : currentPage + 1}
                </${D}>
                {loading && !translateProgress ? (
                  <${D} className="h-full flex items-center justify-center pt-8">
                    <${M} className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E91E63]" />
                  </${D}>
                ) : !loading ? (
                  <${D} className="prose prose-sm max-w-none pt-6">
                    <${D}
                      className="text-[#4B1E5A]/80 leading-relaxed text-justify book-content"
                      dangerouslySetInnerHTML={{ __html: pages[currentPage + 1] || '' }}
                    />
                    <SakhiNote pageHtml={pages[currentPage + 1]} index={currentPage + 1} />
                    {!pages[currentPage + 1] && (
                      <${D} className="mt-8 sm:mt-12 bg-[#FFF0F5] border border-[#FCE4EC] rounded-2xl p-5 sm:p-6 shadow-sm">
                        <p className="text-[9px] font-black text-[#E91E63] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Sparkles size={12} /> Sakhi Reflection
                        </p>
                        <p className="text-sm font-serif italic font-bold text-[#E91E63]/80">
                          &ldquo;{getSakhiReflection(selectedLang.code, currentPage)}&rdquo;
                        </p>
                      </${D}>
                    )}
                  </${D}>
                ) : null}
              </${D}>

`;

s = s.slice(0, start) + bookNew + s.slice(afterIdx);

const footerOld = `             <div className="text-left sm:text-right min-w-0">
                <p className="text-[9px] font-black text-[#E91E63] uppercase tracking-widest">Wellness Level</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase hidden sm:block">Keep reading to grow</p>
             </div>
             <motion.div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 shrink-0">
                <Trophy size={16} />
             </motion.div>`;

const footerNew = `             <${D} className="text-left sm:text-right min-w-0">
                <p className="text-[9px] font-black text-[#E91E63] uppercase tracking-widest">{readerCopy.wellnessLevel}</p>
                <p className="text-[8px] font-bold text-[#E91E63] uppercase hidden sm:block">{wellnessLabel}</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase hidden md:block">{readerCopy.keepReading}</p>
             </${D}>
             <${D} className={\`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 \${readPercent >= 75 ? 'bg-[#E91E63] text-white' : readPercent >= 50 ? 'bg-amber-100 text-amber-600' : readPercent >= 25 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-300'}\`}>
                <Trophy size={16} />
             </${D}>`;

const footerOld2 = footerOld.replace(/motion\.div/g, D);

if (s.includes(footerOld2)) s = s.replace(footerOld2, footerNew);

const listenBlock = `            <${D} className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0 w-full">
              <${D} className="flex-1 h-1.5 bg-gray-100 rounded-full relative overflow-hidden min-w-0">`;

const listenBlockNew = `            <p className="hidden md:block text-[9px] font-black text-gray-400 uppercase tracking-widest shrink-0 tabular-nums">
              {readerCopy.pagesLabel} {currentPage + 1}–{displayPageEnd}/{pages.length || 0}
            </p>
            <${D} className="flex flex-1 items-center gap-2 sm:gap-4 min-w-0 w-full">
              <${D} className="flex-1 h-1.5 bg-gray-100 rounded-full relative overflow-hidden min-w-0">`;

if (s.includes(listenBlock)) s = s.replace(listenBlock, listenBlockNew);

const pctRead = `              <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0 tabular-nums w-[3.25rem] sm:w-20 text-right">
                {pages.length ? Math.min(100, Math.round(((currentPage + 2) / pages.length) * 100)) : 0}% Read
              </span>`;

const pctReadNew = `              <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0 tabular-nums text-right min-w-[3.25rem] sm:min-w-20">
                {translateProgress
                  ? \`\${translateProgress.total ? Math.round((translateProgress.current / translateProgress.total) * 100) : 0}% \${readerCopy.translating}\`
                  : \`\${pages.length ? Math.min(100, Math.round(((currentPage + 2) / pages.length) * 100)) : 0}% Read\`}
              </span>`;

if (s.includes(pctRead)) s = s.replace(pctRead, pctReadNew);

fs.writeFileSync(p, s);
console.log('patched ok');
