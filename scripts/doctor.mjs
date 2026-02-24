import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (![18, 20].includes(nodeMajor)) {
  errors.push(`Unsupported Node.js ${process.version}. Use Node 18 or 20.`);
}

const backendClientPath = join(root, 'backend', 'src', 'db', 'client.ts');
if (existsSync(backendClientPath)) {
  const content = readFileSync(backendClientPath, 'utf8');
  if (!content.includes('drizzle-orm/better-sqlite3')) {
    errors.push('backend/src/db/client.ts is not using drizzle-orm/better-sqlite3.');
  }
} else {
  errors.push('backend/src/db/client.ts not found.');
}

const frontendPkgPath = join(root, 'frontend', 'package.json');
if (existsSync(frontendPkgPath)) {
  const pkg = JSON.parse(readFileSync(frontendPkgPath, 'utf8'));
  if (!pkg.devDependencies?.['babel-plugin-module-resolver']) {
    errors.push('frontend/package.json missing babel-plugin-module-resolver.');
  }
}

const rootNodeModules = join(root, 'node_modules');
if (!existsSync(rootNodeModules)) {
  warnings.push('node_modules missing. Run npm install.');
} else {
  const metroPkgPath = join(rootNodeModules, 'metro', 'package.json');
  if (existsSync(metroPkgPath)) {
    const metroPkg = JSON.parse(readFileSync(metroPkgPath, 'utf8'));
    if (metroPkg.version !== '0.80.12') {
      warnings.push(`Detected metro@${metroPkg.version}. Expected 0.80.12 for this project.`);
    }
  } else {
    warnings.push('metro package not found yet (install may be incomplete).');
  }
}

if (warnings.length) {
  console.log('\nWarnings:');
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length) {
  console.error('\nDoctor found blocking issues:');
  for (const error of errors) console.error(`- ${error}`);
  console.error('\nRecovery:\n1) npm run reset:deps\n2) npm install\n3) npm run doctor\n4) npm run dev:backend && npm run dev:frontend');
  process.exit(1);
}

console.log('\n✅ Environment checks passed.');
