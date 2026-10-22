/** Cached English body from PDF (or .txt), keyed by book id */
const enPdfByBookId = new Map();

/** Cached machine-translated HTML: key `${bookId}::${langCode}` */
const translatedByKey = new Map();

const tKey = (bookId, lang) => `${bookId}::${lang}`;

export const bookHtmlCache = {
  getEnPdf: (bookId) => enPdfByBookId.get(bookId),
  setEnPdf: (bookId, html) => {
    if (bookId != null && html) enPdfByBookId.set(bookId, html);
  },
  getTranslated: (bookId, lang) => translatedByKey.get(tKey(bookId, lang)),
  setTranslated: (bookId, lang, html) => {
    if (bookId != null && lang && html) translatedByKey.set(tKey(bookId, lang), html);
  },
  clearBook: (bookId) => {
    enPdfByBookId.delete(bookId);
    for (const k of [...translatedByKey.keys()]) {
      if (k.startsWith(`${bookId}::`)) translatedByKey.delete(k);
    }
  }
};
