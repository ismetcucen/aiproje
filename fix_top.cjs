const fs = require('fs');
let c = fs.readFileSync('src/components/teacher/SubmissionsList.jsx', 'utf8');

const correctTop = `import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import * as XLSX from 'xlsx'
import { getSubmissionsBySchool, getAssignmentsByTeacher, getStudentsBySchool, upsertFeedback, createNotification } from '../../firebase/schema'

const CONTENT_TYPE_LABELS = {`;

const startIdx = c.indexOf("import { useState");
const endIdx = c.indexOf("const CONTENT_TYPE_LABELS = {");
if (startIdx !== -1 && endIdx !== -1) {
  c = correctTop + c.substring(endIdx + "const CONTENT_TYPE_LABELS = {".length);
  fs.writeFileSync('src/components/teacher/SubmissionsList.jsx', c, 'utf8');
}
