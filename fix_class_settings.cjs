const fs = require('fs');
let c = fs.readFileSync('src/components/teacher/ClassSettings.jsx', 'utf8');

c = c.replace(/\\`/g, '`');

fs.writeFileSync('src/components/teacher/ClassSettings.jsx', c, 'utf8');
