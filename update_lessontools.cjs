const fs = require('fs');
let c = fs.readFileSync('src/components/student/LessonTools.jsx', 'utf8');

const newTool = `  ,
  {
    id: 'edublocks',
    title: 'EduBlocks',
    desc: 'Python ve HTML/CSS kodlamaya bloklarla başla! (Yeni sekmede açılır)',
    url: 'https://app.edublocks.org/',
    icon: '🐍',
    external: true
  }
]`;

c = c.replace(']', newTool);

// Update onClick logic
c = c.replace(
  'onClick={() => setActiveTool(t)}',
  'onClick={() => t.external ? window.open(t.url, "_blank") : setActiveTool(t)}'
);

fs.writeFileSync('src/components/student/LessonTools.jsx', c, 'utf8');
console.log('Updated LessonTools.jsx');
