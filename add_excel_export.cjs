const fs = require('fs');

let content = fs.readFileSync('src/components/teacher/SubmissionsList.jsx', 'utf8');

// Add import
if (!content.includes('import * as XLSX')) {
  content = content.replace(
    "import { useAuth }",
    "import { useAuth }\nimport * as XLSX from 'xlsx'"
  );
}

// Add export function
const exportFunc = `
  function exportToExcel() {
    const dataToExport = filteredSubs.map(s => {
      const student = students[s.studentId] || {}
      const assignment = assignments[s.assignmentId] || {}
      return {
        'Öğrenci Adı': student.fullName || 'Bilinmiyor',
        'Sınıf': student.gradeNumber || student.classLevel || 'Bilinmiyor',
        'Görev Başlığı': assignment.title || 'Bilinmiyor',
        'İçerik Türü': CONTENT_TYPE_LABELS[s.contentType] || s.contentType,
        'Gönderim Tarihi': s.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || '',
        'Durum': s.feedback ? 'Değerlendirildi' : 'Bekliyor',
        'Puan': s.feedback?.score || '',
        'Öğretmen Yorumu': s.feedback?.comment || ''
      }
    })

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Notlar")
    XLSX.writeFile(wb, "Ogrenci_Not_Listesi.xlsx")
  }
`;

content = content.replace(
  "async function loadData() {",
  exportFunc + "\n  async function loadData() {"
);

// Add button to the UI
const buttonUI = `
        <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all">
          <span>📊</span> Excel İndir
        </button>
      </div>
`;

// Find the header section to insert the button
// Typically: <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
// Let's replace the ending div of that header
// We need to see what the header looks like.
