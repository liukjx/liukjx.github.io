/**
 * process-tikz.js — Quartz post-build for ```tikz blocks
 *
 * Pre-compiles TikZ to SVG using latex + dvisvgm.
 * Supports ALL packages (circuitikz, pgfplots, tikz-cd, chemfig, ...).
 * Output is pure SVG — no WASM, no CDN, instant loading.
 *
 * Usage: node scripts/process-tikz.js <public-dir>
 */

var fs = require('fs'), path = require('path'), cp = require('child_process');
var dir = process.argv[2];
if (!dir) { console.error('Usage: node scripts/process-tikz.js <public-dir>'); process.exit(1); }

var tmpDir = path.join(dir, '.tikz-tmp');
var blockCount = 0;
var TEX_HEADER = ''
  + '\\documentclass[tikz,border=2pt]{standalone}\n'
  + '\\usepackage{amsmath,amssymb,amsfonts}\n'
  + '\\usepackage{pgfplots}\n'
  + '\\usepackage{circuitikz}\n'
  + '\\usepackage{tikz-cd}\n'
  + '\\usepackage{chemfig}\n'
  + '\\pgfplotsset{compat=1.18}\n';

function compileTikz(code) {
  var id = 'tikz-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  var texContent = code;

  // If user omitted \documentclass, add header
  if (texContent.indexOf('\\documentclass') === -1) {
    texContent = TEX_HEADER + texContent;
  } else {
    // Insert extra packages after \documentclass
    texContent = texContent.replace('\\documentclass{standalone}',
      '\\documentclass[tikz,border=2pt]{standalone}');
    texContent = texContent.replace('\\begin{document}',
      '\\usepackage{amsmath,amssymb,amsfonts,pgfplots,circuitikz,tikz-cd,chemfig}\n'
      + '\\pgfplotsset{compat=1.18}\n'
      + '\\begin{document}');
  }

  fs.mkdirSync(tmpDir, { recursive: true });
  var texPath = path.join(tmpDir, id + '.tex');
  fs.writeFileSync(texPath, texContent, 'utf-8');

  try {
    // Step 1: latex
    var r1 = cp.spawnSync('latex', [
      '-interaction=nonstopmode',
      '-halt-on-error',
      '-output-directory=' + tmpDir,
      texPath
    ], { timeout: 30000, stdio: 'pipe' });

    if (r1.status !== 0 && r1.status !== 1) {
      // check for fatal error
      var log = r1.stderr.toString() + r1.stdout.toString();
      if (log.indexOf('Fatal') !== -1) return { error: 'latex failed' };
    }

    var dviPath = path.join(tmpDir, id + '.dvi');
    if (!fs.existsSync(dviPath)) {
      // Maybe didn't produce DVI, try to find what was produced
      return { error: 'No DVI output' };
    }

    // Step 2: dvisvgm
    var svgPath = path.join(tmpDir, id + '.svg');
    var r2 = cp.spawnSync('dvisvgm', [
      '--no-fonts',
      '--exact',
      '-o', svgPath,
      dviPath
    ], { timeout: 30000, stdio: 'pipe' });

    if (r2.status !== 0) return { error: 'dvisvgm failed' };
    if (!fs.existsSync(svgPath)) return { error: 'No SVG output' };

    var svg = fs.readFileSync(svgPath, 'utf-8');
    // Extract just the <svg> tag content, removing <?xml?> and DOCTYPE
    var match = svg.match(/<svg[\s\S]*?<\/svg>/i);
    if (!match) return { error: 'Invalid SVG' };

    return { svg: match[0] };
  } catch(e) {
    return { error: e.message };
  } finally {
    // Cleanup temp files
    try {
      ['.tex', '.log', '.aux', '.dvi', '.svg', '.ps'].forEach(function(ext) {
        var f = path.join(tmpDir, id + ext);
        if (fs.existsSync(f)) fs.unlinkSync(f);
      });
    } catch(e) {}
  }
}

function proc(fp, html) {
  var re = /(?:<figure[^>]*>)?\s*<pre[^>]*(?:data-language="tikz"|class="[^"]*\blanguage-tikz\b[^"]*")[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>\s*(?:<\/figure>)?/g;
  return html.replace(re, function(m, c) {
    var code = strip(decode(c)).trim();
    if (!code) return m;
    blockCount++;
    var result = compileTikz(code);
    if (result.error) {
      console.log('  ✗ Failed to compile: ' + result.error);
      return '<div style="padding:1em;background:#ff6b6b22;border:1px solid #ff6b6b;border-radius:8px;margin:1em 0;font-size:14px;">'
        + '⚠️ TikZ compilation failed: ' + result.error
        + '</div>';
    }
    // Wrap SVG with a container div
    console.log('  ✓ Compiled diagram #' + blockCount);
    return '<div class="tikz-rendered" style="margin:1em 0;text-align:center;">'
      + result.svg
      + '</div>';
  });
}

function strip(s) { return s.replace(/<[^>]*>/g, ''); }
function decode(s) { return s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#x27;/g,"'").replace(/&#x2F;/g,'/'); }

function scan(d) {
  var entries = fs.readdirSync(d, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i], p = path.join(d, e.name);
    if (e.isDirectory() && e.name !== '.tikz-tmp') scan(p);
    else if (e.isFile() && e.name.endsWith('.html')) {
      var c = fs.readFileSync(p, 'utf-8'), o = proc(p, c);
      if (o !== c) { fs.writeFileSync(p, o, 'utf-8'); console.log('  File: ' + path.relative(dir, p)); }
    }
  }
}

console.log('Compiling TikZ diagrams to SVG...');
scan(dir);
// Cleanup tmp dir
try { fs.rmSync(tmpDir, { recursive: true }); } catch(e) {}
console.log('Done. ' + blockCount + ' diagram(s).');