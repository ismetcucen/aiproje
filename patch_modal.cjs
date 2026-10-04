const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AddStudentModal.jsx', 'utf8');

const simplePasswordsStr = `
export const SIMPLE_PASSWORDS = [
  'kaplan', 'kartal', 'yildiz', 'simsek', 'volkan', 'ruzgar', 'destan', 'harika', 
  'kahraman', 'dostluk', 'basari', 'mucize', 'sampiyon', 'gezegen', 
  'galaksi', 'kaptan', 'leopar', 'atmaca', 'sirius', 'saturn', 'jupiter'
];
`;

// Add SIMPLE_PASSWORDS right after VISUAL_PASSWORDS
code = code.replace(/\]\n\n\nfunction normalizeStr/g, ']\n' + simplePasswordsStr + '\n\nfunction normalizeStr');

// Change default mode to 'auto'
code = code.replace(/const \[mode, setMode\] = useState\('visual'\)/, "const [mode, setMode] = useState('auto')");

// Handle targetEmail and targetPassword for auto
const autoAuthLogic = `
    if (mode === 'auto') {
      if (!form.gradeNumber) return setError('Sınıf seviyesi gerekli.')
      const slug = normalizeStr(form.fullName).replace(/[^a-z0-9]/g, '');
      const randomWord = SIMPLE_PASSWORDS[Math.floor(Math.random() * SIMPLE_PASSWORDS.length)];
      const randomNum = Math.floor(10 + Math.random() * 90); // 10-99
      targetEmail = \`\${slug}\${randomNum}@aistudio.com\`;
      targetPassword = randomWord;
    } else {
`;
code = code.replace(/if \(mode === 'visual'\) \{[\s\S]*?\} else \{/, autoAuthLogic.trim() + ' {');

// Update Firestore doc to save simplePass
code = code.replace(/visualId:    mode === 'visual' \? form.visualId : null,/, "visualId: null,\n          simplePass: mode === 'auto' ? targetPassword : null,");

// Replace the UI Tab selector
const tabSelector = `
        <div className="flex bg-white shadow-sm p-1.5 rounded-2xl mb-6 relative z-10">
          <button type="button" onClick={() => setMode('auto')}
            className={\`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all \${mode === 'auto' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}\`}>
            ✨ Otomatik Şifre (Kolay)
          </button>
          <button type="button" onClick={() => setMode('email')}
            className={\`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all \${mode === 'email' ? 'bg-slate-50 text-white shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}\`}>
            📧 E-posta (Manuel)
          </button>
        </div>
`;
code = code.replace(/<div className="flex bg-white shadow-sm p-1\.5 rounded-2xl mb-6 relative z-10">[\s\S]*?<\/div>/, tabSelector.trim());

// Replace the visualId selector with info about auto generation
const autoInfo = `
          {mode === 'auto' ? (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center mt-4">
              <span className="text-2xl mb-2 block">✨</span>
              <h4 className="text-indigo-800 font-bold text-sm mb-1">Kolay Giriş Sistemi</h4>
              <p className="text-indigo-600/80 text-xs leading-relaxed">
                Öğrenci için otomatik olarak "isim+sayı" şeklinde bir kullanıcı adı ve akılda kalıcı tek kelimelik (örn: kaplan, yildiz) bir şifre oluşturulacaktır. Şifrelerde özel karakter bulunmaz.
              </p>
            </div>
          ) : (
`;
code = code.replace(/\{mode === 'visual' \? \([\s\S]*?\) : \(/, autoInfo.trim() + ' (');

fs.writeFileSync('src/components/admin/AddStudentModal.jsx', code);
console.log('Patched AddStudentModal.jsx');
