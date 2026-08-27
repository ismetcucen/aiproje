const fs = require('fs');

// Utility to add the normalizer function to both files
const normalizerFn = `
function normalizeStr(str) {
  if (!str) return '';
  return str.trim().toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}
`;

// --- Update AddStudentModal.jsx ---
let modalContent = fs.readFileSync('src/components/admin/AddStudentModal.jsx', 'utf8');

if (!modalContent.includes('normalizeStr')) {
  modalContent = modalContent.replace("export default function AddStudentModal", normalizerFn + "\nexport default function AddStudentModal");
}

modalContent = modalContent.replace(
  "targetEmail = \`std_\${form.studentNo.trim()}_\${schoolCode}@ohep.edu.tr\`",
  "targetEmail = \`std_\${form.gradeNumber}_\${normalizeStr(form.fullName)}@aistudio.com\`"
);

// Remove studentNo from state
modalContent = modalContent.replace("studentNo:   '',", "");
modalContent = modalContent.replace("studentNo:   mode === 'visual' ? form.studentNo.trim() : null,", "");

// Remove the Okul Numarası input block entirely
const oldStudentNoBlock = `<div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Okul Numarası <span className="text-slate-500 lowercase">(Kullanıcı Adı yerine geçecek)</span></label>
                <input type="text" value={form.studentNo} onChange={e => setForm(p => ({...p, studentNo: e.target.value}))}
                  placeholder="1045" required
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
              </div>`;
modalContent = modalContent.replace(oldStudentNoBlock, "");

// Modify check
modalContent = modalContent.replace(
  "if (!form.studentNo.trim()) return setError('Öğrenci/Okul Numarası gerekli.')",
  "if (!form.gradeNumber) return setError('Sınıf seviyesi gerekli.')"
);
modalContent = modalContent.replace(
  "Bu okul numarası zaten kullanımda",
  "Bu isimde ve sınıfta bir öğrenci zaten var"
);

fs.writeFileSync('src/components/admin/AddStudentModal.jsx', modalContent, 'utf8');

// --- Update LoginPage.jsx ---
let loginContent = fs.readFileSync('src/pages/LoginPage.jsx', 'utf8');

if (!loginContent.includes('normalizeStr')) {
  loginContent = loginContent.replace("export default function LoginPage", normalizerFn + "\nexport default function LoginPage");
}

// Update state
loginContent = loginContent.replace(
  "const [visualData, setVisualData] = useState({ studentNo: '', schoolCode: '', visualId: '' })",
  "const [visualData, setVisualData] = useState({ fullName: '', gradeNumber: '', visualId: '' })"
);

// Update submit handler
const oldVisualSubmit = `if (!visualData.studentNo || !visualData.schoolCode || !visualData.visualId) {
      return setError('Lütfen Okul Kodu, Öğrenci No ve Gizli Görselinizi seçin.')
    }
    setError(''); setLoading(true)
    
    const computedEmail = \`std_\${visualData.studentNo.trim()}_\${visualData.schoolCode.trim()}@ohep.edu.tr\`
    const computedPassword = \`vp_\${visualData.visualId}_2026!\``;

const newVisualSubmit = `if (!visualData.fullName || !visualData.gradeNumber || !visualData.visualId) {
      return setError('Lütfen Adınızı, Sınıfınızı ve Gizli Görselinizi eksiksiz girin.')
    }
    setError(''); setLoading(true)
    
    const computedEmail = \`std_\${visualData.gradeNumber}_\${normalizeStr(visualData.fullName)}@aistudio.com\`
    const computedPassword = \`vp_\${visualData.visualId}_2026!\``;

loginContent = loginContent.replace(oldVisualSubmit, newVisualSubmit);
loginContent = loginContent.replace(
  "setError('Giriş başarısız. Numara, okul kodu veya görsel yanlış olabilir.')",
  "setError('Giriş başarısız. İsminizi yanlış yazmış veya yanlış görsel seçmiş olabilirsiniz.')"
);

// Update inputs
const oldVisualInputs = `<div className="text-center mb-6">
                    <h3 className="text-white text-xl font-bold">Öğrenci Görsel Girişi</h3>
                    <p className="text-slate-400 text-sm mt-1">Okul numarası ve gizli görselinle giriş yap.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Okul Kodu</label>
                      <input type="text" value={visualData.schoolCode} onChange={e => setVisualData(p => ({...p, schoolCode: e.target.value}))}
                        placeholder="OHEP" required
                        className="w-full bg-slate-950/50 border border-slate-700 text-white font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-center" />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Okul Numarası</label>
                      <input type="number" value={visualData.studentNo} onChange={e => setVisualData(p => ({...p, studentNo: e.target.value}))}
                        placeholder="1045" required
                        className="w-full bg-slate-950/50 border border-slate-700 text-white font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-center" />
                    </div>
                  </div>`;

const newVisualInputs = `<div className="text-center mb-6">
                    <h3 className="text-white text-xl font-bold">Öğrenci Görsel Girişi</h3>
                    <p className="text-slate-400 text-sm mt-1">Adın, sınıfın ve gizli görselinle giriş yap.</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Ad Soyad</label>
                      <input type="text" value={visualData.fullName} onChange={e => setVisualData(p => ({...p, fullName: e.target.value}))}
                        placeholder="Ali Yılmaz" required
                        className="w-full bg-slate-950/50 border border-slate-700 text-white font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Sınıf</label>
                      <input type="number" min="1" max="12" value={visualData.gradeNumber} onChange={e => setVisualData(p => ({...p, gradeNumber: e.target.value}))}
                        placeholder="5" required
                        className="w-full bg-slate-950/50 border border-slate-700 text-white font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-center" />
                    </div>
                  </div>`;

loginContent = loginContent.replace(oldVisualInputs, newVisualInputs);

fs.writeFileSync('src/pages/LoginPage.jsx', loginContent, 'utf8');
console.log('LoginPage and AddStudentModal updated to use Name+Grade+Visual');
