const fs = require('fs');
let content = fs.readFileSync('src/firebase/schema.js', 'utf8');

content = content.replace("const { onSnapshot } = require('firebase/firestore');", "");
fs.writeFileSync('src/firebase/schema.js', content, 'utf8');
