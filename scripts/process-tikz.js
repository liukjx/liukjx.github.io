/**
 * process-tikz.js — Quartz post-build for ```tikz blocks
 *
 * Uses tikzjax.com CDN (basic TikZ only, no external packages).
 * Diagrams with \usepackage will show a note on the web.
 *
 * Usage: node scripts/process-tikz.js <public-dir>
 */

var fs = require('fs'), path = require('path');
var CDN = 'https://tikzjax.com/v1/tikzjax.js';
var dir = process.argv[2];
if (!dir) { console.error('Usage: node scripts/process-tikz.js <public-dir>'); process.exit(1); }

var blockCount = 0, skipped = 0, tikzPages = {};

function proc(fp, html) {
  var re = /(?:<figure[^>]*>)?\s*<pre[^>]*(?:data-language="tikz"|class="[^"]*\blanguage-tikz\b[^"]*")[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>\s*(?:<\/figure>)?/g;
  return html.replace(re, function(m, c) {
    var code = strip(decode(c)).trim();
    if (!code) return m;
    if (code.indexOf('\\begin{document}') === -1)
      code = '\\begin{document}\n' + code + '\n\\end{document}';

    // Check for unsupported packages
    var hasPackages = /\\usepackage(\[.*?\])?\{[^}]+\}/.test(code);

    if (hasPackages) {
      skipped++;
      return '<div style="padding:1em;background:#ff6b6b22;border:1px solid #ff6b6b44;border-radius:8px;margin:1em 0;font-size:14px;color:var(--dark,#333)">'
        + '⚠️ This TikZ diagram uses packages not available on the web CDN. '
        + 'View it locally in Obsidian with the tikzjax plugin.'
        + '</div>';
    }

    blockCount++;
    tikzPages[fp] = true;
    return '<script type="text/tikz">\n' + code.replace(/<\/script>/gi, '<\\/script>') + '\n</script>';
  });
}

function inject(html) {
  var s = '\n<script src="' + CDN + '"><\/script>\n';
  var nav = '\n<script>document.addEventListener("nav",function(){var s=document.createElement("script");s.src="' + CDN + '";document.body.appendChild(s)});<\/script>\n';
  var i = html.lastIndexOf('</body>');
  return i === -1 ? html + s + nav : html.slice(0, i) + s + nav + html.slice(i);
}

function strip(s) { return s.replace(/<[^>]*>/g, ''); }
function decode(s) { return s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#x27;/g,"'").replace(/&#x2F;/g,'/'); }

function scan(d) {
  var entries = fs.readdirSync(d, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i], p = path.join(d, e.name);
    if (e.isDirectory()) scan(p);
    else if (e.isFile() && e.name.endsWith('.html')) {
      var c = fs.readFileSync(p, 'utf-8'), o = proc(p, c);
      if (o !== c) { fs.writeFileSync(p, o, 'utf-8'); console.log('  TikZ: ' + path.relative(dir, p)); }
    }
  }
}

console.log('Processing TikZ...');
scan(dir);
Object.keys(tikzPages).forEach(function(fp) {
  var c = fs.readFileSync(fp, 'utf-8');
  fs.writeFileSync(fp, inject(c), 'utf-8');
});
console.log('Done. ' + blockCount + ' rendered, ' + skipped + ' skipped (needs packages).');