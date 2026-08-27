const fs = require('fs');
let c = fs.readFileSync('src/components/teacher/SubmissionsList.jsx', 'utf8');

c = c.replace("import { useAuth } from '../../hooks/useAuth'\\nimport * as XLSX from 'xlsx'", "import { useAuth } from '../../hooks/useAuth'\nimport * as XLSX from 'xlsx'");
fs.writeFileSync('src/components/teacher/SubmissionsList.jsx', c, 'utf8');
