const fs = require('fs');
let c = fs.readFileSync('src/components/teacher/ClassSettings.jsx', 'utf8');

c = c.replace(
  'const data = await getSchoolSettings(profile.schoolCode)',
  'const data = await getSchoolSettings(profile.schoolCode || "DEFAULT_SCHOOL")'
);

c = c.replace(
  'await updateSchoolSettings(profile.schoolCode, { codingModuleEnabled: newVal })',
  'await updateSchoolSettings(profile.schoolCode || "DEFAULT_SCHOOL", { codingModuleEnabled: newVal })'
);

fs.writeFileSync('src/components/teacher/ClassSettings.jsx', c, 'utf8');
