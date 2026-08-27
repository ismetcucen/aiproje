const fs = require('fs');
let c = fs.readFileSync('src/components/student/LessonTools.jsx', 'utf8');

c = c.replace("title: 'Scratch (TurboWarp)',", "title: 'mBlock (Scratch AI)',");
c = c.replace("desc: 'Blok tabanlı kodlama ile kendi oyunlarını ve animasyonlarını yap.',", "desc: 'Scratch tabanlı blok kodlama ile yapay zeka destekli oyunlar ve animasyonlar yap.',");
c = c.replace("url: 'https://turbowarp.org/editor',", "url: 'https://ide.mblock.cc/',");

fs.writeFileSync('src/components/student/LessonTools.jsx', c, 'utf8');
console.log('Swapped to mBlock');
