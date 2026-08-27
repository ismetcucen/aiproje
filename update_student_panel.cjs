const fs = require('fs');

let c = fs.readFileSync('src/pages/student/StudentPanel.jsx', 'utf8');

// Add Import
if (!c.includes('HighSchoolAILab')) {
  c = c.replace(
    "import LessonTools from '../../components/student/LessonTools'",
    "import LessonTools from '../../components/student/LessonTools'\nimport HighSchoolAILab from '../../components/student/HighSchoolAILab'"
  );
}

// Add the menu logic
// Find the exact line: `{[...MENU, ...(settings.codingModuleEnabled ? [{ id: "games", label: "Oyunlar", icon: "🎮" }, { id: "tools", label: "Araçlar", icon: "🛠️" }] : [])].map(item => (`
// Replace with the extended menu.
const oldMenuLogic = `{[...MENU, ...(settings.codingModuleEnabled ? [{ id: "games", label: "Oyunlar", icon: "🎮" }, { id: "tools", label: "Araçlar", icon: "🛠️" }] : [])].map(item => (`;

const newMenuLogic = `{[
            ...MENU, 
            ...(settings.codingModuleEnabled ? [
              { id: "games", label: "Oyunlar", icon: "🎮" }, 
              { id: "tools", label: "Araçlar", icon: "🛠️" },
              ...(profile?.gradeNumber >= 9 ? [{ id: "ailab", label: "Lise Yapay Zeka", icon: "🧠" }] : [])
            ] : [])
          ].map(item => (`

c = c.replace(oldMenuLogic, newMenuLogic);

// Add the route renderer
c = c.replace(
  "{active === 'tools'       && <LessonTools />}",
  "{active === 'tools'       && <LessonTools />}\n          {active === 'ailab'       && <HighSchoolAILab />}"
);

fs.writeFileSync('src/pages/student/StudentPanel.jsx', c, 'utf8');
console.log('Updated StudentPanel.jsx');
