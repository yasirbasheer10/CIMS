const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/ghazi/OneDrive/Desktop/AQIB/client/src';

const replacements = [
  { search: /'#e2e8f0'/g, replace: "'var(--text-main)'" },
  { search: /"#e2e8f0"/g, replace: '"var(--text-main)"' },
  { search: /'#f1f5f9'/g, replace: "'var(--text-heading)'" },
  { search: /"#f1f5f9"/g, replace: '"var(--text-heading)"' },
  { search: /'rgba\(11, 22, 35, 0\.95\)'/g, replace: "'var(--bg-sidebar)'" },
  { search: /'rgba\(11, 22, 35, 0\.9\)'/g, replace: "'var(--bg-header)'" },
  { search: /'rgba\(13, 27, 42, 0\.6\)'/g, replace: "'var(--bg-input)'" },
  { search: /background: 'var\(--navy-800\)'/g, replace: "background: 'var(--bg-dropdown)'" },
  { search: /1px solid rgba\(30, 111, 217, 0\.1\)/g, replace: "1px solid var(--border-sidebar)" },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const { search, replace } of replacements) {
        if (content.match(search)) {
          content = content.replace(search, replace);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(directory);
console.log("Done replacing inline styles with CSS variables.");
