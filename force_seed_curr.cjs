const fs = require('fs');

let c = fs.readFileSync('src/firebase/schema.js', 'utf8');

c = c.replace(
  "if (!snap.empty) return // Zaten yüklenmiş",
  "// if (!snap.empty) return // Zaten yüklenmiş"
);

fs.writeFileSync('src/firebase/schema.js', c, 'utf8');
console.log('Disabled check to force curriculum seed');
