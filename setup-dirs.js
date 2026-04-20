import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirs = [
  'src',
  'src/core',
  'src/components',
  'src/games',
  'src/games/pong',
  'src/games/snake',
  'src/games/sinuca',
  'src/styles',
  'src/utils',
  'dist',
  '.vscode',
];

const baseDir = __dirname;

dirs.forEach(dir => {
  const fullPath = path.join(baseDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✓ Created: ${dir}`);
  }
});

// Create .gitkeep files
['dist', 'src/games/pong', 'src/games/snake', 'src/games/sinuca'].forEach(dir => {
  const gitkeepPath = path.join(baseDir, dir, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '');
  }
});

console.log('\n✓ Project structure created successfully!');
