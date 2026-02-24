const major = Number(process.versions.node.split('.')[0]);

if (![18, 20].includes(major)) {
  console.error(`\n❌ Unsupported Node.js version: ${process.version}`);
  console.error('This project currently supports Node.js 18 or 20 for stable Expo + Metro behavior.');
  console.error('Please switch Node version (recommended: 20 LTS), then run npm install again.\n');
  process.exit(1);
}

console.log(`✅ Node.js ${process.version} supported.`);
