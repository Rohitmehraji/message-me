import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const targets = [
  'node_modules',
  'package-lock.json',
  join('backend', 'node_modules'),
  join('backend', 'package-lock.json'),
  join('frontend', 'node_modules'),
  join('frontend', 'package-lock.json')
];

for (const rel of targets) {
  const full = join(root, rel);
  if (existsSync(full)) {
    rmSync(full, { recursive: true, force: true });
    console.log(`removed ${rel}`);
  }
}

console.log('Dependency reset complete. Run: npm install');
