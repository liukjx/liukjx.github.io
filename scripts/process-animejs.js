/**
 * process-animejs.js
 *
 * Post-build script for Quartz: converts ```anime code blocks
 * into live Anime.js animations.
 *
 * Usage: node scripts/process-animejs.js <public-dir>
 *
 * Markdown syntax:
 *
 *   Raw Anime.js code (use `container` variable for the wrapper div):
 *   ```anime
 *   var ball = document.createElement('div');
 *   ball.style.cssText = 'width:40px;height:40px;background:#ff6b6b;border-radius:50%;';
 *   container.appendChild(ball);
 *   anime({ targets: ball, translateX: 200, duration: 1500 });
 *   ```
 *
 *   Inline target boxes:
 *   ```anime-box
 *   targets:
 *     #a1 100px 100px #ff6b6b  弹
 *     #a2 100px 100px #4ecdc4  性
 *   animation:
 *     translateY: [0, -30]
 *     rotate: [0, 360]
 *     duration: 1200
 *     delay: anime.stagger(150)
 *     direction: alternate
 *     loop: true
 *   ```
 *
 *   SVG line draw:
 *   ```anime-line
 *   paths:
 *     - M 50 200 L 100 40 L 150 200
 *   color: #4ecdc4
 *   strokeWidth: 4
 *   duration: 2500
 *   ```
 *
 *   Stagger grid:
 *   ```anime-stagger
 *   count: 25
 *   layout: grid
 *   color: #ff6b6b
 *   animation:
 *     scale: [0, 1]
 *     rotate: [0, 360]
 *     delay: anime.stagger(60)
 *     duration: 800
 *     easing: 'easeOutElastic(1, .5)'
 *   ```
 */

const fs = require('fs');
const path = require('path');

const ANIME_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js';

const publicDir = process.argv[2];
if (!publicDir) {
  console.error('Usage: node scripts/process-animejs.js <public-dir>');
  process.exit(1);
}

let blockCounter = 0;

