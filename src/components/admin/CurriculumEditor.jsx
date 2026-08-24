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
    <div className="max-w-6xl">
      <div className="mb-6">
        <h2 className="text-white text-xl font-semibold">Mufredat Duzenleyici</h2>
        <p className="text-slate-400 text-sm mt-0.5">Haftalik ders iceriklerini duzenle</p>
      </div>

      {success && <div className="mb-4 p-3 rounded-lg bg-green-900/40 border border-green-800 text-green-300 text-sm">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sol — Sınıf + Hafta Seç */}
        <div>
          <div className="mb-4">
            <label className="block text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">Sinif</label>
            <div className="grid grid-cols-4 gap-1">
              {GRADES.map(g => (
                <button key={g} onClick={() => { setSelectedGrade(g); setSelectedWeek(null); setEditForm(null) }}
                  className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                    selectedGrade === g ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
                  }`}>
                  {g}.
                </button>
              ))}
            </div>
          </div>

          <label className="block text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">Hafta Sec</label>
          <div className="space-y-1 max-h-96 overflow-auto pr-1">
            {curriculum.map(week => {
              const key     = `${selectedGrade}_${week.week}`
              const edited  = !!localEdits[key]
              return (
                <button key={week.week} onClick={() => openEdit(week)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                    selectedWeek === week.week
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}>
                  <span className="font-semibold mr-2">H{week.week}</span>
                  <span className="truncate">{localEdits[key]?.title || week.title} ({week.dateRange})</span>
                  {edited && <span className="ml-1 text-yellow-400">•</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Sağ — Düzenleme Formu */}
        <div className="lg:col-span-2">
          {!editForm ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-500">Sol taraftan bir hafta sec.</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">
                {selectedGrade}. Sinif — Hafta {selectedWeek}
              </h3>
              <div className="space-y-4">

                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1">Baslik</label>
                  <input value={editForm.title} onChange={e => setEditForm(p => ({...p, title: e.target.value}))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1">Aciklama</label>
                  <textarea value={editForm.description} onChange={e => setEditForm(p => ({...p, description: e.target.value}))}
                    rows={2} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-none" />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1">Kazanimlar (her satira bir tane)</label>
                  <textarea value={editForm.objectives} onChange={e => setEditForm(p => ({...p, objectives: e.target.value}))}
                    rows={3} placeholder="Kazanim 1&#10;Kazanim 2&#10;Kazanim 3"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm placeholder-slate-600 focus:outline-none focus:border-red-500 resize-none" />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1">AI Araclari (her satira bir tane)</label>
                  <textarea value={editForm.aiTools} onChange={e => setEditForm(p => ({...p, aiTools: e.target.value}))}
                    rows={2} placeholder="ChatGPT&#10;Google Gemini"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm placeholder-slate-600 focus:outline-none focus:border-red-500 resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-xs font-medium mb-1">Sure (dakika)</label>
                    <input type="number" value={editForm.duration} onChange={e => setEditForm(p => ({...p, duration: e.target.value}))}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-medium mb-1">Cikti Urun</label>
                    <input value={editForm.output} onChange={e => setEditForm(p => ({...p, output: e.target.value}))}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1">Aktivite</label>
                  <textarea value={editForm.activity} onChange={e => setEditForm(p => ({...p, activity: e.target.value}))}
                    rows={3} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-none" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={handleSave} disabled={saving}
                    className="bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <button onClick={() => { setSelectedWeek(null); setEditForm(null) }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    Iptal
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
