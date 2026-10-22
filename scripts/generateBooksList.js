import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOOKS_DIR = path.join(__dirname, '../public/books');

const files = fs.readdirSync(BOOKS_DIR)
  .filter(f => f.match(/^book_\d+_en\.json$/))
  .sort((a, b) => {
    const idA = parseInt(a.match(/book_(\d+)_en/)[1]);
    const idB = parseInt(b.match(/book_(\d+)_en/)[1]);
    return idA - idB;
  });

console.log(`Found ${files.length} English book JSONs...`);

const masterList = [];

for (const file of files) {
  const filePath = path.join(BOOKS_DIR, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    masterList.push({
      id: data.id,
      title: data.title,
      subtitle: data.subtitle || '',
      author: data.author || 'Health Sakhi',
      category: data.category || 'General Health',
      reads: data.reads || '1.0k',
      desc: data.desc || '',
      image: data.image || '/Images/girlsgroup.png',
      readsTime: data.readsTime || '30 mins',
      chapters: (data.chapters || []).map(ch => typeof ch === 'string' ? ch : ch.title),
      totalPages: (data.pages || []).length
    });
    console.log(`✅ Book ${data.id}: ${data.title} (${(data.pages || []).length} pages, ${(data.chapters || []).length} chapters)`);
  } catch (err) {
    console.error(`❌ Error reading ${file}:`, err.message);
  }
}

const outputPath = path.join(BOOKS_DIR, 'books_list.json');
fs.writeFileSync(outputPath, JSON.stringify(masterList, null, 2), 'utf8');
console.log(`\n🏆 books_list.json created with ${masterList.length} books!`);
