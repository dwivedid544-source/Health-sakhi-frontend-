const en = require('./en.json');
const hi = require('./hi.json');
const mr = require('./mr.json');

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
