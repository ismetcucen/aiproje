const fs = require('fs');

let c1 = fs.readFileSync('src/components/teacher/ClassSettings.jsx', 'utf8');
c1 = c1.replace(
  'const data = await getSchoolSettings(profile.schoolCode || "DEFAULT_SCHOOL")',
  'const data = await getSchoolSettings("global_school")'
);
c1 = c1.replace(
  'await updateSchoolSettings(profile.schoolCode || "DEFAULT_SCHOOL", { codingModuleEnabled: newVal })',
  'await updateSchoolSettings("global_school", { codingModuleEnabled: newVal })'
);
fs.writeFileSync('src/components/teacher/ClassSettings.jsx', c1, 'utf8');

let c2 = fs.readFileSync('src/pages/student/StudentPanel.jsx', 'utf8');
c2 = c2.replace(
  'getSchoolSettings(profile.schoolCode || "DEFAULT_SCHOOL").then',
  'getSchoolSettings("global_school").then'
);
fs.writeFileSync('src/pages/student/StudentPanel.jsx', c2, 'utf8');

console.log('Settings changed to global_school');
