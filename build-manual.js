// Конвертер TEAM_GUIDE.md → адаптивный HTML с GTA Vice City стилем
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const md = fs.readFileSync('designs/TEAM_GUIDE.md', 'utf8');

// Slugify для русского текста
function slugify(str) {
  const t = str
    .toLowerCase()
    .replace(/[<>"'`]/g, '')
    .replace(/[^a-zа-я0-9ё\s\-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return t;
}

// Кастомный renderer, который добавит id в h2/h3
const renderer = {
  heading({ tokens, depth }) {
    const rawText = tokens.map(t => t.raw || t.text || '').join('');
    const text = this.parser.parseInline(tokens);
    const id = slugify(rawText);
    return `<h${depth} id="${id}">${text}</h${depth}>\n`;
  }
};
marked.use({ gfm: true, breaks: false, renderer });

const body = marked.parse(md);

// Вытаскиваем TOC из первого <h2>Содержание</h2> блока (уже есть в MD)
// Вытаскиваем заголовки для sidebar-nav
const headings = [];
const re = /<(h2|h3)\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g;
let m;
while ((m = re.exec(body)) !== null) {
  headings.push({ level: m[1], id: m[2], text: m[3].replace(/<[^>]+>/g, '').trim() });
}

const navHTML = headings
  .filter(h => h.level === 'h2')
  .map(h => `<a href="#${h.id}" data-anchor="${h.id}">${h.text}</a>`)
  .join('\n');

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#1A0033">
<title>ТЕЛЕМОРЕ — Руководство команды</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
:root{
  --pink:#FF00AA;--cyan:#00F0FF;--gold:#FFD700;--danger:#FF0033;
  --bg1:#0F0020;--bg2:#1A0033;--bg3:#2D004D;
  --surface:rgba(255,255,255,0.04);--surface-hover:rgba(255,255,255,0.08);
  --border:rgba(255,255,255,0.1);--border-strong:rgba(255,255,255,0.2);
  --text:#fff;--text-dim:rgba(255,255,255,0.75);--text-muted:rgba(255,255,255,0.5);
  --code-bg:rgba(0,240,255,0.08);--code-border:rgba(0,240,255,0.25);
  --nav-w:280px;
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:80px}
body{
  font-family:'Roboto',-apple-system,sans-serif;font-size:15px;line-height:1.65;
  color:var(--text);background:var(--bg1);
  min-height:100vh;overflow-x:hidden;
}
body::before{content:"";position:fixed;inset:0;z-index:-1;
  background:
    linear-gradient(180deg,var(--bg1) 0%,var(--bg2) 50%,var(--bg1) 100%),
    radial-gradient(ellipse at 10% 0%,rgba(255,0,170,0.15),transparent 50%),
    radial-gradient(ellipse at 90% 100%,rgba(0,240,255,0.12),transparent 50%);
}

/* Header */
.header{
  position:sticky;top:0;z-index:50;
  background:rgba(15,0,32,0.85);backdrop-filter:blur(20px);
  border-bottom:1px solid var(--border);
  padding:12px 20px;
}
.header-inner{max-width:1440px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px;}
.logo{
  font-weight:900;font-size:22px;letter-spacing:2px;
  background:linear-gradient(90deg,var(--pink),var(--cyan));
  -webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 0 12px rgba(255,0,170,0.5));
  text-decoration:none;
}
.logo-sub{font-weight:500;color:var(--text-dim);font-size:13px;margin-left:12px;letter-spacing:1px;}
.header-links{display:flex;gap:8px;}
.btn-link{
  padding:8px 14px;border:1px solid var(--border-strong);border-radius:8px;
  color:var(--text-dim);text-decoration:none;font-size:13px;font-weight:600;
  transition:all .2s;
}
.btn-link:hover{border-color:var(--cyan);color:var(--cyan);background:rgba(0,240,255,0.08);}
.menu-btn{display:none;background:none;border:1px solid var(--border-strong);color:#fff;padding:8px 12px;border-radius:8px;cursor:pointer;}

/* Layout */
.layout{max-width:1440px;margin:0 auto;padding:24px 20px;display:grid;grid-template-columns:var(--nav-w) 1fr;gap:32px;}
.sidebar{position:sticky;top:80px;align-self:start;max-height:calc(100vh - 100px);overflow-y:auto;}
.sidebar-inner{
  background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px;
}
.sidebar h3{font-size:11px;font-weight:700;letter-spacing:2px;color:var(--cyan);margin-bottom:12px;text-transform:uppercase;}
.sidebar nav{display:flex;flex-direction:column;gap:2px;}
.sidebar a{
  padding:8px 12px;border-radius:6px;text-decoration:none;color:var(--text-dim);
  font-size:13px;line-height:1.4;transition:all .15s;display:block;border-left:3px solid transparent;
}
.sidebar a:hover{background:var(--surface-hover);color:var(--text);}
.sidebar a.active{background:linear-gradient(90deg,rgba(255,0,170,0.18),transparent);color:#fff;border-left-color:var(--pink);font-weight:600;}

/* Main */
.main{min-width:0;max-width:900px;}
.content{
  background:var(--surface);border:1px solid var(--border);border-radius:14px;
  padding:40px 48px;
}

/* Typography */
.content h1{display:none;} /* первый заголовок убран, он в header */
.content h2{
  font-size:28px;font-weight:900;margin-top:48px;margin-bottom:20px;letter-spacing:-0.5px;
  padding-top:12px;border-top:1px solid var(--border);
  color:#fff;
}
.content h2:first-of-type{margin-top:0;padding-top:0;border-top:none;}
.content h3{font-size:20px;font-weight:800;margin-top:32px;margin-bottom:14px;color:var(--gold);}
.content h4{font-size:16px;font-weight:700;margin-top:24px;margin-bottom:10px;color:var(--cyan);}
.content p{margin-bottom:16px;color:var(--text-dim);}
.content strong{color:#fff;font-weight:700;}
.content em{color:var(--gold);}
.content a{color:var(--cyan);text-decoration:none;border-bottom:1px dashed rgba(0,240,255,0.4);}
.content a:hover{color:var(--pink);border-bottom-color:var(--pink);}

/* Lists */
.content ul,.content ol{margin:0 0 16px 24px;color:var(--text-dim);}
.content li{margin-bottom:6px;}
.content li>p{margin-bottom:6px;}

/* Code */
.content code{
  font-family:'JetBrains Mono',monospace;font-size:0.9em;
  background:var(--code-bg);border:1px solid var(--code-border);border-radius:4px;
  padding:2px 6px;color:var(--cyan);
}
.content pre{
  position:relative;
  background:rgba(0,0,0,0.35);border:1px solid var(--border);border-radius:10px;
  padding:16px 20px;margin:20px 0;overflow-x:auto;
  box-shadow:inset 0 0 20px rgba(0,240,255,0.04);
}
.content pre code{background:none;border:none;padding:0;color:#e8e8f0;font-size:13px;line-height:1.6;}
.copy-btn{
  position:absolute;top:8px;right:8px;
  background:rgba(255,255,255,0.06);border:1px solid var(--border);color:var(--text-dim);
  padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;
  cursor:pointer;font-family:inherit;letter-spacing:0.5px;
  opacity:0;transition:all .15s;
}
.content pre:hover .copy-btn{opacity:1;}
.copy-btn:hover{background:rgba(0,240,255,0.15);border-color:var(--cyan);color:var(--cyan);}
.copy-btn.copied{background:rgba(255,0,170,0.2);border-color:var(--pink);color:var(--pink);}

/* Tables */
.content table{
  width:100%;border-collapse:separate;border-spacing:0;
  margin:20px 0;font-size:13px;
  border:1px solid var(--border);border-radius:10px;overflow:hidden;
}
.content th{
  background:rgba(255,0,170,0.1);color:#fff;font-weight:700;text-align:left;
  padding:12px 14px;font-size:12px;letter-spacing:1px;text-transform:uppercase;
  border-bottom:1px solid var(--border);
}
.content td{padding:10px 14px;border-bottom:1px solid var(--border);color:var(--text-dim);}
.content tr:last-child td{border-bottom:none;}
.content tr:hover td{background:var(--surface-hover);}

/* Blockquote / callout */
.content blockquote{
  margin:20px 0;padding:14px 20px;
  background:rgba(255,215,0,0.06);border-left:4px solid var(--gold);border-radius:6px;
  color:var(--text-dim);
}
.content blockquote p{margin:0;}

/* hr */
.content hr{border:none;height:1px;background:var(--border);margin:32px 0;}

/* Footer */
.footer{
  text-align:center;margin-top:48px;padding:24px;color:var(--text-muted);font-size:12px;
  border-top:1px solid var(--border);
}
.footer a{color:var(--cyan);}

/* Responsive */
@media (max-width:960px){
  .layout{grid-template-columns:1fr;gap:20px;}
  .sidebar{position:fixed;top:0;left:0;right:0;bottom:0;z-index:100;
    background:rgba(15,0,32,0.98);backdrop-filter:blur(20px);
    max-height:none;padding:80px 20px 20px;
    transform:translateX(-100%);transition:transform .25s;overflow-y:auto;}
  .sidebar.open{transform:translateX(0);}
  .sidebar-inner{background:none;border:none;padding:0;}
  .menu-btn{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;}
  .content{padding:28px 22px;}
  .content h2{font-size:24px;}
  .content h3{font-size:18px;}
  .logo{font-size:20px;}
  .logo-sub{display:none;}
  .header-links .btn-link.hide-mobile{display:none;}
}
@media (max-width:520px){
  .content{padding:22px 18px;}
  .content pre{padding:12px 14px;font-size:12px;}
  .content table{display:block;overflow-x:auto;}
}

/* Scrollbar */
::-webkit-scrollbar{width:8px;height:8px;}
::-webkit-scrollbar-track{background:rgba(255,255,255,0.03);}
::-webkit-scrollbar-thumb{background:rgba(255,0,170,0.3);border-radius:4px;}
::-webkit-scrollbar-thumb:hover{background:rgba(255,0,170,0.5);}
</style>
</head>
<body>

<header class="header">
  <div class="header-inner">
    <div>
      <a href="#" class="logo">TELEMORE</a>
      <span class="logo-sub">ГИД КОМАНДЫ</span>
    </div>
    <div class="header-links">
      <a class="btn-link hide-mobile" href="https://design.telemore.org">Design</a>
      <a class="btn-link hide-mobile" href="https://app.telemore.org">App</a>
      <a class="btn-link hide-mobile" href="https://github.com/ircitdev/telemore-design">GitHub</a>
      <button class="menu-btn" id="menuBtn">☰ Меню</button>
    </div>
  </div>
</header>

<div class="layout">
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-inner">
      <h3>НАВИГАЦИЯ</h3>
      <nav>
        ${navHTML}
      </nav>
    </div>
  </aside>

  <main class="main">
    <article class="content">
      ${body}
    </article>
    <div class="footer">
      <p>ТЕЛЕМОРЕ Design Team • <a href="https://github.com/ircitdev/telemore-design">GitHub</a> • <a href="mailto:design@telemore.org">design@telemore.org</a></p>
    </div>
  </main>
</div>

<script>
(function(){
  const btn = document.getElementById('menuBtn');
  const sb = document.getElementById('sidebar');
  btn.addEventListener('click', () => sb.classList.toggle('open'));
  // Закрыть меню при клике по ссылке в мобильной версии
  sb.querySelectorAll('a').forEach(a => a.addEventListener('click', () => sb.classList.remove('open')));

  // Active section tracking
  const links = Array.from(document.querySelectorAll('.sidebar a[data-anchor]'));
  const targets = links.map(a => document.getElementById(a.dataset.anchor)).filter(Boolean);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.dataset.anchor === e.target.id));
      }
    });
  }, { rootMargin: '-80px 0px -60% 0px' });
  targets.forEach(t => observer.observe(t));

  // Copy code buttons
  document.querySelectorAll('pre').forEach(pre => {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.textContent = 'COPY';
    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code') || pre;
      try {
        await navigator.clipboard.writeText(code.textContent);
        btn.textContent = 'COPIED ✓';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'COPY'; btn.classList.remove('copied'); }, 1500);
      } catch(e) {
        btn.textContent = 'ERR';
      }
    });
    pre.appendChild(btn);
  });
})();
</script>

</body>
</html>
`;

fs.writeFileSync('manual/index.html', html);
console.log('✅ manual/index.html written:', html.length, 'bytes');
console.log('   Headings indexed:', headings.length);
