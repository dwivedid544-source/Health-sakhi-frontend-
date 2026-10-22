import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Fetches a PDF and returns HTML string of <p> paragraphs for the book reader.
 * @param {string} url - Absolute or site-root path (e.g. /books/file.pdf)
 */
export async function extractPdfText(url) {
  const safeUrl = url.startsWith('http://') || url.startsWith('https://') ? url : encodeURI(url);

  const loadingTask = pdfjsLib.getDocument({ url: safeUrl });

  const pdf = await loadingTask.promise;
  const parts = [];

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    let line = '';
    for (const item of textContent.items) {
      if (!('str' in item) || !item.str) continue;
      line += item.str;
      if (item.hasEOL) line += '\n';
      else line += ' ';
    }
    const cleaned = line.replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    if (cleaned) parts.push(cleaned);
  }

  const merged = parts.join('\n\n');
  const paragraphs = merged
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  if (!paragraphs.length) {
    return '<p>No readable text was found in this PDF.</p>';
  }

  return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
}
