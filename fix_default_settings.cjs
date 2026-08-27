const fs = require('fs');
let c = fs.readFileSync('src/firebase/schema.js', 'utf8');

c = c.replace(
  'return { codingModuleEnabled: false };',
  'return { codingModuleEnabled: true };'
);
fs.writeFileSync('src/firebase/schema.js', c, 'utf8');
console.log('Fixed default settings');
