const fs = require('fs');
const path = require('path');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (/\.(tsx?|jsx?|json|css|md)$/i.test(entry.name)) {
      try {
        const buf = fs.readFileSync(fullPath);
        // Detect UTF-16 LE BOM (FF FE) or null bytes
        if (buf.length >= 2 && buf[0] === 0xFF && buf[1] === 0xFE) {
          const str = buf.toString('utf16le');
          fs.writeFileSync(fullPath, str, 'utf8');
          console.log('Converted UTF-16 LE BOM -> UTF-8:', fullPath);
        } else if (buf.length >= 2 && buf[0] === 0xFE && buf[1] === 0xFF) {
          const str = buf.toString('utf16be');
          fs.writeFileSync(fullPath, str, 'utf8');
          console.log('Converted UTF-16 BE BOM -> UTF-8:', fullPath);
        } else if (buf.includes(0x00)) {
          // Check for UTF-16 without BOM
          const str = buf.toString('utf16le');
          fs.writeFileSync(fullPath, str, 'utf8');
          console.log('Converted UTF-16 LE no-BOM -> UTF-8:', fullPath);
        }
      } catch (err) {
        console.error('Error reading/writing:', fullPath, err);
      }
    }
  }
}

walk('.');
console.log('UTF-8 normalization complete!');
