const fs = require('fs');
const path = require('path');

const files = [
  'app/profile/page.tsx',
  'app/page.tsx',
  'app/language/[id]/page.tsx',
  'app/explore/page.tsx',
  'app/contribute/page.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Remove imports
  content = content.replace(/import\s+Navigation\s+from\s+['"]@\/components\/navigation['"];?\s*/g, '');
  content = content.replace(/import\s+Footer\s+from\s+['"]@\/components\/footer['"];?\s*/g, '');

  // Remove components
  content = content.replace(/\s*<Navigation\s*\/>\s*/g, '\n');
  content = content.replace(/\s*<Footer\s*\/>\s*/g, '\n');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
