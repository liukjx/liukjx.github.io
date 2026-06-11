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

const ABCJS_CSS = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/abcjs@6.2.2/dist/abcjs-audio.css">';

const ABCJS_SCRIPT = `
// ABC notation renderer with MIDI playback
(function() {
  var ABCJS_LOADED = false;
  var ABCJS_LOADING = false;
  var PENDING_RENDER = false;
  var MIDI_LOADED = false;
  var MIDI_LOADING = false;

  function loadScript(src, cb) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = cb;
    s.onerror = function() { console.warn('Failed to load:', src); };
    document.head.appendChild(s);
  }

  function loadAbcjs(cb) {
    if (ABCJS_LOADED) { cb(); return; }
    if (ABCJS_LOADING) { PENDING_RENDER = true; return; }
    ABCJS_LOADING = true;
    loadScript('https://cdn.jsdelivr.net/npm/abcjs@6.2.2/dist/abcjs-basic-min.js', function() {
      ABCJS_LOADED = true;
      ABCJS_LOADING = false;
      // Also load MIDI module for audio playback
      loadMidi();
      cb();
      if (PENDING_RENDER) { PENDING_RENDER = false; renderAbc(); }
    });
  }

  function loadMidi() {
    if (MIDI_LOADED || MIDI_LOADING) return;
    MIDI_LOADING = true;
    loadScript('https://cdn.jsdelivr.net/npm/abcjs@6.2.2/dist/abcjs-midi.js', function() {
      MIDI_LOADED = true;
      MIDI_LOADING = false;
    });
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

        // Render visual notation
        var visualObj = ABCJS.renderAbc(el, data, { responsive: 'resize', staffwidth: 740 });

        // Add play controls if MIDI is available
        addAudioControls(el, visualObj, data);
      } catch(e) {
        el.innerHTML = '<div style="color:red;padding:1em;border:1px solid red">五线谱渲染失败: ' + e.message + '</div>';
      }
    });
  }

  function addAudioControls(el, visualObj, data) {
    // Try to add playback - poll until ABCJS.synth is available
    var attempts = 0;
    function tryAddControls() {
      if (window.ABCJS.synth && visualObj && visualObj[0]) {
        var audioDiv = document.createElement('div');
        audioDiv.className = 'abc-audio-controls';
        el.parentNode.insertBefore(audioDiv, el.nextSibling);

        var synth = new ABCJS.synth.SynthController();
        synth.load(audioDiv, null, {
          displayLoop: true,
          displayRestart: true,
          displayPlay: true,
          displayProgress: true,
          displayWarp: false,
        });
        synth.setTune(visualObj[0], false, { program: 0 });
        return;
      }
      attempts++;
      if (attempts < 30) {
        setTimeout(tryAddControls, 200);
      }
    }
    tryAddControls();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAbc);
  } else {
    renderAbc();
  }

  // Quartz SPA navigation
  document.addEventListener('nav', function() { setTimeout(renderAbc, 200); });
})();
`;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('abc-notation-render')) return;
  
  // Inject CSS into <head>
  content = content.replace('</head>', ABCJS_CSS + '\n</head>');
  // Inject JS before </body>
  content = content.replace('</body>', '<script>' + ABCJS_SCRIPT + '\n</script>\n</body>');
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
