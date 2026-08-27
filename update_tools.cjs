const fs = require('fs');
let c = fs.readFileSync('src/components/student/LessonTools.jsx', 'utf8');

const newTools = `  ,
  {
    id: 'ztype',
    title: 'Klavye Savaşları',
    desc: 'Yukarıdan düşen kelimeleri klavyede hızlıca yazarak uzay gemini koru!',
    url: 'https://zty.pe/',
    icon: '🚀'
  },
  {
    id: 'typing',
    title: '10 Parmak Klavye',
    desc: 'Klavyeye bakmadan hızlı ve doğru yazma alıştırmaları yap.',
    url: 'https://agilefingers.com/tr',
    icon: '⌨️'
  }
]`;

c = c.replace(']', newTools);
fs.writeFileSync('src/components/student/LessonTools.jsx', c, 'utf8');
console.log('Tools updated');
