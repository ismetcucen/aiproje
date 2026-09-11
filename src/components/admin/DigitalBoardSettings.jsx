import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getDigitalBoardSettings, updateDigitalBoardSettings } from '../../firebase/schema'
import { db } from '../../firebase/config'
import { doc, updateDoc } from 'firebase/firestore'

export default function DigitalBoardSettings() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    backgroundImageUrl: '', backgroundImages: [],
    dutyTeachers: { primary: '', middle: '', high: '' },
    examDates: { lgs: '2027-06-13T09:00', tyt: '2027-06-19T10:15', ayt: '2027-06-20T10:15', ydt: '2027-06-20T15:45' },
    timetable: [],
    dailyMenu: [], robotFacts: [],
    achievements: {
      studentOfTheWeek: 'Henüz Seçilmedi',
      roboticProject: 'Henüz Seçilmedi',
      coderOfTheWeek: 'Henüz Seçilmedi',
      problemSolver: 'Henüz Seçilmedi',
      mostImproved: 'Henüz Seçilmedi'
    },
    
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
    await updateDigitalBoardSettings(profile.schoolCode, settings, profile)
    setSaving(false)
    alert('Pano ayarları başarıyla kaydedildi!')
  }

  if (loading) return <div>Yükleniyor...</div>


  async function handleLiveEvent(type, payload = null) {
    if (!profile?.schoolCode) return
    try {
      await updateDoc(doc(db, 'school_settings', `digital_board_${profile.schoolCode}`), {
        liveEvent: { type, payload, timestamp: Date.now() }
      })
      alert('Tetiklendi!')
    } catch(e) {
      alert('Hata: ' + e.message)
    }
  }

  async function handleLiveAnnouncement() {
    const msg = prompt("Panoda CEVBOT'a ne söyleteceksiniz?")
    if (msg) {
      handleLiveEvent('announcement', msg)
    }
  }

  return (

    <div className="max-w-4xl space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-black text-slate-800">🖥️ Dijital Pano Ayarları</h2>
        <p className="text-slate-500 text-sm">Okul koridorlarındaki dev ekranlarda görünecek bilgileri buradan güncelleyin.</p>
        <p className="mt-2 text-indigo-600 font-bold text-xs">Pano Linki: <a href="/pano" target="_blank" className="underline">SiteAdresi.com/pano</a></p>
      </div>

      {/* Canlı Pano Kumandası */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl shadow-sm border border-emerald-100 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl animate-pulse">🔴</span>
          <div>
            <h3 className="text-lg font-black text-emerald-900">Canlı Pano Kumandası</h3>
            <p className="text-emerald-700 text-xs">Aşağıdaki butonlara bastığınızda koridordaki panoda anında gerçekleşir.</p>
          </div>
        </div>
        <div className="flex gap-4 flex-wrap">
          <button onClick={() => handleLiveEvent('confetti')} className="bg-white border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-500 hover:text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2">
            🎉 Konfeti Patlat
          </button>
          <button onClick={handleLiveAnnouncement} className="bg-white border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-500 hover:text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2">
            🤖 CEVBOT Anons Yap
          </button>
          <button onClick={() => handleLiveEvent('reload')} className="bg-white border-2 border-red-500 text-red-700 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2">
            🔄 Panoyu Yenile
          </button>
        </div>
      </div>

      {/* Arka Plan Slayt & Söz */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-slate-500">Slayt Arka Plan Fotoğrafları (URL)</label>
            <button onClick={() => setSettings({...settings, backgroundImages: [...(settings.backgroundImages||[settings.backgroundImageUrl].filter(Boolean)), '']})} 
                    className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold">+ Fotoğraf Ekle</button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {/* Geriye dönük uyumluluk için eski tekli URL'yi de array gibi gösterelim */}
            {(!(settings.backgroundImages) || settings.backgroundImages.length === 0) && (
              <div className="flex gap-2">
                <input type="text" className="flex-1 border rounded-lg px-3 py-1.5 text-sm" 
                       value={settings.backgroundImageUrl || ''} 
                       onChange={e => setSettings({...settings, backgroundImages: [e.target.value]})}
                       placeholder="https://..." />
              </div>
            )}
            
            {(settings.backgroundImages || []).map((img, idx) => (
              <div key={idx} className="flex gap-2">
                <input type="text" className="flex-1 border rounded-lg px-3 py-1.5 text-sm" value={img}
                       placeholder="Fotoğraf Linki (https://...)"
                       onChange={e => {
                         const newArr = [...settings.backgroundImages]
                         newArr[idx] = e.target.value
                         setSettings({...settings, backgroundImages: newArr})
                       }} />
                <button onClick={() => {
                  const newArr = [...settings.backgroundImages]
                  newArr.splice(idx, 1)
                  setSettings({...settings, backgroundImages: newArr})
                }} className="text-red-500 px-2 font-bold hover:bg-red-50 rounded">X</button>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Birden fazla link eklendiğinde panoda her 15 saniyede bir fotoğraf değişir (Slayt Gösterisi).</p>
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

      <div className="grid grid-cols-1 gap-6">
        {/* CEVBOT Bilgileri */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="font-bold text-slate-700">🤖 CEVBOTun Söyleyeceği Bilgiler</h3>
            <button onClick={() => setSettings({...settings, robotFacts: [...(settings.robotFacts||[]), '']})} 
                    className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold">+ Yeni Bilgi Ekle</button>
          </div>
          <div className="space-y-2">
            {(settings.robotFacts || []).map((fact, idx) => (
              <div key={idx} className="flex gap-2">
                <input type="text" className="flex-1 border rounded-lg px-3 py-1.5 text-sm" value={fact}
                       placeholder="Örn: Biliyor muydunuz? Uzayda ağlayamazsınız..."
                       onChange={e => {
                         const newFacts = [...settings.robotFacts]
                         newFacts[idx] = e.target.value
                         setSettings({...settings, robotFacts: newFacts})
                       }} />
                <button onClick={() => {
                  const newFacts = [...settings.robotFacts]
                  newFacts.splice(idx, 1)
                  setSettings({...settings, robotFacts: newFacts})
                }} className="text-red-500 px-2 font-bold hover:bg-red-50 rounded">X</button>
              </div>
            ))}
            {(!settings.robotFacts || settings.robotFacts.length === 0) && <p className="text-xs text-slate-400">Özel bilgi girmediniz. Sistem kendi varsayılan bilimsel gerçeklerini kullanacak.</p>}
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
