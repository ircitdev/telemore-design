/**
 * Безопасное обновление telemore.op:
 * заменяет корневые ноды 8 изменённых экранов из JSON-исходников.
 * Не использует OpenPencil — работает напрямую с файлом.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'designs');
const OP_FILE = path.join(ROOT, 'telemore.op');

// Маппинг: что-то в имени Page → исходник JSON
const REPLACEMENTS = [
  { pageMatch: /^2\. Главный/,  source: 'screen-2-home.json' },
  { pageMatch: /^3\. Мой QR/,   source: 'screen-3-qr.json' },
  { pageMatch: /^6\. План дня/, source: 'screen-6-plan.json' },
  { pageMatch: /^7\. Сканер/,   source: 'screen-7-scanner.json' },
  { pageMatch: /^A1\./,         source: 'A1.json' },
  { pageMatch: /^A2\./,         source: 'A2.json' },
  { pageMatch: /^A4\./,         source: 'A4.json' },
  { pageMatch: /^A7\./,         source: 'A7.json' },
];

// Читаем текущий .op
const doc = JSON.parse(fs.readFileSync(OP_FILE, 'utf8'));

console.log(`Document: ${doc.pages?.length || 0} pages`);
if (!doc.pages || doc.pages.length < 10) {
  console.error('❌ Document looks broken — ABORTING (need at least 10 pages)');
  process.exit(1);
}

let updated = 0;

for (const { pageMatch, source } of REPLACEMENTS) {
  const page = doc.pages.find(p => pageMatch.test(p.name));
  if (!page) {
    console.warn(`⚠ Page not found: ${pageMatch}`);
    continue;
  }

  const sourcePath = path.join(ROOT, source);
  if (!fs.existsSync(sourcePath)) {
    console.warn(`⚠ Source missing: ${source}`);
    continue;
  }

  const newRoot = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

  // Сохраняем x/y существующего корневого нода (если был)
  const old = page.children?.[0];
  if (old) {
    if (typeof old.x === 'number') newRoot.x = old.x;
    if (typeof old.y === 'number') newRoot.y = old.y;
  } else {
    newRoot.x = newRoot.x ?? 0;
    newRoot.y = newRoot.y ?? 0;
  }

  // Заменяем
  page.children = [newRoot];
  console.log(`✓ ${page.name.padEnd(40)} ← ${source}`);
  updated++;
}

// Бэкап перед записью
const backup = OP_FILE + '.bak.' + Date.now();
fs.copyFileSync(OP_FILE, backup);
console.log(`\nBackup: ${path.basename(backup)}`);

fs.writeFileSync(OP_FILE, JSON.stringify(doc));
console.log(`✅ Saved telemore.op (${updated} screens updated, ${doc.pages.length} pages total)`);
console.log(`   Size: ${(fs.statSync(OP_FILE).size / 1024).toFixed(1)} KB`);
