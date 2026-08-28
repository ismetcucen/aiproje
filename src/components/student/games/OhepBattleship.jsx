import { useState, useEffect } from 'react'

export default function OhepBattleship() {
  const [ships, setShips] = useState([])
  const [shots, setShots] = useState([])
  const [inputCode, setInputCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [gameWon, setGameWon] = useState(false)
  const [message, setMessage] = useState('')

  const GRID_SIZE = 10
  const SHIP_SIZES = [3, 2, 2, 1, 1] // 1 tane 3'lük, 2 tane 2'lik, 2 tane 1'lik

  useEffect(() => {
    initGame()
  }, [])

  function initGame() {
    setShots([])
    setGameWon(false)
    setMessage('Savaşa Hazırsın! Kodlarını yazmaya başla.')
    setInputCode('')
    setErrorMsg('')
    
    const newShips = []
    let shipId = 1
    for (let size of SHIP_SIZES) {
      let placed = false
      let attempts = 0
      while (!placed && attempts < 100) {
        attempts++
        const isVertical = Math.random() < 0.5
        const startX = Math.floor(Math.random() * GRID_SIZE) + 1
        const startY = Math.floor(Math.random() * GRID_SIZE) + 1

        let canPlace = true
        const currentShipCoords = []
        for (let i = 0; i < size; i++) {
          const cx = isVertical ? startX : startX + i
          const cy = isVertical ? startY + i : startY
          
          if (cx > 10 || cy > 10) { canPlace = false; break }
          if (newShips.find(s => s.x === cx && s.y === cy)) { canPlace = false; break }
          currentShipCoords.push({ x: cx, y: cy, hit: false, id: shipId, size })
        }

        if (canPlace) {
          newShips.push(...currentShipCoords)
          placed = true
          shipId++
        }
      }
    }
    setShips(newShips)
  }

  function handleFire(e) {
    e.preventDefault()
    setErrorMsg('')
    
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

    if (shots.find(s => s.x === x && s.y === y)) {
      setErrorMsg("Burayı zaten vurdun Komutanım! Başka koordinat dene.")
      return
    }

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
      setMessage("💥 TAM İSABET! Hedefi vurdun!")
      if (updatedShips.every(s => s.hit)) {
        setGameWon(true)
        setMessage("🏆 GÖREV TAMAMLANDI! Tüm düşman filosu yok edildi!")
      }
    } else {
      setMessage("💦 ISKA! Füze denize düştü. Pes etme!")
    }
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-slate-900 text-slate-100 overflow-hidden font-mono">
      
      {/* Sol Panel */}
      <div className="w-full md:w-1/3 bg-slate-800 p-6 flex flex-col border-r border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">🚢</span>
          <h2 className="text-2xl font-black text-emerald-400">OHEP Amiral Battı</h2>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-700 shadow-inner text-sm leading-relaxed text-slate-300">
          <p className="mb-2"><strong className="text-white">Görev:</strong> Radarımıza giren 5 farklı boyutta düşman gemisi var (1, 2 ve 3 karelik). Görünmezler, onları kod yazarak avlamalısın!</p>
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

      {/* Sağ Panel */}
      <div className="w-full md:w-2/3 p-4 md:p-10 flex flex-col items-center justify-center relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        
        {gameWon && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
            <div className="text-center animate-bounce-in">
              <span className="text-8xl block mb-4">🏆</span>
              <h1 className="text-5xl font-black text-emerald-400 drop-shadow-lg">GÖREV BAŞARILI!</h1>
            </div>
          </div>
        )}

        <div className="bg-slate-800/80 p-6 rounded-3xl border-4 border-slate-700 shadow-2xl backdrop-blur-md relative">
          {/* Eksen İsimleri */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-black text-emerald-500 tracking-widest uppercase text-xs">X Ekseni</div>
          <div className="absolute top-1/2 -left-8 -translate-y-1/2 -rotate-90 font-black text-emerald-500 tracking-widest uppercase text-xs">Y Ekseni</div>
          
          <div className="grid grid-cols-[auto_repeat(10,minmax(0,1fr))] grid-rows-[auto_repeat(10,minmax(0,1fr))] gap-1 bg-cyan-950 p-2 border-2 border-cyan-800 rounded-lg">
              {Array.from({ length: 121 }).map((_, i) => {
                const col = i % 11
                const row = Math.floor(i / 11)

                // Sol üst boşluk
                if (row === 0 && col === 0) return <div key={i} />
                
                // X Eksen Etiketleri (Üst satır)
                if (row === 0) return <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-black text-emerald-500">{col}</div>
                
                // Y Eksen Etiketleri (Sol sütun)
                if (col === 0) return <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-black text-emerald-500">{row}</div>

                // Oyun Alanı (Hücreler)
                const x = col
                const y = row
                
                const shot = shots.find(s => s.x === x && s.y === y)
                const isHit = shot?.result === 'hit'
                const isMiss = shot?.result === 'miss'
                // isShip gizlendi, sadece hile için açık bırakılabilir: const isShip = ships.find(s => s.x === x && s.y === y)

                return (
                  <div key={i} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-sm flex items-center justify-center transition-all duration-300 ${isHit ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : isMiss ? 'bg-slate-300/20' : 'bg-cyan-800/40'}`}>
                    {isHit && <span className="text-sm sm:text-xl animate-bounce-in">💥</span>}
                    {isMiss && <span className="text-xs sm:text-lg opacity-50">💦</span>}
                  </div>
                )
              })}
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
