const fs = require('fs');

function updatePanel(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  // Add imports if missing
  if (!c.includes('CodingGames')) {
    c = c.replace(
      "import NotificationBell from '../../components/NotificationBell'",
      "import NotificationBell from '../../components/NotificationBell'\nimport CodingGames from '../../components/student/CodingGames'\nimport LessonTools from '../../components/student/LessonTools'\nimport HighSchoolAILab from '../../components/student/HighSchoolAILab'"
    );
  }

  // Add menu items (insert before settings)
  if (!c.includes("id: 'games'")) {
    c = c.replace(
      "{ id: 'settings',",
      "{ id: 'games', label: 'Oyunlar', icon: '🎮' },\n  { id: 'tools', label: 'Araçlar', icon: '🛠️' },\n  { id: 'ailab', label: 'Lise AI Lab', icon: '🧠' },\n  { id: 'settings',"
    );
  }

  // Add route renderers
  if (!c.includes("active === 'games'")) {
    c = c.replace(
      "{active === 'settings'",
      "{active === 'games'       && <CodingGames />}\n          {active === 'tools'       && <LessonTools />}\n          {active === 'ailab'       && <HighSchoolAILab />}\n          {active === 'settings'"
    );
  }

  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Updated ' + filePath);
}

updatePanel('src/pages/admin/AdminPanel.jsx');
updatePanel('src/pages/teacher/TeacherPanel.jsx');
