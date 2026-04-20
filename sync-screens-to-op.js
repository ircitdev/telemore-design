/**
 * Безопасное обновление telemore.op:
 *  - заменяет корневые ноды на изменённые экраны из JSON-исходников
 *  - добавляет новые страницы, если их нет
 *  - делает автобэкап перед записью
 *
 * Не использует OpenPencil — работает напрямую с файлом.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'designs');
const OP_FILE = path.join(ROOT, 'telemore.op');

// Список обновлений.  pageMatch — регэксп по name, ИЛИ createName — имя новой страницы.
const REPLACEMENTS = [
  { pageMatch: /^2\. Главный/,  source: 'screen-2-home.json' },
  { pageMatch: /^3\. Мой QR/,   source: 'screen-3-qr.json' },
  { pageMatch: /^5\. Рейтинг/,  source: 'screen-5-rating.json' },
  { pageMatch: /^6\. План дня/, source: 'screen-6-plan.json' },
  { pageMatch: /^7\. Сканер/,   source: 'screen-7-scanner.json' },
  { pageMatch: /^A1\./,         source: 'A1.json' },
  { pageMatch: /^A2\./,         source: 'A2.json' },
  { pageMatch: /^A4\./,         source: 'A4.json' },
  { pageMatch: /^A7\./,         source: 'A7.json' },
  { pageMatch: /^A10\./,        source: 'A10.json' },
  // Новая страница — создаётся если нет
  { pageMatch: /^A11\./,        source: 'A11.json', createName: 'A11. Producer: Генератор бейджей' },
];

// Мини-реализация nanoid для ID страницы
function nanoid() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let s = '';
  for (let i = 0; i < 21; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

const doc = JSON.parse(fs.readFileSync(OP_FILE, 'utf8'));

console.log(`Document: ${doc.pages?.length || 0} pages`);
if (!doc.pages || doc.pages.length < 10) {
  console.error('❌ Document looks broken — ABORTING (need at least 10 pages)');
  process.exit(1);
}

let replaced = 0;
let created = 0;

for (const { pageMatch, source, createName } of REPLACEMENTS) {
  const sourcePath = path.join(ROOT, source);
  if (!fs.existsSync(sourcePath)) {
    console.warn(`⚠ Source missing: ${source}`);
    continue;
  }
  const newRoot = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

  let page = doc.pages.find(p => pageMatch.test(p.name));

  if (!page) {
    if (!createName) {
      console.warn(`⚠ Page not found & no createName given: ${pageMatch}`);
      continue;
    }
    // Создаём страницу
    page = { id: nanoid(), name: createName, children: [] };
    doc.pages.push(page);
    console.log(`➕ Created page: ${createName}`);
    created++;
  }

  // Сохраняем x/y существующего корневого нода (если был)
  const old = page.children?.[0];
  if (old) {
    if (typeof old.x === 'number') newRoot.x = old.x;
    if (typeof old.y === 'number') newRoot.y = old.y;
  } else {
    newRoot.x = newRoot.x ?? 0;
    newRoot.y = newRoot.y ?? 0;
  }

  page.children = [newRoot];
  console.log(`✓ ${page.name.padEnd(42)} ← ${source}`);
  replaced++;
}

// Бэкап перед записью
const backup = OP_FILE + '.bak.' + Date.now();
fs.copyFileSync(OP_FILE, backup);
console.log(`\nBackup: ${path.basename(backup)}`);

fs.writeFileSync(OP_FILE, JSON.stringify(doc));
console.log(`✅ Saved telemore.op`);
console.log(`   Screens updated: ${replaced}  (new pages: ${created})`);
console.log(`   Total pages: ${doc.pages.length}`);
console.log(`   File size: ${(fs.statSync(OP_FILE).size / 1024).toFixed(1)} KB`);
