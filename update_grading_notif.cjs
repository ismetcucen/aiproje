const fs = require('fs');
let content = fs.readFileSync('src/components/teacher/SubmissionsList.jsx', 'utf8');

if (!content.includes('createNotification')) {
  content = content.replace(
    "import { getTeacherSubmissions, gradeSubmission }",
    "import { getTeacherSubmissions, gradeSubmission, createNotification }"
  );
  
  const oldFeedback = `await gradeSubmission(selected.id, {
        score: Number(score),
        teacherFeedback: feedback.trim(),
        showcase: isShowcase
      })`;
      
  const newFeedback = `await gradeSubmission(selected.id, {
        score: Number(score),
        teacherFeedback: feedback.trim(),
        showcase: isShowcase
      })
      await createNotification(selected.studentId, {
        title: 'Ödevin Notlandırıldı!',
        message: 'Öğretmenin sana ' + Number(score) + ' puan verdi.',
        type: 'assignment_graded',
        link: '/student/assignments'
      })`;
      
  content = content.replace(oldFeedback, newFeedback);
  fs.writeFileSync('src/components/teacher/SubmissionsList.jsx', content, 'utf8');
  console.log('SubmissionsList updated with notifications');
}
