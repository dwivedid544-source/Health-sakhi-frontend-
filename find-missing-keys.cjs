const fs = require('fs');
const path = require('path');

const en = require('./src/data/i18n/en.json');

function checkKey(catalog, key) {
  const parts = key.split('.');
  let node = catalog;
  for (const p of parts) {
    node = node?.[p];
    if (node === undefined) return false;
  }
  return true;
}

function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, filesList);
    } else {
      if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
        filesList.push(fullPath);
      }
    }
  }
  return filesList;
}

const files = getFiles(path.join(__dirname, 'src'));

const missing = new Set();
const keyRegex = /\bt\(\s*['"]([^'"]+)['"]/g;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = keyRegex.exec(content)) !== null) {
    const key = match[1];
    if (key.includes('${')) continue;
    if (key.match(/^(nav|auth|dashboard|common|sessions)\./)) {
      if (!checkKey(en, key)) {
        missing.add(key);
      }
    }
  }
}

const keysRegex2 = /i18n(?:Subtitle|Label)?Key\s*:\s*['"]([^'"]+)['"]/g;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = keysRegex2.exec(content)) !== null) {
    const key = match[1];
    if (key.match(/^(nav|auth|dashboard|common|sessions)\./)) {
      if (!checkKey(en, key)) {
        missing.add(key);
      }
    }
  }
}

console.log('Missing keys in specific domains:', Array.from(missing).sort());
