/**
 * process-tikz.js
 *
 * Post-build script for Quartz: converts ```tikz code blocks
 * into TikZJax-powered SVG diagrams for GitHub Pages.
 *
 * Usage: node scripts/process-tikz.js <public-dir>
 * Example: node scripts/process-tikz.js quartz/public
 */

var fs = require('fs');
var path = require('path');

var TIKZJAX_CDN = 'https://tikzjax.com/v1/tikzjax.js';

var dir = process.argv[2];
if (!dir) { console.error('Usage: node scripts/process-tikz.js <public-dir>'); process.exit(1); }

var blockCount = 0;
var pageHasTikz = {};

function processHtml(filePath, html) {
  // Match ```tikz code blocks (Shiki or Prism format)
  var regex = /(?:<figure[^>]*>)?\s*<pre[^>]*(?:data-language="tikz"|class="[^"]*\blanguage-tikz\b[^"]*")[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>\s*(?:<\/figure>)?/g;

  return html.replace(regex, function(match, encodedCode) {
    var code = stripHtmlTags(decodeHtmlEntities(encodedCode)).trim();
    if (!code) return match;

    // Add document wrapper if user omitted it
    if (code.indexOf('\\begin{document}') === -1) {
      code = '\\begin{document}\n' + code + '\n\\end{document}';
    }

    blockCount++;
    var id = 'tikz-diagram-' + blockCount;

    pageHasTikz[filePath] = true;

    return ''
      + '<div id="' + id + '" class="tikz-diagram" style="margin:1em 0;min-height:60px;"></div>'
      + '<script type="text/tikz" data-target="' + id + '">'
      + code.replace(/<\/script>/gi, '<\\/script>')
      + '</script>';
  });
}

// Inject TikZJax CDN at end of body, plus SPA nav handler
function injectScript(html) {
  var cdnScript = '\n<script src="' + TIKZJAX_CDN + '"><\\/script>\n';
  var navHandler = [
    '<script>',
    'document.addEventListener("nav",function(){',
    '  var s=document.createElement("script");',
    '  s.src="' + TIKZJAX_CDN + '";',
    '  document.body.appendChild(s);',
    '});',
    '</script>'
  ].join('');

  // Inject before </body>
  var idx = html.lastIndexOf('</body>');
  if (idx === -1) return html + cdnScript + navHandler;
  return html.slice(0, idx) + cdnScript + navHandler + html.slice(idx);
}

function stripHtmlTags(s) { return s.replace(/<[^>]*>/g, ''); }

function decodeHtmlEntities(s) {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'").replace(/&#x2F;/g, '/');
}

function scan(d) {
  var entries = fs.readdirSync(d, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var p = path.join(d, e.name);
    if (e.isDirectory()) scan(p);
    else if (e.isFile() && e.name.endsWith('.html')) {
      var c = fs.readFileSync(p, 'utf-8');
      c = processHtml(p, c);
      if (c !== fs.readFileSync(p, 'utf-8')) {
        fs.writeFileSync(p, c, 'utf-8');
        console.log('  TikZ: ' + path.relative(dir, p));
      }
    }
  }
}

console.log('Processing TikZ code blocks...');
scan(dir);

// Second pass: inject CDN script into pages that have tikz blocks
Object.keys(pageHasTikz).forEach(function(fp) {
  var c = fs.readFileSync(fp, 'utf-8');
  c = injectScript(c);
  fs.writeFileSync(fp, c, 'utf-8');
});

console.log('Done. ' + blockCount + ' TikZ diagram(s) processed.');