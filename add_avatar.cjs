const fs = require('fs');
let c = fs.readFileSync('src/components/student/LessonTools.jsx', 'utf8');

const newTools = `  ,
  {
    id: 'avatar',
    title: 'Avatar Stüdyosu (3D)',
    desc: 'Kendi 3 boyutlu karakterini tasarla, giydir ve tarzını yarat!',
    url: 'https://demo.readyplayer.me/avatar?frameApi',
    icon: '👤'
  }
]`;

c = c.replace(']', newTools);
fs.writeFileSync('src/components/student/LessonTools.jsx', c, 'utf8');
console.log('Avatar tool added');
