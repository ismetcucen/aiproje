const fs = require('fs');
let c = fs.readFileSync('src/components/student/LessonTools.jsx', 'utf8');

c = c.replace('id: \'quickdraw\',', 'id: \'autodraw\',');
c = c.replace('title: \'Yapay Zeka Çizim\',', 'title: \'Akıllı Çizim (AutoDraw)\',');
c = c.replace('desc: \'Sen çiz, yapay zeka ne çizdiğini tahmin etsin!\',', 'desc: \'Sen basitçe çiz, yapay zeka onu harika bir görsele dönüştürsün!\',');
c = c.replace('url: \'https://quickdraw.withgoogle.com/\',', 'url: \'https://www.autodraw.com/\',');
c = c.replace('icon: \'🤖\'', 'icon: \'🪄\'');

fs.writeFileSync('src/components/student/LessonTools.jsx', c, 'utf8');
console.log('Swapped QuickDraw for AutoDraw');
