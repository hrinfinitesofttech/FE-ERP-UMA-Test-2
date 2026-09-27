const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, 'src', 'app', 'hr'),
  path.join(__dirname, 'src', 'app', 'accounting'),
  path.join(__dirname, 'src', 'app', 'designer'),
];

const replacers = [
  { regex: /bg-slate-900\/90/g, replacement: 'bg-white' },
  { regex: /bg-slate-950\/70/g, replacement: 'bg-[#FAF7F2]' },
  { regex: /bg-slate-950/g, replacement: 'bg-[#FAF7F2]' },
  { regex: /bg-slate-900/g, replacement: 'bg-white' },
  { regex: /bg-slate-800/g, replacement: 'bg-white' },
  { regex: /text-slate-100/g, replacement: 'text-[#211B17]' },
  { regex: /text-slate-200/g, replacement: 'text-[#3E2723]' },
  { regex: /text-slate-300/g, replacement: 'text-[#544B45]' },
  { regex: /text-slate-400/g, replacement: 'text-[#70665F]' },
  { regex: /text-white/g, replacement: 'text-[#211B17]' },
  { regex: /dark:bg-\[#0B1120\]/g, replacement: '' },
  { regex: /dark:bg-slate-900/g, replacement: '' },
  { regex: /dark:bg-slate-800/g, replacement: '' },
  { regex: /dark:text-white/g, replacement: '' },
  { regex: /dark:text-slate-200/g, replacement: '' },
  { regex: /dark:text-slate-300/g, replacement: '' },
  { regex: /dark:text-slate-400/g, replacement: '' },
  { regex: /dark:border-slate-800/g, replacement: '' },
  { regex: /dark:border-slate-700\/80/g, replacement: '' },
  { regex: /dark:border-slate-700/g, replacement: '' },
];

function walkSync(currentDirPath, callback) {
  if (!fs.existsSync(currentDirPath)) return;
  fs.readdirSync(currentDirPath).forEach(function (name) {
    var filePath = path.join(currentDirPath, name);
    var stat = fs.statSync(filePath);
    if (stat.isFile() && filePath.endsWith('.tsx')) {
      callback(filePath);
    } else if (stat.isDirectory()) {
      walkSync(filePath, callback);
    }
  });
}

targetDirs.forEach((dir) => {
  walkSync(dir, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    replacers.forEach(({ regex, replacement }) => {
      content = content.replace(regex, replacement);
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated theme classes in: ${filePath}`);
    }
  });
});

console.log('Theme replacement complete!');
