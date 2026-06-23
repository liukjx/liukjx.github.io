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
 *   Direct code (raw Anime.js):
 *   ```anime
 *   anime({
 *     targets: '.my-el',
 *     translateX: 250,
 *     duration: 1500,
 *     easing: 'easeInOutQuad'
 *   });
 *   ```
 *
 *   With inline elements (creates a container + target elements):
 *   ```anime-box
 *   // targets block will be rendered as divs inside the container
 *   targets:
 *     #box1 200px 100px #ff6b6b  Left
 *     #box2 200px 100px #4ecdc4  Right
 *   animation:
 *     targets: '#box1, #box2'
 *     translateX: 250
 *     duration: 1200
 *     direction: alternate
 *     loop: true
 *     easing: 'easeInOutQuad'
 *   ```
 *
 *   SVG line draw:
 *   ```anime-line
 *   // Draws a line/path segment by segment
 *   paths:
 *     - M 50 200 L 120 150 L 190 80 L 260 110 L 330 60 L 400 80
 *   color: #ff6b6b
 *   strokeWidth: 3
 *   duration: 2000
 *   ```
 *
 *   Stagger / list animation:
 *   ```anime-stagger
 *   // Creates a grid of items and staggers them
 *   count: 20
 *   layout: row            // row | grid
 *   color: #ff6b6b
 *   animation:
 *     scale: [0, 1]
 *     rotate: [0, 360]
 *     delay: anime.stagger(80)
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

  return [
    `<div id="${cid}" style="position:relative;min-height:60px;margin:0.8em 0;"></div>`,
    `<script src="${ANIME_CDN}"></script>`,
    `<script>`,
    `(function(){`,
    `  var el = document.getElementById('${cid}');`,
    `  if (!el || el.dataset.animeInit) return;`,
    `  el.dataset.animeInit = '1';`,
    `  try {`,
    `    ${safeCode}`,
    `  } catch(e) {`,
    `    el.innerHTML = '<pre style="color:#ff6b6b;padding:0.5em;font-size:13px;">Anime.js error: ' + e.message + '</pre>';`,
    `  }`,
    `})();`,
    `</script>`
  ].join('\n');
}

function renderBoxMode(cid, content) {
  // Parse targets and animation sections
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

  // Build target HTML
  let targetHtml = '';
  const targetSelectors = [];
  targets.forEach((t, i) => {
    if (!t) return;
    targetSelectors.push(`#${t.id}`);
    targetHtml += `<div id="${t.id}" style="display:inline-flex;align-items:center;justify-content:center;width:${t.w};height:${t.h};background:${t.color};color:#fff;border-radius:8px;margin:4px;font-size:13px;font-weight:bold;opacity:0;">${t.label || ''}</div>`;
  });

  // Build animation object
  const animObj = buildAnimObject(animLines, targetSelectors.join(', '));

  return [
    `<div id="${cid}" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;padding:1em;background:#1a1a2e;border-radius:12px;margin:1em 0;min-height:120px;">`,
    `  ${targetHtml}`,
    `</div>`,
    `<script src="${ANIME_CDN}"></script>`,
    `<script>`,
    `(function(){`,
    `  var c = document.getElementById('${cid}');`,
    `  if (!c || c.dataset.animeInit) return;`,
    `  c.dataset.animeInit = '1';`,
    `  anime({`,
    `    targets: '${escapeStr(targetSelectors.join(', '))}',`,
    `    opacity: [0, 1],`,
    `    ${animObj}`,
    `  });`,
    `})();`,
    `</script>`
  ].join('\n');
}

function renderLineMode(cid, content) {
  // Parse paths and options
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  let paths = [];
  let color = '#ff6b6b';
  let strokeWidth = 3;
  let duration = 2000;

  let inPaths = false;
  for (const l of lines) {
    if (l.startsWith('paths:')) { inPaths = true; continue; }
    if (l.startsWith('color:')) { color = l.split(':')[1].trim(); inPaths = false; continue; }
    if (l.startsWith('strokeWidth:')) { strokeWidth = l.split(':')[1].trim(); inPaths = false; continue; }
    if (l.startsWith('duration:')) { duration = l.split(':')[1].trim(); inPaths = false; continue; }
    if (inPaths && l.startsWith('-')) { paths.push(l.replace(/^-\s*/, '')); }
  }

  if (!paths.length) return '';

  const pathD = paths.join(' ');

  // Create SVG with a single path for draw animation
  return [
    `<div id="${cid}" style="position:relative;width:100%;max-width:500px;height:250px;background:#1a1a2e;border-radius:12px;margin:1em auto;overflow:hidden;">`,
    `  <svg viewBox="0 0 500 250" style="width:100%;height:100%;">`,
    `    <path id="${cid}-path" d="${pathD}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`,
    `  </svg>`,
    `</div>`,
    `<script src="${ANIME_CDN}"></script>`,
    `<script>`,
    `(function(){`,
    `  var c = document.getElementById('${cid}');`,
    `  if (!c || c.dataset.animeInit) return;`,
    `  c.dataset.animeInit = '1';`,
    `  anime({`,
    `    targets: '#${cid}-path',`,
    `    strokeDashoffset: [anime.setDashoffset, 0],`,
    `    duration: ${duration},`,
    `    easing: 'easeInOutQuad',`,
    `    loop: true,`,
    `    direction: 'normal'`,
    `  });`,
    `})();`,
    `</script>`
  ].join('\n');
}

function renderStaggerMode(cid, content) {
  // Parse stagger config
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

  // Build grid of boxes
  let itemsHtml = '';
  const cols = layout === 'row' ? count : Math.ceil(Math.sqrt(count));
  const style = layout === 'row'
    ? 'display:inline-flex;flex-wrap:nowrap;gap:6px;'
    : 'display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:6px;';

  for (let i = 0; i < count; i++) {
    itemsHtml += `<div class="${cid}-item" style="width:30px;height:30px;background:${color};border-radius:4px;opacity:0;transform:scale(0);"></div>`;
  }

  const animObj = buildAnimObject(animLines, `.${cid}-item`);

  return [
    `<div id="${cid}" style="${style}padding:1em;background:#1a1a2e;border-radius:12px;margin:1em 0;justify-content:center;">`,
    `  ${itemsHtml}`,
    `</div>`,
    `<script src="${ANIME_CDN}"></script>`,
    `<script>`,
    `(function(){`,
    `  var c = document.getElementById('${cid}');`,
    `  if (!c || c.dataset.animeInit) return;`,
    `  c.dataset.animeInit = '1';`,
    `  anime({`,
    `    targets: '.${cid}-item',`,
    `    opacity: [0, 1],`,
    `    scale: [0, 1],`,
    `    ${animObj}`,
    `  });`,
    `})();`,
    `</script>`
  ].join('\n');
}

function parseTargetLine(line) {
  // #id width height color label
  const parts = line.split(/\s+/);
  if (parts.length < 1) return null;
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
  // Lines are like: key: value
  const props = lines.map(l => {
    const idx = l.indexOf(':');
    if (idx === -1) return l;  // raw expression
    const key = l.substring(0, idx).trim();
    const val = l.substring(idx + 1).trim();
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