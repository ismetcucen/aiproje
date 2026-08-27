const fs = require('fs');
let content = fs.readFileSync('src/components/teacher/SubmissionsList.jsx', 'utf8');

const oldReturnStart = "return (\n    <div className=\"max-w-5xl\">";
const newReturnStart = `return (
    <div className="max-w-7xl mx-auto pb-10">`;
content = content.replace(oldReturnStart, newReturnStart);

const oldHeader = `<div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white text-xl font-semibold">Uretimler</h2>
          <p className="text-slate-400 text-sm mt-0.5">{filtered.length} teslim</p>
        </div>
        <button onClick={loadData} className="text-slate-400 hover:text-white text-sm">Yenile</button>
      </div>`;
const newHeader = `<div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-white text-3xl font-black tracking-tight mb-1">Öğrenci Üretimleri</h2>
          <p className="text-slate-400 text-base">Toplam {filtered.length} görev teslimi listeleniyor</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm">
          <span>🔄</span> Yenile
        </button>
      </div>`;
content = content.replace(oldHeader, newHeader);

// Redesign filter buttons
const oldFilters = `<div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilterAssignment('all')}
          className={\`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors \${
            filterAssignment === 'all' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
          }\`}>Tumu</button>
        {assignmentList.map(a => (
          <button key={a.id} onClick={() => setFilterAssignment(a.id)}
            className={\`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors \${
              filterAssignment === a.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
            }\`}>{a.title}</button>
        ))}
      </div>`;
const newFilters = `<div className="flex gap-2 mb-8 flex-wrap">
        <button onClick={() => setFilterAssignment('all')}
          className={\`px-5 py-2.5 rounded-xl text-sm font-bold transition-all \${
            filterAssignment === 'all' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 border' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200'
          }\`}>Tümü</button>
        {assignmentList.map(a => (
          <button key={a.id} onClick={() => setFilterAssignment(a.id)}
            className={\`px-5 py-2.5 rounded-xl text-sm font-bold transition-all \${
              filterAssignment === a.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 border' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200'
            }\`}>{a.title}</button>
        ))}
      </div>`;
content = content.replace(oldFilters, newFilters);

// Rewrite grid
const oldGridStart = `<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">`;
const newGridStart = `<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 flex flex-col gap-3 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">`;
content = content.replace(oldGridStart, newGridStart);

const oldEmptyList = `<div className="text-center py-20">
              <p className="text-white font-medium mb-2">Henuz teslim yok</p>
              <p className="text-slate-400 text-sm">Ogrenciler gorev teslim ettiginde burada gorunecek.</p>
            </div>`;
const newEmptyList = `<div className="text-center py-20 bg-slate-900/50 border border-slate-800/50 border-dashed rounded-3xl">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-slate-300 font-bold mb-2">Henüz teslim yok</p>
              <p className="text-slate-500 text-sm">Öğrenciler görev teslim ettiğinde burada görünecek.</p>
            </div>`;
content = content.replace(oldEmptyList, newEmptyList);

// List item
const oldListItem = `<div key={sub.id} onClick={() => openSubmission(sub)}
                className={\`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-colors \${
                  selected?.id === sub.id ? 'border-indigo-500' : 'border-slate-800 hover:border-slate-700'
                }\`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-indigo-900/60 border border-indigo-800 flex items-center justify-center">
                        <span className="text-indigo-300 text-xs font-semibold">
                          {student?.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <span className="text-white text-sm font-medium">
                        {student?.fullName || 'Bilinmeyen Ogrenci'}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {student?.gradeNumber ? \`\${student.gradeNumber}. sinif\` : ''}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mb-1">{assignments[sub.assignmentId]?.title || 'Gorev bulunamadi'}</p>
                    <p className="text-slate-500 text-xs">{sub.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || ''}</p>
                    <p className="text-slate-400 text-xs mt-2 line-clamp-2">{sub.content}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {sub.score !== null && sub.score !== undefined ? (
                      <span className={\`text-sm font-bold \${sub.score >= 70 ? 'text-green-400' : sub.score >= 50 ? 'text-amber-400' : 'text-red-400'}\`}>
                        {sub.score}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">Puansiz</span>
                    )}
                    {sub.aiUsed && <span className="text-xs bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded">AI</span>}
                  </div>
                </div>
              </div>`;

