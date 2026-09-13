import { useState } from 'react'
import { CURRICULUM, GRADES } from '../../data/curriculum'
import { db } from '../../firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function CurriculumEditor() {
  const [selectedGrade, setSelectedGrade] = useState('3')
  const [selectedWeek,  setSelectedWeek]  = useState(null)
  const [editForm,      setEditForm]      = useState(null)
  const [saving,        setSaving]        = useState(false)
  const [success,       setSuccess]       = useState('')
  const [localEdits,    setLocalEdits]    = useState({})

  function openEdit(week) {
    const grade = selectedGrade
    const key   = `${grade}_${week.week}`
    const data  = localEdits[key] || week
    setSelectedWeek(week.week)
    setEditForm({
      title:       data.title       || '',
      description: data.description || '',
      objectives:  (data.objectives || []).join('\n'),
      aiTools:     (data.aiTools    || []).join('\n'),
      duration:    data.duration    || 40,
      output:      data.output      || '',
      activity:    data.activity    || '',
    })
  }

  async function handleSave() {
    if (!editForm || !selectedWeek) return
    setSaving(true)
    try {
      const key = `${selectedGrade}_${selectedWeek}`
      const updated = {
        title:       editForm.title.trim(),
        description: editForm.description.trim(),
        objectives:  editForm.objectives.split('\n').map(s => s.trim()).filter(Boolean),
        aiTools:     editForm.aiTools.split('\n').map(s => s.trim()).filter(Boolean),
        duration:    Number(editForm.duration),
        output:      editForm.output.trim(),
        activity:    editForm.activity.trim(),
      }
      setLocalEdits(p => ({ ...p, [key]: { ...updated, week: selectedWeek } }))
      await addDoc(collection(db, 'curriculum_edits'), {
        grade:       selectedGrade,
        week:        selectedWeek,
        ...updated,
        editedAt:    serverTimestamp(),
      })
      setSuccess(`Hafta ${selectedWeek} guncellendi!`)
      setTimeout(() => setSuccess(''), 3000)
      setSelectedWeek(null)
      setEditForm(null)
    } catch(e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const curriculum = CURRICULUM[selectedGrade] || []

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-8">
        <h2 className="text-slate-800 text-3xl font-bold tracking-tight mb-1">Müfredat Düzenleyici</h2>
        <p className="text-slate-500 text-base">Okulun haftalık ders içeriklerini ve kazanımlarını yönetin</p>
      </div>

      {success && <div className="mb-6 p-4 rounded-xl bg-green-900/30 border border-green-500/50 text-green-300 text-sm font-medium flex items-center gap-2"><span>✅</span>{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sol Menü — Kademe ve Hafta Seçimi */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white backdrop-blur-md border border-slate-200/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <label className="block text-slate-700 text-sm font-bold uppercase tracking-wider mb-3 relative z-10">Kademe (Sınıf)</label>
            <div className="grid grid-cols-4 gap-2 relative z-10">
              {GRADES.map(g => (
                <button key={g} onClick={() => { setSelectedGrade(g); setSelectedWeek(null); setEditForm(null) }}
                  className={`py-3 rounded-xl text-sm font-bold transition-all ${
                    selectedGrade === g ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:border-slate-500 hover:text-slate-800'
                  }`}>
                  {g}.
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="block text-slate-500 text-xs font-bold uppercase tracking-wider px-2">Haftalık Plan ({selectedGrade}. Sınıf)</label>
            <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
              {curriculum.map(week => {
                const key     = `${selectedGrade}_${week.week}`
                const edited  = !!localEdits[key]
                return (
                  <button key={week.week} onClick={() => openEdit(week)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 ${
                      selectedWeek === week.week
                        ? 'bg-indigo-900/30 border-indigo-500/50 shadow-lg shadow-indigo-900/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-200'
                    }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${selectedWeek === week.week ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-50 text-slate-500'}`}>Hafta {week.week}</span>
                          {edited && <span className="text-yellow-400 text-xs font-bold px-2 py-0.5 bg-yellow-400/10 rounded-md border border-yellow-400/20">Düzenlendi</span>}
                        </div>
                        <p className={`text-base font-bold leading-tight ${selectedWeek === week.week ? 'text-indigo-200' : 'text-slate-800'}`}>
                          {localEdits[key]?.title || week.title}
                        </p>
                      </div>
                    </div>
                    <p className={`text-xs mt-2 ${selectedWeek === week.week ? 'text-indigo-400' : 'text-slate-500'}`}>{week.dateRange}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sağ Alan — Form */}
        <div className="lg:col-span-8">
          {!editForm ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center flex flex-col items-center justify-center h-full min-h-[500px]">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-4xl">📚</div>
              <p className="text-slate-500 text-lg font-medium">Düzenlemek için sol taraftan bir hafta seçin.</p>
            </div>
          ) : (
            <div className="bg-white backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="mb-8 border-b border-slate-200/50 pb-6 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-indigo-500/20 text-indigo-400 text-sm font-bold px-3 py-1 rounded-lg border border-indigo-500/30">{selectedGrade}. Sınıf</span>
                  <span className="bg-slate-50 text-slate-700 text-sm font-bold px-3 py-1 rounded-lg">Hafta {selectedWeek}</span>
                </div>
                <h3 className="text-slate-800 text-2xl font-black mt-3">İçerik Düzenleme Formu</h3>
              </div>
              
              <div className="space-y-6 relative z-10">
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">Ders Başlığı</label>
                  <input value={editForm.title} onChange={e => setEditForm(p => ({...p, title: e.target.value}))}
                    className="w-full bg-white shadow-sm border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                </div>

                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">Açıklama</label>
                  <textarea value={editForm.description} onChange={e => setEditForm(p => ({...p, description: e.target.value}))}
                    rows={2} className="w-full bg-white shadow-sm border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">Kazanımlar <span className="text-slate-500 font-normal text-xs">(Her satıra 1 tane)</span></label>
                    <textarea value={editForm.objectives} onChange={e => setEditForm(p => ({...p, objectives: e.target.value}))}
                      rows={4} placeholder="Kazanım 1&#10;Kazanım 2"
                      className="w-full bg-white shadow-sm border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none custom-scrollbar transition-all" />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">AI Araçları <span className="text-slate-500 font-normal text-xs">(Her satıra 1 tane)</span></label>
                    <textarea value={editForm.aiTools} onChange={e => setEditForm(p => ({...p, aiTools: e.target.value}))}
                      rows={4} placeholder="ChatGPT&#10;Suno AI"
                      className="w-full bg-white shadow-sm border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none custom-scrollbar transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">Ders Süresi <span className="text-slate-500 font-normal text-xs">(Dakika)</span></label>
                    <input type="number" value={editForm.duration} onChange={e => setEditForm(p => ({...p, duration: e.target.value}))}
                      className="w-full bg-white shadow-sm border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">Çıktı / Ürün Formatı</label>
                    <input value={editForm.output} onChange={e => setEditForm(p => ({...p, output: e.target.value}))}
                      className="w-full bg-white shadow-sm border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">Aktivite Detayları</label>
                  <textarea value={editForm.activity} onChange={e => setEditForm(p => ({...p, activity: e.target.value}))}
                    rows={4} className="w-full bg-white shadow-sm border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none custom-scrollbar transition-all" />
                </div>

                <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-200/50 mt-8">
                  <button onClick={handleSave} disabled={saving}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white px-8 py-3.5 rounded-xl text-base font-bold transition-all shadow-lg shadow-indigo-600/20">
                    {saving ? 'Değişiklikler Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                  <button onClick={() => { setSelectedWeek(null); setEditForm(null) }}
                    className="bg-slate-50 hover:bg-slate-700 text-slate-700 px-8 py-3.5 rounded-xl text-base font-bold transition-all">
                    İptal Et
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
