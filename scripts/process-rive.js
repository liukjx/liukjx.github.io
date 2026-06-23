/**
 * process-rive.js
 *
 * Post-build script for Quartz: converts ```rive / ```rive-loop code blocks
 * into live Rive animations rendered on <canvas>.
 *
 * Usage: node scripts/process-rive.js <public-dir>
 *
 * Markdown syntax:
 *   ```rive state_machine=State Machine 1 src=/rive/robot.riv   ← 交互式状态机
 *   ::inputs::
 *   clickButton.fire()
 *   ```
 *
 *   ```rive-loop src=/rive/walk.riv animation=walk              ← 循环播放动画
 *   ```
 *
 *   ```rive-silent src=/rive/idle.riv animation=idle            ← 静默播放（无UI）
 *   ```
 *
 * 自动注入 @rive-app/canvas CDN，无需手动引用。
 */

const fs = require('fs');
const path = require('path');

const RIVE_CDN = 'https://unpkg.com/@rive-app/canvas@2.23.0';

const publicDir = process.argv[2];
if (!publicDir) {
  console.error('Usage: node scripts/process-rive.js <public-dir>');
  process.exit(1);
}

let blockCounter = 0;

function processHtml(filePath, html) {
  // Match:
  //   ```rive ...                           → 交互式状态机
  //   ```rive-loop ...                      → 循环动画
  //   ```rive-silent ...                    → 静默背景动画
  //
  // Parameters on the first line:
  //   state_machine=xxx src=xxx animation=xxx width=xxx height=xxx
  //
  // Followed by optional ::inputs:: section (for rive mode)
  const regex = /(?:<figure[^>]*>)?\s*<pre[^>]*(?:data-language="(rive(?:-loop|-silent)?)"|class="[^"]*\blanguage-(rive(?:-loop|-silent)?)\b[^"]*")[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>\s*(?:<\/figure>)?/g;

  return html.replace(regex, function (match, lang1, lang2, encodedCode) {
    const lang = lang1 || lang2;
    blockCounter++;

    const rawContent = decodeHtmlEntities(stripHtmlTags(encodedCode));
    if (!rawContent.trim()) return match;

    const lines = rawContent.split('\n');
    const header = lines[0].trim();

    // Parse parameters
    const params = parseParams(header);
    const src = params.src || '/rive/animation.riv';
    const stateMachine = params.state_machine || '';
    const animation = params.animation || '';
    const width = parseInt(params.width, 10) || 500;
    const height = parseInt(params.height, 10) || 400;
    const bg = params.bg || '#ffffff';
    const fit = params.fit || 'contain';
    const alignment = params.alignment || 'center';

    // Extract optional ::inputs:: section
    const inputSection = [];
    let inInputs = false;
    for (let i = 1; i < lines.length; i++) {
      const l = lines[i].trim();
      if (l === '::inputs::') { inInputs = true; continue; }
      if (inInputs && l) inputSection.push(l);
    }

    const cid = 'rive-container-' + blockCounter;

    // Build init function based on mode
    const isSilent = lang === 'rive-silent';
    const isLoop = lang === 'rive-loop';
    const mode = isSilent ? 'silent' : (isLoop ? 'loop' : 'interactive');

    let initCode = '';

    if (mode === 'loop' || mode === 'silent') {
      // Simple auto-play animation
      initCode = `
        const r = new Rive({
          src: '${escapeStr(src)}',
          canvas: document.getElementById('${cid}'),
          autoplay: true,
          ${animation ? `animations: '${escapeStr(animation)}',` : ''}
          layout: new Rive.Layout({ fit: Rive.Fit.${mapFit(fit)}, alignment: Rive.Alignment.${mapAlign(alignment)} }),
          onLoad: () => { r.resizeDrawingSurfaceToCanvas(); },
        });`;
    } else {
      // Interactive state machine mode
      const inputCode = inputSection.map(line => {
        // support: inputName.fire() or inputName.value = 0.5
        if (line.includes('.fire()')) {
          const name = line.split('.fire()')[0].trim();
          return `findInput('${escapeStr(name)}')?.fire();`;
        }
        if (line.includes('.value = ')) {
          const [name, val] = line.split('.value = ');
          return `findInput('${escapeStr(name.trim())}').value = ${val.trim()};`;
        }
        if (line.includes('=')) {
          const [name, val] = line.split('=');
          return `findInput('${escapeStr(name.trim())}').value = ${val.trim()};`;
        }
        return '';
      }).filter(Boolean).join('\n          ');

      initCode = `
        const r = new Rive({
          src: '${escapeStr(src)}',
          canvas: document.getElementById('${cid}'),
          autoplay: true,
          stateMachines: '${escapeStr(stateMachine || 'State Machine 1')}',
          layout: new Rive.Layout({ fit: Rive.Fit.${mapFit(fit)}, alignment: Rive.Alignment.${mapAlign(alignment)} }),
          onLoad: () => {
            r.resizeDrawingSurfaceToCanvas();
            const inputs = r.stateMachineInputs('${escapeStr(stateMachine || 'State Machine 1')}');
            const findInput = (name) => inputs.find(i => i.name === name);
            ${inputCode}
          },
        });

        // Click canvas to fire inputs
        document.getElementById('${cid}').addEventListener('click', (e) => {
          const inputs = r.stateMachineInputs('${escapeStr(stateMachine || 'State Machine 1')}');
          const findInput = (name) => inputs.find(i => i.name === name);
          ${inputCode}
        });`;
    }

    return [
      `<div class="rive-wrapper" style="position:relative;width:100%;max-width:${width}px;height:${height}px;border-radius:12px;overflow:hidden;background:${bg};margin:1em auto;">`,
      `  <canvas id="${cid}" style="width:100%;height:100%;"></canvas>`,
      '</div>',
      `<script>`,
      `(function(){`,
      `  var cid = '${cid}';`,
      `  var loaded = false;`,
      `  function initRive() {`,
      `    var canvas = document.getElementById(cid);`,
      `    if (!canvas || canvas.dataset.riveInit) return;`,
      `    canvas.dataset.riveInit = '1';`,
      `    ${initCode}`,
      `  }`,
      `  function loadRive() {`,
      `    if (loaded) return;`,
      `    loaded = true;`,
      `    var s = document.createElement('script');`,
      `    s.src = '${RIVE_CDN}';`,
      `    s.onload = initRive;`,
      `    document.head.appendChild(s);`,
      `  }`,
      `  if (document.readyState === 'loading') {`,
      `    document.addEventListener('DOMContentLoaded', loadRive);`,
      `  } else {`,
      `    loadRive();`,
      `  }`,
      `  document.addEventListener('nav', function() { setTimeout(loadRive, 300); });`,
      `})();`,
      `</script>`
    ].join('\n');
  });
}

function parseParams(header) {
  const params = {};
  // state_machine=xxx src=xxx etc.
  const re = /(\w+)=['"]?([^'"\s]+)['"]?/g;
  let m;
  while ((m = re.exec(header)) !== null) {
    params[m[1]] = m[2];
  }
  return params;
}

function mapFit(f) {
  const map = { contain: 'Contain', cover: 'Cover', fill: 'Fill', fitWidth: 'FitWidth', fitHeight: 'FitHeight', none: 'None', scaleDown: 'ScaleDown' };
  return map[f] || 'Contain';
}

function mapAlign(a) {
  const map = { center: 'Center', topLeft: 'TopLeft', topCenter: 'TopCenter', topRight: 'TopRight', centerLeft: 'CenterLeft', centerRight: 'CenterRight', bottomLeft: 'BottomLeft', bottomCenter: 'BottomCenter', bottomRight: 'BottomRight' };
  return map[a] || 'Center';
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

console.log('Processing Rive animations...');
scanDir(publicDir);
console.log('Done. Processed ' + blockCounter + ' block(s).');