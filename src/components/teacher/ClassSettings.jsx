import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getSchoolSettings, updateSchoolSettings } from '../../firebase/schema'

export default function ClassSettings() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({ codingModuleEnabled: false, aiAssistantEnabled: false })

  useEffect(() => {
    loadSettings()
  }, [profile])

  async function loadSettings() {
    try {
      const data = await getSchoolSettings("global_school")
      setSettings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function toggleAiAssistant() {
    setSaving(true)
    try {
      const newVal = !settings.aiAssistantEnabled
      await updateSchoolSettings("global_school", { aiAssistantEnabled: newVal })
      setSettings(prev => ({ ...prev, aiAssistantEnabled: newVal }))
    } catch (err) {
      console.error(err)
    }
    setSaving(false)
  }

  async function toggleCodingModule() {
    setSaving(true)
    try {
      const newVal = !settings.codingModuleEnabled
      await updateSchoolSettings("global_school", { codingModuleEnabled: newVal })
      setSettings(prev => ({ ...prev, codingModuleEnabled: newVal }))
    } catch (err) {
      console.error(err)
      alert("Hata oluştu: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-10 text-slate-400">Yükleniyor...</div>

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-black text-slate-800 mb-6">Sınıf ve Modül Ayarları</h2>
      
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between gap-6">
          <div className="flex gap-6 items-start">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/20 flex-shrink-0">
              🎮
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Oyunlar ve Ders Araçları Modülü</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xl mb-4">
                Bu modülü açtığınızda, 3. ve 4. sınıf (veya daha küçük yaş) öğrencilerinizin panelinde 
                <strong> "Oyunlar"</strong> ve <strong> "Araçlar"</strong> sekmeleri belirir. Bu alanda Blockly Games, Scratch (TurboWarp), MakeCode (Micro:bit) ve Çizim Araçları gibi 
                eğitici mini oyunlar bulunur. Görevlere odaklanmalarını istediğinizde bu modülü kapatabilirsiniz.
              </p>
              <div className="flex gap-2 items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${settings.codingModuleEnabled ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                  {settings.codingModuleEnabled ? 'Aktif - Açık' : 'Pasif - Kapalı'}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={toggleCodingModule}
            disabled={saving}
            className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors focus:outline-none ${settings.codingModuleEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <span
              className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${settings.codingModuleEnabled ? 'translate-x-11' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm mt-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex gap-6 items-start">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-blue-500/20 flex-shrink-0">
              🤖
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">OHEP Zeka (AI Asistan) Modülü</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xl mb-4">
                Öğrenci panelindeki yapay zeka sohbet asistanını (OHEP Zeka) açıp kapatır. Kapalı olduğunda öğrenciler asistan sekmesini göremez. Dikkat dağınıklığını önlemek veya sınav anlarında kapatmak için kullanabilirsiniz.
              </p>
              <div className="flex gap-2 items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${settings.aiAssistantEnabled ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                  {settings.aiAssistantEnabled ? 'Aktif - Açık' : 'Pasif - Kapalı'}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={toggleAiAssistant}
            disabled={saving}
            className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors focus:outline-none ${settings.aiAssistantEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <span
              className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${settings.aiAssistantEnabled ? 'translate-x-11' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>
    </div>
  )

}
