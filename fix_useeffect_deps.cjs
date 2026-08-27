const fs = require('fs');

let c1 = fs.readFileSync('src/components/teacher/ClassSettings.jsx', 'utf8');
c1 = c1.replace(
  'if (profile?.schoolCode) loadSettings()',
  'loadSettings()'
);
fs.writeFileSync('src/components/teacher/ClassSettings.jsx', c1, 'utf8');

let c2 = fs.readFileSync('src/pages/student/StudentPanel.jsx', 'utf8');
c2 = c2.replace(
  'if (profile?.schoolCode) {',
  'if (true) {'
);
fs.writeFileSync('src/pages/student/StudentPanel.jsx', c2, 'utf8');

console.log('Fixed useEffect dependencies');
