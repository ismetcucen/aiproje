const fs = require('fs');
let c = fs.readFileSync('src/components/student/LessonTools.jsx', 'utf8');

const newTools = `  ,
  {
    id: 'teachablemachine',
    title: 'Teachable Machine',
    desc: 'Kameranı kullanarak kendi yapay zeka modelini eğit! (Yeni sekmede açılır)',
    url: 'https://teachablemachine.withgoogle.com/',
    icon: '🧠',
    external: true
  },
  {
    id: 'makeymakey',
    title: 'Makey Makey Uygulamaları',
    desc: 'Bilgisayar klavyesini bir piyanoya veya bongo davuluna dönüştür!',
    url: 'https://apps.makeymakey.com/',
    icon: '🎹',
    external: false
  }
]`;

c = c.replace(']', newTools);
fs.writeFileSync('src/components/student/LessonTools.jsx', c, 'utf8');
console.log('Added Teachable Machine and Makey Makey');
