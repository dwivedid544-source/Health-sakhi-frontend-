const fs = require('fs');
const files = ['en', 'hi', 'mr'];
for (const lang of files) {
  const path = './src/data/i18n/' + lang + '.json';
  let txt = fs.readFileSync(path, 'utf8');
  const match = txt.match(/"sessions":\s*\{[\s\S]*?"durations":\s*\{[\s\S]*?\},[\s\S]*?"topics":\s*\{[\s\S]*?\}\s*\}/);
  if (!match) continue;
  const firstBlock = match[0];
  const innerMatch = firstBlock.match(/("durations":\s*\{[\s\S]*?\},[\s\S]*?"topics":\s*\{[\s\S]*?\})/);
  if (!innerMatch) continue;
  const innerContent = innerMatch[0];
  txt = txt.replace(firstBlock + ',\n  ', '');
  txt = txt.replace(firstBlock + ',', '');
  txt = txt.replace(/"topics":\s*\{[^}]+\}/, innerContent);
  fs.writeFileSync(path, txt, 'utf8');
  console.log('Fixed ' + lang);
}
