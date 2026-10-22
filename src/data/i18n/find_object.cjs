const fs = require('fs');

const en = JSON.parse(fs.readFileSync('./en.json', 'utf8'));
const hi = JSON.parse(fs.readFileSync('./hi.json', 'utf8'));
const mr = JSON.parse(fs.readFileSync('./mr.json', 'utf8'));

function check(obj, path = '') {
  if (typeof obj !== 'object' || obj === null) return;
  const keys = Object.keys(obj);
  if (keys.includes('name') && keys.includes('value')) {
    console.log(`Found object with name and value at path: ${path}`, obj);
  }
  for (const key of keys) {
    check(obj[key], path ? `${path}.${key}` : key);
  }
}

console.log('Checking en.json:');
check(en);
console.log('Checking hi.json:');
check(hi);
console.log('Checking mr.json:');
check(mr);
