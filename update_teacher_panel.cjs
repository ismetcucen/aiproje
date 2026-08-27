const fs = require('fs');
let c = fs.readFileSync('src/pages/teacher/TeacherPanel.jsx', 'utf8');

if (!c.includes('ClassSettings')) {
  c = c.replace(
    "import CurriculumAssigner from '../../components/teacher/CurriculumAssigner'",
    "import CurriculumAssigner from '../../components/teacher/CurriculumAssigner'\nimport ClassSettings from '../../components/teacher/ClassSettings'"
  );
  
  c = c.replace(
    "{ id: 'submissions', label: 'Üretimler',  icon: '📝' },",
    "{ id: 'submissions', label: 'Üretimler',  icon: '📝' },\n  { id: 'settings', label: 'Ayarlar', icon: '⚙️' },"
  );
  
  c = c.replace(
    "{active === 'submissions' && <SubmissionsList />}",
    "{active === 'submissions' && <SubmissionsList />}\n          {active === 'settings' && <ClassSettings />}"
  );
  
  fs.writeFileSync('src/pages/teacher/TeacherPanel.jsx', c, 'utf8');
  console.log('Teacher panel updated with settings menu');
}
