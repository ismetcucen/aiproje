const fs = require('fs');
let content = fs.readFileSync('src/components/teacher/SubmissionsList.jsx', 'utf8');

// Ensure XLSX import
if (!content.includes('import * as XLSX')) {
  content = content.replace("import { useAuth }", "import { useAuth }\nimport * as XLSX from 'xlsx'");
}

const exportFunc = `
  function exportToExcel() {
    const dataToExport = filtered.map(s => {
      const student = students[s.studentId] || {}
      const assignment = assignments[s.assignmentId] || {}
      return {
        'Öğrenci Adı': student.fullName || 'Bilinmiyor',
        'Sınıf': student.gradeNumber || student.classLevel || 'Bilinmiyor',
        'Görev Başlığı': assignment.title || 'Bilinmiyor',
        'İçerik Türü': CONTENT_TYPE_LABELS[s.contentType] || s.contentType,
        'Gönderim Tarihi': s.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || '',
        'Durum': s.feedback ? 'Değerlendirildi' : 'Bekliyor',
        'Puan': s.score !== undefined ? s.score : '',
        'Öğretmen Yorumu': s.feedback?.comment || s.teacherFeedback || ''
      }
    })

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Notlar")
    XLSX.writeFile(wb, "Ogrenci_Not_Listesi.xlsx")
  }

  async function loadData() {`;

content = content.replace("async function loadData() {", exportFunc);

fs.writeFileSync('src/components/teacher/SubmissionsList.jsx', content, 'utf8');
console.log('Export function added properly');
