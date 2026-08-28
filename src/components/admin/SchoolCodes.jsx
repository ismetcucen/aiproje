import { useState } from 'react'

export default function SchoolCodes() {
  const envCodes = (import.meta.env.VITE_VALID_SCHOOL_CODES || '').split(',').filter(Boolean)
  const [codes] = useState(envCodes)

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-slate-800 text-xl font-semibold">Okul Kodlari</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Gecerli okul kodlari .env dosyasinda tanimlidir.
        </p>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-5 mb-4">
        <h3 className="text-slate-800 font-medium mb-3">Aktif Okul Kodlari</h3>
        <div className="space-y-2">
          {codes.map(code => (
            <div key={code} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-white font-mono font-medium">{code}</span>
              </div>
              <span className="text-green-400 text-xs">Aktif</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-5">
        <h3 className="text-slate-800 font-medium mb-2">Yeni Kod Eklemek Icin</h3>
        <p className="text-slate-500 text-sm mb-3">
          Yeni okul kodu eklemek icin <code className="bg-slate-50 px-1.5 py-0.5 rounded text-indigo-300">.env.local</code> dosyasindaki <code className="bg-slate-50 px-1.5 py-0.5 rounded text-indigo-300">VITE_VALID_SCHOOL_CODES</code> degerini guncelle.
        </p>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-slate-700 font-mono text-xs">
            VITE_VALID_SCHOOL_CODES={codes.join(',')},YENI_KOD
          </p>
        </div>
        <p className="text-slate-500 text-xs mt-3">
          Degisiklik sonrasi Vercel'de de environment variable'i guncellemeyi unutma.
        </p>
      </div>
    </div>
  )
}
