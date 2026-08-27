const fs = require('fs');

function fix(f) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(
    "import { useAuth }\nfrom '../../hooks/useAuth'\\nimport NotificationBell from '../../components/NotificationBell'",
    "import { useAuth } from '../../hooks/useAuth'\nimport NotificationBell from '../../components/NotificationBell'"
  );
  fs.writeFileSync(f, c, 'utf8');
}
fix('src/pages/admin/AdminPanel.jsx');
fix('src/pages/teacher/TeacherPanel.jsx');
fix('src/pages/student/StudentPanel.jsx');
