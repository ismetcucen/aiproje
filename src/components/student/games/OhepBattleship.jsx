import { useState, useEffect } from 'react'

export default function OhepBattleship() {
  const [ships, setShips] = useState([])
  const [shots, setShots] = useState([])
  const [inputCode, setInputCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [gameWon, setGameWon] = useState(false)
  const [message, setMessage] = useState('')

  // 10x10 grid. X: 1-10, Y: 1-10
  const GRID_SIZE = 10
  const NUM_SHIPS = 5

  useEffect(() => {
    initGame()
  }, [])

  function initGame() {
    setShots([])
    setGameWon(false)
    setMessage('Savaşa Hazırsın! Kodlarını yazmaya başla.')
    setInputCode('')
    setErrorMsg('')
    
    // Generate 5 random single-cell ships
    const newShips = []
    while(newShips.length < NUM_SHIPS) {
      const x = Math.floor(Math.random() * GRID_SIZE) + 1
      const y = Math.floor(Math.random() * GRID_SIZE) + 1
      if (!newShips.find(s => s.x === x && s.y === y)) {
        newShips.push({ x, y, hit: false })
      }
    }
    setShips(newShips)
  }

  function handleFire(e) {
    e.preventDefault()
    setErrorMsg('')
    
    // Parse input: atesEt(X, Y)
    const regex = /atesEt\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i
    const match = inputCode.match(regex)

    if (!match) {
      setErrorMsg("Hatalı kod! Lütfen 'atesEt(X, Y)' formatında yaz. Örneğin: atesEt(4, 7)")
      return
    }

    const x = parseInt(match[1])
    const y = parseInt(match[2])

    if (x < 1 || x > 10 || y < 1 || y > 10) {
      setErrorMsg("Radar menzili dışında! X ve Y değerleri 1 ile 10 arasında olmalı.")
      return
    }

    // Check if already shot
    if (shots.find(s => s.x === x && s.y === y)) {
      setErrorMsg("Burayı zaten vurdun Komutanım! Başka koordinat dene.")
      return
    }

    // Check hit or miss
    let isHit = false
    const updatedShips = ships.map(ship => {
      if (ship.x === x && ship.y === y) {
        isHit = true
        return { ...ship, hit: true }
      }
      return ship
    })

    setShips(updatedShips)
    setShots([...shots, { x, y, result: isHit ? 'hit' : 'miss' }])
    setInputCode('')

    if (isHit) {
      setMessage("💥 TAM İSABET! Bir düşman gemisi battı!")
      // Check win
      if (updatedShips.every(s => s.hit)) {
        setGameWon(true)
        setMessage("🏆 GÖREV TAMAMLANDI! OHEP Karargahı seninle gurur duyuyor!")
      }
    } else {
      setMessage("💦 ISKA! Füze denize düştü. Pes etme, tekrar dene!")
    }
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-slate-900 text-slate-100 overflow-hidden font-mono">
      
      {/* Sol Panel: Açıklama ve Kod Yazma */}
      <div className="w-full md:w-1/3 bg-slate-800 p-6 flex flex-col border-r border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">🚢</span>
          <h2 className="text-2xl font-black text-emerald-400">OHEP Amiral Battı</h2>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-700 shadow-inner text-sm leading-relaxed text-slate-300">
          <p className="mb-2"><strong className="text-white">Görev:</strong> Düşman filosu radarımıza girdi. 10x10'luk alanda 5 adet gizli düşman gemisi var.</p>
          <p className="mb-2"><strong className="text-white">Nasıl Oynanır?</strong> Füzeleri ateşlemek için fareyle tıklayamazsın. Sisteme komut göndermek zorundasın.</p>
          <p className="mb-2"><strong className="text-white">Kod Sözdizimi:</strong></p>
          <code className="block bg-slate-950 text-emerald-400 p-2 rounded-lg font-bold border border-slate-800 mb-2">atesEt(X, Y)</code>
          <p>Örneğin; yatayda (X) 3, dikeyde (Y) 5 numaralı kareyi vurmak için <span className="text-emerald-400">atesEt(3, 5)</span> yaz ve gönder!</p>
        </div>

        <div className="flex-1">
          <form onSubmit={handleFire} className="flex flex-col gap-3">
            <label className="text-emerald-500 font-bold text-sm uppercase tracking-wider">Komut Satırı</label>
            <input 
              type="text" 
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full bg-black text-emerald-400 font-mono text-xl p-4 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="atesEt(X, Y)"
              disabled={gameWon}
            />
            {errorMsg && <p className="text-red-400 text-xs font-bold">{errorMsg}</p>}
            <button 
              type="submit"
              disabled={gameWon}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg py-4 rounded-xl transition-colors disabled:opacity-50 uppercase tracking-widest mt-2"
            >
              Füzeyi Ateşle 🚀
            </button>
          </form>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-xl border font-bold text-center animate-fade-in-up ${gameWon ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
            {message}
          </div>
        )}

        {gameWon && (
          <button onClick={initGame} className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold transition-colors">
            🔄 Yeniden Oyna
          </button>
        )}
      </div>

      {/* Sağ Panel: Radar (Grid) */}
      <div className="w-full md:w-2/3 p-4 md:p-10 flex flex-col items-center justify-center relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        
        {gameWon && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
            <div className="text-center animate-bounce-in">
              <span className="text-8xl block mb-4">🏆</span>
              <h1 className="text-5xl font-black text-emerald-400 drop-shadow-lg">GÖREV BAŞARILI!</h1>
            </div>
          </div>
        )}

        <div className="bg-slate-800/80 p-6 rounded-3xl border-4 border-slate-700 shadow-2xl backdrop-blur-md">
          {/* X Eksen Etiketleri */}
          <div className="flex ml-8 mb-2">
            {[1,2,3,4,5,6,7,8,9,10].map(x => (
              <div key={x} className="w-10 h-10 flex items-center justify-center font-black text-emerald-500/50">{x}</div>
            ))}
          </div>

          <div className="flex relative">
            {/* Y Eksen Etiketleri */}
            <div className="flex flex-col mr-2">
              {[1,2,3,4,5,6,7,8,9,10].map(y => (
                <div key={y} className="w-8 h-10 flex items-center justify-center font-black text-emerald-500/50">{y}</div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-10 grid-rows-10 gap-1 bg-cyan-950 p-1 border-2 border-cyan-800 rounded-lg">
              {Array.from({ length: 100 }).map((_, i) => {
                const x = (i % 10) + 1
                const y = Math.floor(i / 10) + 1
                
                const shot = shots.find(s => s.x === x && s.y === y)
                const isHit = shot?.result === 'hit'
                const isMiss = shot?.result === 'miss'

                // Uncomment below to cheat and see ships
                // const isShip = ships.find(s => s.x === x && s.y === y)

                return (
                  <div key={i} className={`w-10 h-10 rounded-sm flex items-center justify-center transition-all duration-300 ${isHit ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : isMiss ? 'bg-slate-300/20' : 'bg-cyan-800/40 hover:bg-cyan-700/60'}`}>
                    {isHit && <span className="text-xl animate-bounce-in">💥</span>}
                    {isMiss && <span className="text-lg opacity-50">💦</span>}
                  </div>
                )
              })}
            </div>

            {/* Eksen İsimleri */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 font-black text-emerald-500 tracking-widest uppercase">X Ekseni</div>
            <div className="absolute top-1/2 -left-12 -translate-y-1/2 -rotate-90 font-black text-emerald-500 tracking-widest uppercase">Y Ekseni</div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
      `}} />
    </div>
  )
}
