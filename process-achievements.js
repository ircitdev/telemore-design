/**
 * Обработка ачивок:
 *  1. Переименовывает Gemini .jfif → 1_kreed.jpg, 2_carnaval.jpg, ...
 *  2. Генерит круглые PNG с прозрачностью в 3 разрешениях:
 *     - round-1024/ (для preview и high-res)
 *     - round-512/  (для screens и админки)
 *     - round-128/  (для мобильного UI)
 *
 * Требует: puppeteer
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DIR = path.join(__dirname, 'designs', 'achievements');

// Маппинг по хронологии генерации (самый старый = самая лёгкая ачивка)
// Если порядок не тот — клиент поправит вручную
const MAP = [
  { src: 'Gemini_Generated_Image_uhsnmyuhsnmyuhsn.jfif', slug: '1_kreed',     name: 'Крид',         xp: 100 },
  { src: 'Gemini_Generated_Image_4whsbr4whsbr4whs.jfif', slug: '2_carnaval',  name: 'Карнавал',     xp: 200 },
  { src: 'Gemini_Generated_Image_1dacbz1dacbz1dac.jfif', slug: '3_toxis',     name: 'Токсис',       xp: 300 },
  { src: 'Gemini_Generated_Image_5kieot5kieot5kie.jfif', slug: '4_dzhiga',    name: 'Джига',        xp: 400 },
  { src: 'Gemini_Generated_Image_fn0wg7fn0wg7fn0w.jfif', slug: '5_morgen',    name: 'Морген',       xp: 500 },
  { src: 'Gemini_Generated_Image_tr3v3ztr3v3ztr3v.jfif', slug: '6_mrbeast',   name: 'Мистер Бист',  xp: 600 }
];

const ORIG = path.join(DIR, 'originals');
const R1024 = path.join(DIR, 'round-1024');
const R512 = path.join(DIR, 'round-512');
const R128 = path.join(DIR, 'round-128');
[ORIG, R1024, R512, R128].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// 1) Переименование .jfif → .jpg в originals/
console.log('[1/3] Renaming originals...');
for (const m of MAP) {
  const from = path.join(DIR, m.src);
  const to   = path.join(ORIG, `${m.slug}.jpg`);
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to);
    console.log(`  ${m.src.slice(0, 40)}... → originals/${m.slug}.jpg`);
  } else if (fs.existsSync(to)) {
    console.log(`  ${m.slug}.jpg already in originals/`);
  } else {
    console.warn(`  ⚠ Source not found: ${m.src}`);
  }
}

// 2) Круглая обрезка через puppeteer
async function cropRound(imgPath, outPath, size) {
  const base64 = fs.readFileSync(imgPath).toString('base64');
  const html = `<!DOCTYPE html><html><head><style>
    html,body{margin:0;padding:0;background:transparent;}
    .wrap{width:${size}px;height:${size}px;overflow:hidden;border-radius:50%;}
    .wrap img{width:100%;height:100%;object-fit:cover;display:block;}
  </style></head><body>
    <div class="wrap"><img src="data:image/jpeg;base64,${base64}"></div>
  </body></html>`;

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => new Promise(r => {
    const img = document.querySelector('img');
    if (img.complete) r();
    else img.onload = r;
  }));
  await page.screenshot({ path: outPath, type: 'png', omitBackground: true, fullPage: false, clip: { x: 0, y: 0, width: size, height: size } });
  await browser.close();
}

(async () => {
  console.log('\n[2/3] Generating round PNGs at 1024/512/128...');
  for (const m of MAP) {
    const orig = path.join(ORIG, `${m.slug}.jpg`);
    if (!fs.existsSync(orig)) continue;
    for (const [dir, size] of [[R1024, 1024], [R512, 512], [R128, 128]]) {
      const out = path.join(dir, `${m.slug}.png`);
      await cropRound(orig, out, size);
    }
    console.log(`  ✓ ${m.slug} (${m.name}, ${m.xp} XP)`);
  }

  console.log('\n[3/3] Cleanup: removing source .jfif files...');
  for (const m of MAP) {
    const from = path.join(DIR, m.src);
    if (fs.existsSync(from)) {
      fs.unlinkSync(from);
    }
  }
  console.log('\n✅ Done');
  console.log(`   Originals: ${ORIG}`);
  console.log(`   Round PNG: ${R1024}, ${R512}, ${R128}`);
})().catch(e => { console.error(e); process.exit(1); });
