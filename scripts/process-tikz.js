/**
 * process-tikz.js
 *
 * Post-build script for Quartz: converts ```tikz code blocks
 * into TikZJax-powered SVG diagrams for GitHub Pages.
 *
 * Usage: node scripts/process-tikz.js <public-dir>
 */

var fs = require('fs');
var path = require('path');

var TIKZJAX_CDN = 'https://tikzjax.com/v1/tikzjax.js';
var dir = process.argv[2];
if (!dir) { console.error('Usage: node scripts/process-tikz.js <public-dir>'); process.exit(1); }

var blockCount = 0;
var pagesWithTikz = {};

function processHtml(fp, html) {
  var re = /(?:<figure[^>]*>)?\s*<pre[^>]*(?:data-language="tikz"|class="[^"]*\blanguage-tikz\b[^"]*")[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>\s*(?:<\/figure>)?/g;

  return html.replace(re, function(m, code) {
    var c = strip(decode(code)).trim();
    if (!c) return m;
    if (c.indexOf('\\begin{document}') === -1) {
      c = '\\begin{document}\n' + c + '\n\\end{document}';
    }
    blockCount++;
    pagesWithTikz[fp] = true;

    return '<script type="text/tikz">\n'
      + c.replace(/<\/script>/gi, '<\\/script>')
      + '\n</script>';
  });
}

function injectCDN(html) {
  var s = '\n<script src="' + TIKZJAX_CDN + '"><\\/script>\n';
  var nav = '\n<script>document.addEventListener("nav",function(){var s=document.createElement("script");s.src="' + TIKZJAX_CDN + '";document.body.appendChild(s);});<\/script>\n';
  var i = html.lastIndexOf('</body>');
  if (i === -1) return html + s + nav;
  return html.slice(0, i) + s + nav + html.slice(i);
}

function strip(s) { return s.replace(/<[^>]*>/g, ''); }
function decode(s) {
  return s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')
    .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#x27;/g,"'").replace(/&#x2F;/g,'/');
}

function scan(d) {
  var entries = fs.readdirSync(d, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i], p = path.join(d, e.name);
    if (e.isDirectory()) scan(p);
    else if (e.isFile() && e.name.endsWith('.html')) {
      var c = fs.readFileSync(p, 'utf-8');
      var out = processHtml(p, c);
      if (out !== c) { fs.writeFileSync(p, out, 'utf-8'); console.log('  TikZ: ' + path.relative(dir, p)); }
    }
  }
}

console.log('Processing TikZ code blocks...');
scan(dir);
Object.keys(pagesWithTikz).forEach(function(fp) {
  var c = fs.readFileSync(fp, 'utf-8');
  fs.writeFileSync(fp, injectCDN(c), 'utf-8');
});
console.log('Done. ' + blockCount + ' diagram(s).');