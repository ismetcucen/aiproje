const fs = require('fs');
let c = fs.readFileSync('src/components/teacher/AssignmentForm.jsx', 'utf8');

c = c.replace(/\\`/g, '`');

fs.writeFileSync('src/components/teacher/AssignmentForm.jsx', c, 'utf8');
