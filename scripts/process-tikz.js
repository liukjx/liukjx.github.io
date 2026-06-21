/**
 * process-tikz.js — Quartz post-build: convert ```tikz blocks to SVG via @drgrice1/tikzjax
 *
 * Usage: node scripts/process-tikz.js <public-dir>
 */

var fs = require('fs'), path = require('path');
var CDN = 'https://cdn.jsdelivr.net/npm/@drgrice1/tikzjax@latest/dist/tikzjax.js';
var dir = process.argv[2];
if (!dir) { console.error('Usage: node scripts/process-tikz.js <public-dir>'); process.exit(1); }

var blockCount = 0, tikzPages = {};

function proc(fp, html) {
  var re = /(?:<figure[^>]*>)?\s*<pre[^>]*(?:data-language="tikz"|class="[^"]*\blanguage-tikz\b[^"]*")[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>\s*(?:<\/figure>)?/g;
  return html.replace(re, function(m, c) {
    var code = strip(decode(c)).trim();
    if (!code) return m;
    if (code.indexOf('\\begin{document}') === -1)
      code = '\\begin{document}\n' + code + '\n\\end{document}';
    blockCount++;
    tikzPages[fp] = true;
    return '<script type="text/tikz">\n' + code.replace(/<\/script>/gi, '<\\/script>') + '\n</script>';
  });
}

function inject(html) {
  var js = '\n<script src="' + CDN + '"><\/script>\n';
  var spa = '\n<script>document.addEventListener("nav",function(){var els=document.querySelectorAll(\'script[type="text/tikz"]\');els.forEach(function(e){e.type="text/tikz"});var s=document.createElement("script");s.src="' + CDN + '";document.body.appendChild(s)});<\/script>\n';
  var i = html.lastIndexOf('</body>');
  return i === -1 ? html + js + spa : html.slice(0, i) + js + spa + html.slice(i);
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
console.log('Done. ' + blockCount + ' diagram(s).');