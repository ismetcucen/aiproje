const fs = require('fs');
let c = fs.readFileSync('src/components/teacher/ClassSettings.jsx', 'utf8');

c = c.replace(
  'alert("Hata oluştu. Tekrar deneyin.")',
  'alert("Hata oluştu: " + err.message)'
);

fs.writeFileSync('src/components/teacher/ClassSettings.jsx', c, 'utf8');