function processHtml(filePath, html) {
  const regex = /(?:<figure[^>]*>)?\s*<pre[^>]*(?:data-language="(anime(?:-box|-line|-stagger)?)"|class="[^"]*\blanguage-(anime(?:-box|-line|-stagger)?)\b[^"]*")[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>\s*(?:<\/figure>)?/g;

  return html.replace(regex, function (match, lang1, lang2, encodedCode) {
    const lang = lang1 || lang2;
    blockCounter++;
    const cid = 'anime-container-' + blockCounter;

    const rawContent = decodeHtmlEntities(stripHtmlTags(encodedCode));
    if (!rawContent.trim()) return match;

    // Handle different modes
    if (lang === 'anime-box') {
      return renderBoxMode(cid, rawContent);
    } else if (lang === 'anime-line') {
      return renderLineMode(cid, rawContent);
    } else if (lang === 'anime-stagger') {
      return renderStaggerMode(cid, rawContent);
    } else {
      // Default: raw Anime.js code
      return renderRawCode(cid, rawContent);
    }
  });
}

function renderRawCode(cid, code) {
  const safeCode = code.replace(/<\/script>/gi, '<\\/script>');
  const funcName = 'initAnime_' + cid.replace(/-/g, '_');

  return [
    `<div id="${cid}" style="position:relative;min-height:60px;margin:0.8em 0;"></div>`,
    `<script>`,
    `(function(){`,
    `  var el = document.getElementById('${cid}');`,
    `  if (!el || el.dataset.animeInit) return;`,
    `  el.dataset.animeInit = '1';`,
    `  if (typeof anime === 'undefined') {`,
    `    var s = document.createElement('script');`,
    `    s.src = '${ANIME_CDN}';`,
    `    s.onload = function() {`,
    `      var container = el;`,
    `      try { ${safeCode} }`,
    `      catch(e) { el.innerHTML = '<pre style=\\"color:#ff6b6b;padding:0.5em;font-size:13px;\\">Anime.js error: ' + e.message + '</pre>'; }`,
    `    };`,
    `    document.head.appendChild(s);`,
    `  } else {`,
    `    var container = el;`,
    `    try { ${safeCode} }`,
    `    catch(e) { el.innerHTML = '<pre style=\\"color:#ff6b6b;padding:0.5em;font-size:13px;\\">Anime.js error: ' + e.message + '</pre>'; }`,
    `  }`,
    `})();`,
    `</script>`
  ].join('\n');
}

function renderBoxMode(cid, content) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);

  const targets = [];
  let inTargets = false;
  let inAnim = false;
  let animLines = [];

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l === 'targets:') { inTargets = true; inAnim = false; continue; }
    if (l === 'animation:') { inTargets = false; inAnim = true; continue; }
    if (inTargets) targets.push(parseTargetLine(l));
    if (inAnim) animLines.push(l);
  }

  let targetHtml = '';
  const targetSelectors = [];
  targets.forEach((t, i) => {
    if (!t) return;
    targetSelectors.push(`#${t.id}`);
    targetHtml += `<div id="${t.id}" style="display:inline-flex;align-items:center;justify-content:center;width:${t.w};height:${t.h};background:${t.color};color:#fff;border-radius:8px;margin:4px;font-size:13px;font-weight:bold;">${t.label || ''}</div>`;
  });

  const animObj = buildAnimObject(animLines, targetSelectors.join(', '));

  return [
    `<div id="${cid}" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;padding:1em;background:#1a1a2e;border-radius:12px;margin:1em 0;min-height:120px;">`,
    `  ${targetHtml}`,
    `</div>`,
    `<script>`,
    `(function(){`,
    `  var c = document.getElementById('${cid}');`,
    `  if (!c || c.dataset.animeInit) return;`,
    `  c.dataset.animeInit = '1';`,
    `  function run() {`,
    `    anime({`,
    `      targets: '${escapeStr(targetSelectors.join(', '))}',`,
    `      ${animObj}`,
    `    });`,
    `  }`,
    `  if (typeof anime === 'undefined') {`,
    `    var s = document.createElement('script');`,
    `    s.src = '${ANIME_CDN}';`,
    `    s.onload = run;`,
    `    document.head.appendChild(s);`,
    `  } else { run(); }`,
    `})();`,
    `</script>`
  ].join('\n');
}

function renderLineMode(cid, content) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  let paths = [];
  let color = '#ff6b6b';
  let strokeWidth = 3;
  let duration = 2000;

  let inPaths = false;
  for (const l of lines) {
    if (l.startsWith('paths:')) { inPaths = true; continue; }
    if (l.startsWith('color:')) { color = l.split(':')[1].trim(); inPaths = false; continue; }
    if (l.startsWith('strokeWidth:')) { strokeWidth = parseInt(l.split(':')[1], 10) || 3; inPaths = false; continue; }
    if (l.startsWith('duration:')) { duration = parseInt(l.split(':')[1], 10) || 2000; inPaths = false; continue; }
    if (inPaths && l.startsWith('-')) { paths.push(l.replace(/^-\s*/, '')); }
  }

  if (!paths.length) return '';

  const pathD = paths.join(' ');

  return [
    `<div id="${cid}" style="position:relative;width:100%;max-width:500px;height:250px;background:#1a1a2e;border-radius:12px;margin:1em auto;overflow:hidden;">`,
    `  <svg viewBox="0 0 500 250" style="width:100%;height:100%;">`,
    `    <path id="${cid}-path" d="${pathD}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`,
    `  </svg>`,
    `</div>`,
    `<script>`,
    `(function(){`,
    `  var c = document.getElementById('${cid}');`,
    `  if (!c || c.dataset.animeInit) return;`,
    `  c.dataset.animeInit = '1';`,
    `  var path = document.getElementById('${cid}-path');`,
    `  function run() {`,
    `    var len = path.getTotalLength();`,
    `    path.style.strokeDasharray = len;`,
    `    anime({`,
    `      targets: path,`,
    `      strokeDashoffset: [len, 0],`,
    `      duration: ${duration},`,
    `      easing: 'easeInOutQuad',`,
    `      loop: true`,
    `    });`,
    `  }`,
    `  if (typeof anime === 'undefined') {`,
    `    var s = document.createElement('script');`,
    `    s.src = '${ANIME_CDN}';`,
    `    s.onload = run;`,
    `    document.head.appendChild(s);`,
    `  } else { run(); }`,
    `})();`,
    `</script>`
  ].join('\n');
}

