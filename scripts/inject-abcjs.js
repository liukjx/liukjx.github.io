#!/usr/bin/env node
/**
 * Post-process built HTML: inject abcjs library and renderer into pages
 * that contain abc-notation-render elements.
 * 
 * Usage: node scripts/inject-abcjs.js <public-dir>
 */

const fs = require('fs');
const path = require('path');

const publicDir = process.argv[2];
if (!publicDir) {
  console.error('Usage: node inject-abcjs.js <public-dir>');
  process.exit(1);
}

const ABCJS_SCRIPT = `
<script>
// ABC notation renderer - loads abcjs on demand
(function() {
  var ABCJS_LOADED = false;
  var ABCJS_LOADING = false;
  var PENDING_RENDER = false;

  function loadAbcjs(cb) {
    if (ABCJS_LOADED) { cb(); return; }
    if (ABCJS_LOADING) { PENDING_RENDER = true; return; }
    ABCJS_LOADING = true;
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/abcjs@6.2.2/dist/abcjs-basic-min.js';
    s.onload = function() {
      ABCJS_LOADED = true;
      ABCJS_LOADING = false;
      cb();
      if (PENDING_RENDER) { PENDING_RENDER = false; renderAbc(); }
    };
    s.onerror = function() {
      console.warn('Failed to load abcjs library');
    };
    document.head.appendChild(s);
  }

  function renderAbc() {
    if (!window.ABCJS) {
      loadAbcjs(function() { renderAbc(); });
      return;
    }
    document.querySelectorAll('.abc-notation-render').forEach(function(el) {
      if (el.getAttribute('data-rendered')) return;
      var data = el.getAttribute('data-abc');
      if (!data) return;
      try {
        el.innerHTML = '';
        el.setAttribute('data-rendered', '1');
        ABCJS.renderAbc(el, data, { responsive: 'resize', staffwidth: 740 });
      } catch(e) {
        el.innerHTML = '<div style="color:red;padding:1em;border:1px solid red">五线谱渲染失败: ' + e.message + '</div>';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAbc);
  } else {
    renderAbc();
  }

  // SPA navigation re-render
  if (window.navigation) {
    window.navigation.addEventListener('navigate', function() { setTimeout(renderAbc, 150); });
  }
  // Fallback: also listen for popstate (back/forward navigation)
  window.addEventListener('popstate', function() { setTimeout(renderAbc, 150); });
})();
</script>`;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('abc-notation-render')) return;
  
  // Inject before </body>
  content = content.replace('</body>', ABCJS_SCRIPT + '\n</body>');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ✓ ${path.relative(publicDir, filePath)}`);
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.name.endsWith('.html')) {
      processFile(fullPath);
    }
  }
}

console.log(`Injecting abcjs into pages in ${publicDir}...`);
walkDir(publicDir);
console.log('Done.');
