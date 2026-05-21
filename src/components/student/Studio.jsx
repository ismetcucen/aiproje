import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { createSubmission, logAiInteraction } from '../../firebase/schema'

const AI_ACTIONS = [
  { id: 'idea',    label: 'Fikir Ver'    },
  { id: 'example', label: 'Ornek Goster' },
  { id: 'help',    label: 'Yonlendir'    },
  { id: 'rewrite', label: 'Gelistir'     },
]

export default function Studio({ assignment, onBack }) {
  const { user, profile } = useAuth()
  const [content, setContent]       = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [error, setError]           = useState('')
  const [aiUsed, setAiUsed]         = useState(false)

  if (!assignment) {
    return (
      <div className="text-center py-20">
        <p className="text-white font-medium mb-4">Hicbir gorev secilmedi.</p>
        <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300 text-sm">
          Gorevlere Don
        </button>
      </div>
    )
  }

  async function askAi(purpose) {
    if (!content.trim() && purpose !== 'idea') {
      setAiResponse('Once biraz yaz, sonra AI yardim isteyebilirsin.')
      return
    }
    setAiLoading(true)
    setAiResponse('')
    try {
      const prompt = buildPrompt(purpose, assignment, content, profile)
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      )
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Yanit alinamadi.'
      setAiResponse(text)
      setAiUsed(true)
      await logAiInteraction({
        userId:       user.uid,
        assignmentId: assignment.id,
        inputText:    content,
        outputText:   text,
        purpose,
      })
    } catch (err) {
      console.error(err)
      setAiResponse('AI su an yanit veremiyor. Tekrar deneyin.')
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSave() {
    if (!content.trim()) return setError('Lutfen once bir seyler yaz.')
    setError('')
    setSaving(true)
    try {
      await createSubmission({
        userId:       user.uid,
        assignmentId: assignment.id,
        content:      content.trim(),
        contentType:  assignment.contentTypes?.[0] || 'text',
        aiUsed,
        aiNotes:      aiUsed ? 'AI yardim alindi' : null,
        schoolCode:   profile.schoolCode,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
      setError('Kaydetme basarisiz. Tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors text-sm">
          &larr; Geri
        </button>
        <div className="w-px h-4 bg-slate-700" />
        <h2 className="text-white font-semibold">{assignment.title}</h2>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Gorev</p>
        <p className="text-slate-200 text-sm">{assignment.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Yazı Alanı */}
        <div className="flex flex-col">
          <label className="text-slate-300 text-sm font-medium mb-2">Uretiminiz</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Buraya yazin..."
            className="flex-1 min-h-64 bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-slate-500 text-xs">{content.length} karakter</span>
            <div className="flex items-center gap-3">
              {error && <span className="text-red-400 text-xs">{error}</span>}
              {saved && <span className="text-green-400 text-xs">Kaydedildi!</span>}
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
          {aiUsed && (
            <p className="text-slate-500 text-xs mt-2">AI yardimi kullanildi.</p>
          )}
        </div>

        {/* AI Yardım */}
        <div className="flex flex-col">
          <label className="text-slate-300 text-sm font-medium mb-2">AI Yardim</label>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {AI_ACTIONS.map(action => (
                <button
                  key={action.id}
                  onClick={() => askAi(action.id)}
                  disabled={aiLoading}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors border border-slate-700"
                >
                  {action.label}
                </button>
              ))}
            </div>

            <div className="flex-1 min-h-40">
              {aiLoading ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  Dusunuyor...
                </div>
              ) : aiResponse ? (
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {aiResponse}
                </div>
              ) : (
                <p className="text-slate-600 text-sm">
                  Bir yardim turu sec. AI sadece bu gorev icin yardim edecek.
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800">
              <p className="text-slate-600 text-xs">
                AI sadece yonlendirici. Uretimi sen yapiyorsun.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function buildPrompt(purpose, assignment, content, profile) {
  const levelMap = {
    ilkokul:  'Ilkokul ogrencisi (1-4. sinif). Cok basit ve anlasilir dil kullan.',
    ortaokul: 'Ortaokul ogrencisi (5-8. sinif). Aciklayici ve yonlendirici ol.',
    lise:     'Lise ogrencisi (9-12. sinif). Analitik ve derinlemesine dusundur.',
  }
  const levelNote = levelMap[profile?.classLevel] || 'Ortaokul ogrencisi.'

  const base = `Sen bir egitim asistanisin. ${levelNote}
Gorev: "${assignment.title}"
Gorev aciklamasi: "${assignment.description}"
Ogrencinin su anki yazisi: "${content || '(henuz bos)'}"

ONEMLI KURALLAR:
- Serbest sohbet etme, sadece bu gorevle ilgili yardim et
- Odeviyi sen yapma, yonlendir
- Kisa ve net ol (max 150 kelime)`

  const purposeMap = {
    idea:    `${base}\n\nOgrenciye bu gorev icin 3 farkli fikir oner. Her fikri 1-2 cumleyle acikla.`,
    example: `${base}\n\nBu gorev icin kisa bir ornek yaz (3-4 cumle). Sonra "Simdi sen kendi ornegini yaz" de.`,
    help:    `${base}\n\nOgrencinin yazisini oku ve nereye devam edebilecegini soyle. Soru sorarak yonlendir.`,
    rewrite: `${base}\n\nOgrencinin yazisini oku ve nasil gelistirebilecegini soyle. 2-3 somut oneri ver.`,
  }
  return purposeMap[purpose] || base
}