function renderStaggerMode(cid, content) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  let count = 20;
  let layout = 'row';
  let color = '#ff6b6b';
  let animLines = [];
  let inAnim = false;

  for (const l of lines) {
    if (l.startsWith('count:')) { count = parseInt(l.split(':')[1], 10) || 20; continue; }
    if (l.startsWith('layout:')) { layout = l.split(':')[1].trim(); continue; }
    if (l.startsWith('color:')) { color = l.split(':')[1].trim(); continue; }
    if (l === 'animation:') { inAnim = true; continue; }
    if (inAnim) animLines.push(l);
  }

  const cols = layout === 'row' ? count : Math.ceil(Math.sqrt(count));
  const containerStyle = layout === 'row'
    ? 'display:flex;flex-wrap:wrap;gap:6px;padding:1em;background:#1a1a2e;border-radius:12px;margin:1em 0;justify-content:center;'
    : 'display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:6px;padding:1em;background:#1a1a2e;border-radius:12px;margin:1em 0;';

  let itemsHtml = '';
  for (let i = 0; i < count; i++) {
    itemsHtml += `<div class="${cid}-item" style="width:30px;height:30px;background:${color};border-radius:4px;"></div>`;
  }

  const animObj = buildAnimObject(animLines, `.${cid}-item`);

  return [
    `<div id="${cid}" style="${containerStyle}">`,
    `  ${itemsHtml}`,
    `</div>`,
    `<script>`,
    `(function(){`,
    `  var c = document.getElementById('${cid}');`,
    `  if (!c || c.dataset.animeInit) return;`,
    `  c.dataset.animeInit = '1';`,
    `  function run() {`,
    `    anime({`,
    `      targets: '.${cid}-item',`,
    `      ${animObj}`,
    `    });`,
    `  }`,
    `  if (typeof anime === 'undefined') {`,
    `    var s = document.createElement('script');`,
    `    s.src = '${ANIME_CDN}';`,
    `    s.onload = run;`,
    `    document.head.appendChild(s);`,
    `  } else { run(); }`,
    `})();`,
    `</script>`
  ].join('\n');
}

function parseTargetLine(line) {
  const parts = line.split(/\s+/);
  if (parts.length < 1 || !parts[0].startsWith('#')) return null;
  return {
    id: parts[0].replace(/^#/, ''),
    w: parts[1] || '80px',
    h: parts[2] || '80px',
    color: parts[3] || '#ff6b6b',
    label: parts.slice(4).join(' ') || ''
  };
}

function buildAnimObject(lines, targetSelector) {
  if (!lines.length) return '';
  const props = lines.map(l => {
    const idx = l.indexOf(':');
    if (idx === -1) return l;
    const key = l.substring(0, idx).trim();
    const val = l.substring(idx + 1).trim();
    // Auto-quote string values
    if (val.startsWith("'") || val.startsWith('"')) {
      // already quoted
    } else if (/^-?[\d.]+$/.test(val) || val === 'true' || val === 'false' || val === 'null') {
      // number or boolean or null
    } else if (val.startsWith('[') || val.startsWith('{') || val.startsWith('anime.') || val.startsWith('function')) {
      // array, object, anime expression, or function
    } else {
      // wrap in single quotes
      return `${key}: '${val}'`;
    }
    return `${key}: ${val}`;
  }).join(',\n    ');
  return props;
}

function escapeStr(s) {
  return s.replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function stripHtmlTags(str) {
  return str.replace(/<[^>]*>/g, '');
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const processed = processHtml(fullPath, content);
      if (processed !== content) {
        fs.writeFileSync(fullPath, processed, 'utf-8');
        console.log('  ✓ Processed: ' + path.relative(publicDir, fullPath));
      }
    }
  }
}

console.log('Processing Anime.js animations...');
scanDir(publicDir);
console.log('Done. Processed ' + blockCounter + ' block(s).');