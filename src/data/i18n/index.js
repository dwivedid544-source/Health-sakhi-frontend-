import en from './en.json';
import hi from './hi.json';
import mr from './mr.json';

const catalogs = { en, hi, mr };

/** UI strings — falls back to English for mr/ta/te/bn/ar until full catalogs added */
export const t = (langCode, key) => {
  const catalog = catalogs[langCode] || catalogs.en;
  const parts = key.split('.');
  let node = catalog;
  for (const p of parts) {
    node = node?.[p];
    if (node === undefined) break;
  }
  if (node !== undefined && typeof node !== 'object') return node;

  let fallback = catalogs.en;
  for (const p of parts) {
    fallback = fallback?.[p];
    if (fallback === undefined) break;
  }
  if (fallback !== undefined && typeof fallback !== 'object') return fallback;

  return key;
};