const newListItem = `<button key={sub.id} onClick={() => openSubmission(sub)}
                className={\`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 \${
                  selected?.id === sub.id
                    ? 'bg-indigo-900/30 border-indigo-500/50 shadow-lg shadow-indigo-900/20'
                    : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                }\`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {student?.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="truncate">
                        <span className="text-slate-200 text-sm font-bold mr-2">
                          {student?.fullName || 'Bilinmeyen Öğrenci'}
                        </span>
                        <span className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">
                          {student?.gradeNumber ? \`\${student.gradeNumber}. SINIF\` : ''}
                        </span>
                      </div>
                    </div>
                    <p className={\`text-sm font-bold truncate \${selected?.id === sub.id ? 'text-indigo-300' : 'text-slate-400'}\`}>{assignments[sub.assignmentId]?.title || 'Görev bulunamadı'}</p>
                    <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">{sub.content}</p>
                    <p className="text-slate-500 text-[10px] mt-2 font-medium uppercase tracking-wider">{sub.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || ''}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {sub.score !== null && sub.score !== undefined ? (
                      <span className={\`text-lg font-black \${sub.score >= 70 ? 'text-green-400' : sub.score >= 50 ? 'text-amber-400' : 'text-red-400'}\`}>
                        {sub.score}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800 px-2 py-1 rounded-md">Puansız</span>
                    )}
                    {sub.aiUsed && <span className="text-[10px] font-bold bg-cyan-900/40 text-cyan-400 border border-cyan-800/50 px-2 py-1 rounded-md">AI DESTEKLİ</span>}
                  </div>
                </div>
              </button>`;
content = content.replace(oldListItem, newListItem);

// Detail panel
const oldDetailStart = `{selected ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-fit sticky top-0">`;
const newDetailStart = `<div className="lg:col-span-7">
        {selected ? (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl relative overflow-hidden h-fit sticky top-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>`;
content = content.replace(oldDetailStart, newDetailStart);

const oldDetailHeader = `<div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-900/60 border border-indigo-800 flex items-center justify-center">
                  <span className="text-indigo-300 text-sm font-semibold">
                    {students[selected.userId]?.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{students[selected.userId]?.fullName || 'Bilinmeyen Ogrenci'}</p>
                  <p className="text-slate-500 text-xs">{assignments[selected.assignmentId]?.title || ''}</p>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                  {CONTENT_TYPE_LABELS[selected.contentType] || selected.contentType}
                </span>
                {selected.aiUsed && (
                  <span className="text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-md">AI kullanildi</span>
                )}
              </div>
              <div className="bg-slate-800 rounded-lg p-3 max-h-48 overflow-auto">
                <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">{selected.content}</p>
              {selected.files && selected.files.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selected.files.map((f, i) => (
                    <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="bg-slate-700 hover:bg-slate-600 text-xs px-2 py-1 rounded text-blue-300">
                      📎 {f.name}
                    </a>
                  ))}
                </div>
              )}

              </div>
            </div>
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <p className="text-white text-sm font-medium">Geri Bildirim</p>`;

