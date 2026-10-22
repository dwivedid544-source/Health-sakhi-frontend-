/**
 * Chunked translation via MyMemory public API (browser).
 * Dev server: use Vite proxy to avoid CORS. Production: direct API (MyMemory allows browser in many cases).
 */

const LANGPAIR = {
  hi: 'en|hi',
  mr: 'en|mr',
  ta: 'en|ta',
  te: 'en|te',
  bn: 'en|bn',
  ar: 'en|ar'
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Plain text per logical <p> block */
export function extractPlainParagraphsFromBookHtml(html) {
  if (!html || typeof html !== 'string') return [];
  const re = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const plain = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (plain) out.push(plain);
  }
  if (out.length) return out;
  const stripped = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return stripped ? [stripped] : [];
}

export function batchParagraphsForTranslate(paragraphs, maxChars = 420) {
  const batches = [];
  let cur = '';
  for (const p of paragraphs) {
    const next = cur ? `${cur} ${p}` : p;
    if (next.length > maxChars && cur) {
      batches.push(cur.trim());
      cur = p;
    } else {
      cur = next;
    }
  }
  if (cur.trim()) batches.push(cur.trim());
  return batches;
}

function translateUrl() {
  return import.meta.env.DEV ? '/api-mymemory/get' : 'https://api.mymemory.translated.net/get';
}

async function fetchOneChunk(text, langPair, signal) {
  const q = encodeURIComponent(text.slice(0, 400));
  const url = `${translateUrl()}?q=${q}&langpair=${langPair}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`translate HTTP ${res.status}`);
  const json = await res.json();
  if (json.quotaFinished) throw new Error('Translation quota finished. Try again later.');
  if (json.responseStatus !== 200) {
    throw new Error(json.responseDetails || json.responseData?.error || 'Translation failed');
  }
  return json.responseData?.translatedText ?? '';
}

/**
 * @param {string} englishHtml
 * @param {string} targetLangCode — hi, mr, ta, …
 * @param {{ signal?: AbortSignal, onProgress?: (n: number, total: number) => void }} opts
 * @returns {Promise<string>} HTML with <p>…</p>
 */
export async function translateEnglishBookHtml(englishHtml, targetLangCode, opts = {}) {
  const { signal, onProgress } = opts;
  const langPair = LANGPAIR[targetLangCode];
  if (!langPair) {
    throw new Error(`Unsupported target language for auto-translate: ${targetLangCode}`);
  }

  const paras = extractPlainParagraphsFromBookHtml(englishHtml);
  if (!paras.length) throw new Error('No paragraphs to translate');

  const chunks = batchParagraphsForTranslate(paras, 380);
  const translatedParts = [];

  for (let i = 0; i < chunks.length; i += 1) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const part = await fetchOneChunk(chunks[i], langPair, signal);
    translatedParts.push(part);
    onProgress?.(i + 1, chunks.length);
    await sleep(240);
  }

  return translatedParts.map((t) => `<p>${escapeHtml(t)}</p>`).join('');
}

export function isAutoTranslateSupported(code) {
  return Boolean(LANGPAIR[code]);
}

/** Manual `pages` strings from bookTranslations → safe HTML */
export function paragraphsArrayToHtml(paragraphs) {
  if (!Array.isArray(paragraphs) || !paragraphs.length) return '';
  return paragraphs
    .map((p) => String(p).trim())
    .filter(Boolean)
    .map((p) => (/^<p[\s>]/i.test(p) ? p : `<p>${escapeHtml(p)}</p>`))
    .join('');
}
