const fs = require('fs');
let content = fs.readFileSync('src/pages/student/StudentPanel.jsx', 'utf8');

const oldSidebar = `<aside className="w-56 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-xl font-bold">+</span>
          </div>
          <div>
            <p className="text-slate-800 text-sm font-semibold leading-tight">ÖHEP AI Studio</p>
            <p className="text-slate-500 text-xs">Öğrenci Paneli</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {MENU.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors \${
                active === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }\`}>
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <div className="px-3 py-2 mb-1">
            <p className="text-slate-800 text-sm font-medium truncate">{profile?.fullName}</p>
            <p className="text-slate-500 text-xs">
              {profile?.classLevel} {profile?.gradeNumber ? \`· \${profile.gradeNumber}. sınıf\` : ''}
            </p>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-sm transition-colors">
            <span>🚪</span>
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>`;

const newSidebar = `<aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 shadow-2xl relative z-20">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20 border border-indigo-400/20">
            <img src="/ohep.jpeg" alt="Logo" className="w-6 h-6 object-contain rounded-md" />
          </div>
          <div className="overflow-hidden">
            <p className="text-slate-100 text-sm font-bold tracking-wide leading-tight whitespace-nowrap">ÖHEP AI Studio</p>
            <p className="text-indigo-400 text-xs font-medium mt-0.5 whitespace-nowrap">Öğrenci Paneli</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {MENU.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={\`w-full flex items-center justify-start px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group \${
                active === item.id
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }\`}>
              <span className={\`text-lg flex-shrink-0 transition-transform duration-200 \${active === item.id ? 'scale-110' : 'group-hover:scale-110'}\`}>{item.icon}</span>
              <span className="ml-3 truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="px-2 mb-3">
            <p className="text-slate-200 text-sm font-bold truncate">{profile?.fullName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                {profile?.classLevel} {profile?.gradeNumber ? \`· \${profile.gradeNumber}. SINIF\` : ''}
              </p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center justify-start px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all group border border-transparent hover:border-red-500/20">
            <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform">🚪</span>
            <span className="ml-3">Çıkış Yap</span>
          </button>
        </div>
      </aside>`;

let newContent = content.replace(oldSidebar, newSidebar);

// Also need to make sure the header looks nice with this new sidebar.
const oldHeader = `<header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-slate-800 font-semibold">
            {MENU.find(m => m.id === active)?.label}
          </h1>
          <div className="text-slate-500 text-sm">{profile?.schoolCode}</div>
        </header>`;

const newHeader = `<header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-slate-800 font-bold text-lg leading-tight">
                {MENU.find(m => m.id === active)?.label}
              </h1>
              <p className="text-slate-400 text-xs font-medium">Çalışma Alanı</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
            <span className="text-xl">🏫</span>
            <div>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider leading-none mb-0.5">Okul</p>
              <p className="text-indigo-700 text-xs font-bold leading-none">{profile?.schoolCode}</p>
            </div>
          </div>
        </header>`;

newContent = newContent.replace(oldHeader, newHeader);
fs.writeFileSync('src/pages/student/StudentPanel.jsx', newContent, 'utf8');