const newDetailHeader = `<div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl font-bold">
                    {students[selected.userId]?.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className="text-white text-xl font-bold">{students[selected.userId]?.fullName || 'Bilinmeyen Öğrenci'}</p>
                  <p className="text-slate-400 text-sm font-medium">{assignments[selected.assignmentId]?.title || ''}</p>
                </div>
              </div>
              <div className="flex gap-2 mb-6 relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg">
                  {CONTENT_TYPE_LABELS[selected.contentType] || selected.contentType}
                </span>
                {selected.aiUsed && (
                  <span className="text-xs font-bold uppercase tracking-wider bg-cyan-900/40 text-cyan-400 border border-cyan-800/50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                    🤖 AI Destekli
                  </span>
                )}
              </div>
              <div className="bg-slate-950/50 border border-slate-700/50 rounded-2xl p-6 max-h-64 overflow-y-auto custom-scrollbar relative z-10 mb-8">
                <p className="text-slate-200 text-base whitespace-pre-wrap leading-relaxed">{selected.content}</p>
                {selected.files && selected.files.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2">
                    {selected.files.map((f, i) => (
                      <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="bg-indigo-900/30 border border-indigo-800/50 hover:bg-indigo-900/50 text-sm px-4 py-2 rounded-xl text-indigo-300 transition-colors font-medium">
                        📎 {f.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-slate-800/50 pt-8 space-y-6 relative z-10">
              <h4 className="text-white text-lg font-bold">Geri Bildirim & Değerlendirme</h4>`;
content = content.replace(oldDetailHeader, newDetailHeader);

const oldFeedbackForm = `<div>
                <label className="block text-slate-400 text-xs mb-1">Puan (0-100)</label>
                <input type="number" min={0} max={100} value={score} onChange={e => setScore(e.target.value)}
                  placeholder="85"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Yorum</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Harika bir uretim!..." rows={3}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none" />

              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="showcase" checked={isShowcase} onChange={e => setIsShowcase(e.target.checked)} className="w-4 h-4 accent-indigo-600" />
                <label htmlFor="showcase" className="text-slate-300 text-sm">Vitrinde Sergile (Tüm sınıf görsün)</label>
              </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleFeedback} disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                {saved && <span className="text-green-400 text-xs">Kaydedildi!</span>}
              </div>`;

const newFeedbackForm = `<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Puan (0-100)</label>
                  <input type="number" min={0} max={100} value={score} onChange={e => setScore(e.target.value)}
                    placeholder="100"
                    className="w-full bg-slate-950 border border-slate-700 text-white font-bold text-lg rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-center" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Öğretmen Yorumu</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)}
                    placeholder="Harika bir tasarım olmuş, tebrikler!" rows={3}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none custom-scrollbar transition-all" />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl">
                <input type="checkbox" id="showcase" checked={isShowcase} onChange={e => setIsShowcase(e.target.checked)} className="w-5 h-5 rounded border-indigo-500 text-indigo-600 focus:ring-indigo-500 bg-slate-950" />
                <label htmlFor="showcase" className="text-indigo-200 text-sm font-bold cursor-pointer">Vitrinde Sergile (Tüm sınıf ve okul panosunda görsün)</label>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button onClick={handleFeedback} disabled={saving}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white px-8 py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/50 flex-1">
                  {saving ? 'Değerlendirme Kaydediliyor...' : 'Değerlendirmeyi Kaydet'}
                </button>
                {saved && <span className="text-emerald-400 text-sm font-bold bg-emerald-900/30 px-4 py-3.5 rounded-xl border border-emerald-800/50">✅ Kaydedildi!</span>}
              </div>`;
content = content.replace(oldFeedbackForm, newFeedbackForm);

const oldDetailEmpty = `) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-center min-h-48">
            <p className="text-slate-600 text-sm">Detay icin bir uretim sec.</p>
          </div>
        )}`;
const newDetailEmpty = `) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-16 text-center flex flex-col items-center justify-center h-full min-h-[500px]">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-4xl">📝</div>
            <p className="text-slate-400 text-lg font-medium">Değerlendirmek için sol taraftan bir teslim seçin.</p>
          </div>
        )}
        </div>`;
content = content.replace(oldDetailEmpty, newDetailEmpty);

fs.writeFileSync('src/components/teacher/SubmissionsList.jsx', content, 'utf8');
console.log('SubmissionsList updated');
