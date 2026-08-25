const fs = require('fs');
let content = fs.readFileSync('src/components/admin/ClassManager.jsx', 'utf8');

// We will do a full rewrite of the return statement
const oldReturnStart = "return (\n    <div className=\"max-w-5xl\">";
const newReturn = `return (
    <div className="max-w-6xl mx-auto pb-10">
      {showModal && (
        <AddStudentModal
          classInfo={selected}
          schoolCode={schoolCode}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-white text-3xl font-bold tracking-tight mb-1">Sınıf Yönetimi</h2>
          <p className="text-slate-400 text-base">{classes.length} aktif sınıf mevcut</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm">
          <span>🔄</span> Yenile
        </button>
      </div>

      {error   && <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-500/50 text-red-300 text-sm font-medium flex items-center gap-2"><span>⚠️</span>{error}</div>}
      {success && <div className="mb-6 p-4 rounded-xl bg-green-900/30 border border-green-500/50 text-green-300 text-sm font-medium flex items-center gap-2"><span>✅</span>{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sol Menü: Sınıflar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
            <h3 className="text-white text-lg font-bold mb-4 relative z-10">Yeni Sınıf Oluştur</h3>
            <div className="flex gap-3 mb-4 relative z-10">
              <select value={newGrade} onChange={e => setNewGrade(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 text-base font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all">
                {GRADES.map(g => <option key={g} value={g}>{g}. Sınıf</option>)}
              </select>
              <select value={newSection} onChange={e => setNewSection(e.target.value)}
                className="w-24 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 text-base font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all">
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={handleCreateClass} disabled={saving}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white py-3.5 rounded-xl text-base font-bold transition-all shadow-lg shadow-red-600/20 relative z-10">
              {saving ? 'Oluşturuluyor...' : '+ Sınıfı Ekle'}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-slate-400 font-semibold uppercase tracking-wider text-xs px-2">Mevcut Sınıflar</h3>
            {classes.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
                <p className="text-slate-500 text-base">Henüz sınıf yok.</p>
              </div>
            ) : classes.map(cls => (
              <button key={cls.id} onClick={() => selectClass(cls)}
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
              </button>
            ))}
          </div>
        </div>

        {/* Sağ Alan: Sınıf Detayı */}
        <div className="lg:col-span-8">
          {!selected ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-16 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-4xl">🏫</div>
              <p className="text-slate-400 text-lg font-medium">İşlem yapmak için sol taraftan bir sınıf seçin.</p>
            </div>
          ) : (
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[500px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 relative z-10">
                <div>
                  <h3 className="text-white text-3xl font-black mb-1">{selected.name} Sınıfı</h3>
                  <p className="text-slate-400 text-base">{students.length} öğrenci kayıtlı</p>
                </div>
                <button onClick={() => setShowModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 whitespace-nowrap">
                  <span>+</span> Yeni Öğrenci Ekle
                </button>
              </div>

              <div className="flex flex-wrap gap-3 mb-8 relative z-10 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-fit">
                {[
                  { id: 'students', label: \`Kayıtlı Öğrenciler (\${students.length})\`, icon: '🎓' },
                  { id: 'add',      label: 'Mevcut Öğrenci Seç', icon: '🔍' },
                  { id: 'excel',    label: 'Excel ile Yükle', icon: '📄' },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={\`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all \${
                      tab === t.id ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }\`}>
                    <span>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>

              <div className="relative z-10">
                {tab === 'students' && (
                  <div className="space-y-3">
                    {students.length === 0 ? (
                      <div className="text-center py-16 bg-slate-950/50 rounded-2xl border border-slate-800/50 border-dashed">
                        <div className="text-4xl mb-4">📭</div>
                        <p className="text-slate-400 text-lg mb-4">Bu sınıfta henüz öğrenci yok.</p>
                        <button onClick={() => setShowModal(true)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors">
                          İlk Öğrenciyi Ekle
                        </button>
                      </div>
                    ) : students.map(s => (
                      <div key={s.id} className="flex items-center justify-between bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 hover:border-slate-700 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="text-white text-lg font-bold">{s.fullName?.charAt(0)?.toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-white text-lg font-semibold">{s.fullName}</p>
                            <p className="text-slate-400 text-sm">{s.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Aktif</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'add' && (
                  <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6">
                    <p className="text-slate-400 text-sm font-medium mb-6">Okul sistemine kayıtlı olup bir sınıfa atanmamış öğrenciler:</p>
                    {available.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-slate-500 text-base">Eklenebilecek boştaki öğrenci bulunmuyor.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {available.map(u => (
                          <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 hover:border-slate-600 transition-colors">
                            <div>
                              <p className="text-white font-semibold">{u.fullName}</p>
                              <p className="text-slate-400 text-xs mt-1">{u.email}</p>
                            </div>
                            <button onClick={() => handleAddExisting(u.id)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap">
                              Sınıfa Ekle
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'excel' && (
                  <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6">
                    <BulkStudentUpload
                      classInfo={selected}
                      schoolCode={schoolCode}
                      onSuccess={async (count) => {
                        setSuccess(\`\${count} öğrenci başarıyla eklendi!\`)
                        setTimeout(() => setSuccess(''), 4000)
                        await loadData()
                        if (selected) {
                          const studs = await import('../../firebase/schema').then(m => m.getStudentsByClass(selected.id))
                          setStudents(studs)
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}`;

const startIndex = content.indexOf('return (');
if (startIndex !== -1) {
  content = content.substring(0, startIndex) + newReturn + "\n}\n";
  fs.writeFileSync('src/components/admin/ClassManager.jsx', content, 'utf8');
  console.log('ClassManager updated');
} else {
  console.log('Could not find return statement in ClassManager');
}
