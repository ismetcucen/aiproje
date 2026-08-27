const fs = require('fs');

let content = fs.readFileSync('src/components/teacher/SubmissionsList.jsx', 'utf8');

content = content.replace(
  '<button onClick={loadData} className="text-slate-400 hover:text-white text-sm">Yenile</button>',
  `<div className="flex items-center gap-4">
          <button onClick={exportToExcel} className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-600/30 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/20">
            <span>📊</span> Excel İndir
          </button>
          <button onClick={loadData} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-all border border-slate-700">
            Yenile
          </button>
        </div>`
);

fs.writeFileSync('src/components/teacher/SubmissionsList.jsx', content, 'utf8');
console.log('UI updated');
