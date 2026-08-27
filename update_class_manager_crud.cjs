const fs = require('fs');

let content = fs.readFileSync('src/components/admin/ClassManager.jsx', 'utf8');

// Import deleteClass and forceRemoveStudentFromClass
if (!content.includes('deleteClass')) {
  content = content.replace(
    "import { getClassesBySchool, getStudentsByClass, getUnassignedStudents, createClass, assignStudentToClass, GRADES, SECTIONS } from '../../firebase/schema'",
    "import { getClassesBySchool, getStudentsByClass, getUnassignedStudents, createClass, assignStudentToClass, deleteClass, forceRemoveStudentFromClass, GRADES, SECTIONS } from '../../firebase/schema'"
  );
}

// Add state for deletion and functions
const oldHandleCreateClass = "async function handleCreateClass() {";
const newHandleCreateClass = `
  async function handleDeleteClass(classId) {
    if (!window.confirm("Bu sınıfı silmek istediğinize emin misiniz? (Öğrenciler silinmez, sadece sınıftan çıkarılır)")) return;
    try {
      await deleteClass(classId);
      setSuccess("Sınıf başarıyla silindi!");
      if (selected?.id === classId) setSelected(null);
      await loadData();
    } catch(err) {
      setError(err.message || "Sınıf silinirken hata oluştu.");
    }
  }

  async function handleRemoveStudent(studentId) {
    if (!selected) return;
    if (!window.confirm("Bu öğrenciyi sınıftan çıkarmak istediğinize emin misiniz?")) return;
    try {
      await forceRemoveStudentFromClass(selected.id, studentId);
      setSuccess("Öğrenci sınıftan çıkarıldı.");
      const m = await import('../../firebase/schema');
      const studs = await m.getStudentsByClass(selected.id);
      setStudents(studs);
      await loadData();
    } catch(err) {
      setError(err.message || "Öğrenci çıkarılırken hata oluştu.");
    }
  }

  async function handleCreateClass() {`;
content = content.replace(oldHandleCreateClass, newHandleCreateClass);

// Add delete button to classes list
const oldClassButton = `<button key={cls.id} onClick={() => selectClass(cls)}
                className={\`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 \${
                  selected?.id === cls.id
                    ? 'bg-red-900/20 border-red-500/50 shadow-lg shadow-red-900/20'
                    : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                }\`}>
                <div className="flex items-center justify-between">
                  <p className={\`text-lg font-bold \${selected?.id === cls.id ? 'text-red-400' : 'text-slate-200'}\`}>{cls.name}</p>
                  <span className={\`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold \${selected?.id === cls.id ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}\`}>{cls.section}</span>
                </div>
                <p className={\`text-sm mt-1 \${selected?.id === cls.id ? 'text-red-300/70' : 'text-slate-500'}\`}>{cls.grade}. Sınıf Seviyesi</p>
              </button>`;

const newClassButton = `<div key={cls.id} className={\`group relative w-full flex items-center px-5 py-4 rounded-2xl border transition-all duration-200 \${
                  selected?.id === cls.id
                    ? 'bg-red-900/20 border-red-500/50 shadow-lg shadow-red-900/20'
                    : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                }\`}>
                <button onClick={() => selectClass(cls)} className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <p className={\`text-lg font-bold \${selected?.id === cls.id ? 'text-red-400' : 'text-slate-200'}\`}>{cls.name}</p>
                    <span className={\`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold \${selected?.id === cls.id ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}\`}>{cls.section}</span>
                  </div>
                  <p className={\`text-sm mt-1 \${selected?.id === cls.id ? 'text-red-300/70' : 'text-slate-500'}\`}>{cls.grade}. Sınıf Seviyesi</p>
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls.id); }}
                  title="Sınıfı Sil"
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all">
                  🗑️
                </button>
              </div>`;
content = content.replace(oldClassButton, newClassButton);

// Add remove button to student list
const oldStudentItem = `<div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Aktif</span>
                        </div>
                      </div>`;

const newStudentItem = `<div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Aktif</span>
                          </div>
                          <button onClick={() => handleRemoveStudent(s.id)} title="Öğrenciyi Sınıftan Çıkar" className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 p-2 rounded-xl transition-colors">
                            ❌
                          </button>
                        </div>
                      </div>`;
content = content.replace(oldStudentItem, newStudentItem);

fs.writeFileSync('src/components/admin/ClassManager.jsx', content, 'utf8');
