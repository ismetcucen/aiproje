const fs = require('fs');
let c = fs.readFileSync('src/pages/student/StudentPanel.jsx', 'utf8');

c = c.replace(
  'getSchoolSettings(profile.schoolCode).then(s => setSettings(s)).catch(console.error)',
  'getSchoolSettings(profile.schoolCode || "DEFAULT_SCHOOL").then(s => setSettings(s)).catch(console.error)'
);
fs.writeFileSync('src/pages/student/StudentPanel.jsx', c, 'utf8');
