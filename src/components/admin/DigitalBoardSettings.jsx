import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getDigitalBoardSettings, updateDigitalBoardSettings } from '../../firebase/schema'

export default function DigitalBoardSettings() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    backgroundImageUrl: '',
    dutyTeachers: { primary: '', middle: '', high: '' },
    examDates: { lgs: '2027-06-13T09:00', tyt: '2027-06-19T10:15', ayt: '2027-06-20T10:15', ydt: '2027-06-20T15:45' },
    timetable: [],
    dailyMenu: [],
    quoteOfTheDay: ''
  })

  useEffect(() => {
    if (profile?.schoolCode) {
      getDigitalBoardSettings(profile.schoolCode).then(data => {
        setSettings(data)
        setLoading(false)
      })
    }
  }, [profile])

  async function handleSave() {
    setSaving(true)
    await updateDigitalBoardSettings(profile.schoolCode, settings)
    setSaving(false)
    alert('Pano ayarları başarıyla kaydedildi!')
  }

  if (loading) return <div>Yükleniyor...</div>

  return (
    <div className="max-w-4xl space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-black text-slate-800">🖥️ Dijital Pano Ayarları</h2>
        <p className="text-slate-500 text-sm">Okul koridorlarındaki dev ekranlarda görünecek bilgileri buradan güncelleyin.</p>
        <p className="mt-2 text-indigo-600 font-bold text-xs">Pano Linki: <a href="/pano" target="_blank" className="underline">SiteAdresi.com/pano</a></p>
      </div>

      {/* Arka Plan & Söz */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Arka Plan Görsel URL (Yatay / 1920x1080)</label>
          <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" 
                 value={settings.backgroundImageUrl || ''} 
                 onChange={e => setSettings({...settings, backgroundImageUrl: e.target.value})}
                 placeholder="https://..." />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Günün Sözü / Motivasyon</label>
          <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" 
                 value={settings.quoteOfTheDay || ''} 
                 onChange={e => setSettings({...settings, quoteOfTheDay: e.target.value})}
                 placeholder="Başarı, hazırlık ve fırsatın karşılaştığı yerdir." />
        </div>
      </div>

      {/* Nöbetçi Öğretmenler */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">Nöbetçi Öğretmenler</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">İlkokul</label>
            <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" 
                   value={settings.dutyTeachers?.primary || ''} 
                   onChange={e => setSettings({...settings, dutyTeachers: {...settings.dutyTeachers, primary: e.target.value}})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Ortaokul</label>
            <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" 
                   value={settings.dutyTeachers?.middle || ''} 
                   onChange={e => setSettings({...settings, dutyTeachers: {...settings.dutyTeachers, middle: e.target.value}})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Lise</label>
            <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" 
                   value={settings.dutyTeachers?.high || ''} 
                   onChange={e => setSettings({...settings, dutyTeachers: {...settings.dutyTeachers, high: e.target.value}})} />
          </div>
        </div>
      </div>

      {/* Sınav Tarihleri */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">Sınav Tarihleri (Geri Sayım İçin)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">LGS Tarihi</label>
            <input type="datetime-local" className="w-full border rounded-lg px-3 py-2 text-sm" 
                   value={settings.examDates?.lgs || ''} 
                   onChange={e => setSettings({...settings, examDates: {...settings.examDates, lgs: e.target.value}})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">TYT Tarihi</label>
            <input type="datetime-local" className="w-full border rounded-lg px-3 py-2 text-sm" 
                   value={settings.examDates?.tyt || ''} 
                   onChange={e => setSettings({...settings, examDates: {...settings.examDates, tyt: e.target.value}})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">AYT Tarihi</label>
            <input type="datetime-local" className="w-full border rounded-lg px-3 py-2 text-sm" 
                   value={settings.examDates?.ayt || ''} 
                   onChange={e => setSettings({...settings, examDates: {...settings.examDates, ayt: e.target.value}})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">YDT Tarihi</label>
            <input type="datetime-local" className="w-full border rounded-lg px-3 py-2 text-sm" 
                   value={settings.examDates?.ydt || ''} 
                   onChange={e => setSettings({...settings, examDates: {...settings.examDates, ydt: e.target.value}})} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yemek Menüsü */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="font-bold text-slate-700">Günün Yemek Menüsü</h3>
            <button onClick={() => setSettings({...settings, dailyMenu: [...(settings.dailyMenu||[]), '']})} 
                    className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold">+ Ekle</button>
          </div>
          <div className="space-y-2">
            {(settings.dailyMenu || []).map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input type="text" className="flex-1 border rounded-lg px-3 py-1.5 text-sm" value={item}
                       onChange={e => {
                         const newMenu = [...settings.dailyMenu]
                         newMenu[idx] = e.target.value
                         setSettings({...settings, dailyMenu: newMenu})
                       }} />
                <button onClick={() => {
                  const newMenu = [...settings.dailyMenu]
                  newMenu.splice(idx, 1)
                  setSettings({...settings, dailyMenu: newMenu})
                }} className="text-red-500 px-2 font-bold hover:bg-red-50 rounded">X</button>
              </div>
            ))}
            {(settings.dailyMenu || []).length === 0 && <p className="text-xs text-slate-400">Henüz menü eklenmemiş.</p>}
          </div>
        </div>

        {/* Zaman Çizelgesi */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="font-bold text-slate-700">Zaman Çizelgesi</h3>
            <button onClick={() => setSettings({...settings, timetable: [...(settings.timetable||[]), {label: '', time: ''}]})} 
                    className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold">+ Ekle</button>
          </div>
          <div className="space-y-2">
            {(settings.timetable || []).map((t, idx) => (
              <div key={idx} className="flex gap-2">
                <input type="text" placeholder="Örn: 1. Ders" className="w-1/2 border rounded-lg px-3 py-1.5 text-sm" value={t.label}
                       onChange={e => {
                         const newT = [...settings.timetable]
                         newT[idx].label = e.target.value
                         setSettings({...settings, timetable: newT})
                       }} />
                <input type="text" placeholder="08:30 - 09:10" className="w-1/2 border rounded-lg px-3 py-1.5 text-sm" value={t.time}
                       onChange={e => {
                         const newT = [...settings.timetable]
                         newT[idx].time = e.target.value
                         setSettings({...settings, timetable: newT})
                       }} />
                <button onClick={() => {
                  const newT = [...settings.timetable]
                  newT.splice(idx, 1)
                  setSettings({...settings, timetable: newT})
                }} className="text-red-500 px-2 font-bold hover:bg-red-50 rounded">X</button>
              </div>
            ))}
             {(settings.timetable || []).length === 0 && <p className="text-xs text-slate-400">Henüz çizelge eklenmemiş.</p>}
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg">
        {saving ? 'Kaydediliyor...' : 'DEĞİŞİKLİKLERİ KAYDET VE PANOYU GÜNCELLE'}
      </button>

    </div>
  )
}
