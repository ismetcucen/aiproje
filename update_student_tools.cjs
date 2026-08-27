const fs = require('fs');
let c = fs.readFileSync('src/pages/student/StudentPanel.jsx', 'utf8');

if (!c.includes('LessonTools')) {
  c = c.replace(
    "import CodingGames from '../../components/student/CodingGames'",
    "import CodingGames from '../../components/student/CodingGames'\nimport LessonTools from '../../components/student/LessonTools'"
  );

  c = c.replace(
    "[{ id: \"games\", label: \"Eğlence & Kodlama\", icon: \"🎮\" }]",
    "[{ id: \"games\", label: \"Oyunlar\", icon: \"🎮\" }, { id: \"tools\", label: \"Araçlar\", icon: \"🛠️\" }]"
  );

  c = c.replace(
    "{active === 'games'       && <CodingGames />}",
    "{active === 'games'       && <CodingGames />}\n          {active === 'tools'       && <LessonTools />}"
  );

  fs.writeFileSync('src/pages/student/StudentPanel.jsx', c, 'utf8');
  console.log('StudentPanel updated with LessonTools');
}
