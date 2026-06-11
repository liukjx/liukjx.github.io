#!/usr/bin/env node
/**
 * Pre-process markdown files: replace ```abc blocks with <span> tags
 * that abcjs can render client-side.
 * 
 * Usage: node scripts/prepare-abc.js <content-dir>
 */

const fs = require('fs');
const path = require('path');

const contentDir = process.argv[2];
if (!contentDir) {
  console.error('Usage: node prepare-abc.js <content-dir>');
  process.exit(1);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  content = content.replace(/```abc\n([\s\S]*?)\n```/g, (match, code) => {
    const escaped = escapeHtml(code.trim());
    return `\n<span class="abc-notation-render" data-abc="${escaped}"></span>\n`;
  });
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ ${path.relative(contentDir, filePath)}`);
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && entry.name !== 'img') {
        walkDir(fullPath);
      }
    } else if (entry.name.endsWith('.md')) {
      processFile(fullPath);
    }
  }
}

console.log(`Processing abc blocks in ${contentDir}...`);
walkDir(contentDir);
console.log('Done.');
