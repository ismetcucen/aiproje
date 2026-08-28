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
    let hitShipId = null

    const updatedShips = ships.map(ship => {
      if (ship.x === x && ship.y === y) {
        isHit = true
        hitShipId = ship.id
        return { ...ship, hit: true }
      }
      return ship
    })

    setShips(updatedShips)
    setShots([...shots, { x, y, result: isHit ? 'hit' : 'miss' }])
    setInputCode('')

    if (isHit) {
      const hitShip = updatedShips.find(s => s.x === x && s.y === y)
      const isSunk = updatedShips.filter(s => s.id === hitShip.id).every(s => s.hit)
      
      if (isSunk) {
        setMessage(`💥 HARİKA! ${hitShip.size} birimlik gemiyi tamamen BATIRDIN!`)
      } else {
        setMessage(`💥 İSABET! ${hitShip.size} birimlik bir gemiyi vurdun. (Devamını bulmalısın!)`)
      }

      if (updatedShips.every(s => s.hit)) {
        setGameWon(true)
        setMessage("🏆 GÖREV TAMAMLANDI! Tüm düşman filosu yok edildi!")
      }
    } else {
      setMessage("💦 ISKA! Füze denize düştü. Pes etme!")
    }
  }

  // Filo durumu hesaplama
  const uniqueShips = []
  ships.forEach(s => {
    if (!uniqueShips.find(us => us.id === s.id)) {
      uniqueShips.push({
        id: s.id,
        size: s.size,
        isSunk: ships.filter(part => part.id === s.id).every(part => part.hit),
        hits: ships.filter(part => part.id === s.id && part.hit).length
      })
    }
  })
  uniqueShips.sort((a, b) => b.size - a.size) // Büyük gemiler üstte

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-slate-900 text-slate-100 overflow-hidden font-mono">
      
      {/* Sol Panel */}
      <div className="w-full md:w-1/3 bg-slate-800 p-4 md:p-6 flex flex-col border-r border-slate-700 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">🚢</span>
          <h2 className="text-2xl font-black text-emerald-400">OHEP Amiral Battı</h2>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 mb-4 border border-slate-700 shadow-inner text-xs md:text-sm leading-relaxed text-slate-300">
          <p className="mb-2"><strong className="text-white">Görev:</strong> Radarımıza giren 5 farklı boyutta gizli düşman gemisi var. Onları kod yazarak avlamalısın!</p>
          <code className="block bg-slate-950 text-emerald-400 p-2 rounded-lg font-bold border border-slate-800 mb-2">atesEt(X, Y)</code>
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

          {/* Filo Durumu Tablosu */}
          {ships.length > 0 && (
            <div className="mt-6 bg-slate-900 rounded-xl p-4 border border-slate-700">
              <h3 className="text-emerald-500 font-bold text-xs uppercase mb-3 tracking-widest">Radar Filo Durumu</h3>
              <div className="flex flex-col gap-2">
                {uniqueShips.map(ship => (
                  <div key={ship.id} className={`flex items-center justify-between p-2 rounded-lg transition-colors ${ship.isSunk ? 'bg-red-950/40 border border-red-900/50' : 'bg-slate-800 border border-slate-700'}`}>
                    <div className="flex gap-1">
                      {Array.from({length: ship.size}).map((_, i) => (
                        <div key={i} className={`w-4 h-4 rounded-sm border ${i < ship.hits ? 'bg-red-500 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-slate-600 border-slate-500'}`}></div>
                      ))}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${ship.isSunk ? 'text-red-400' : 'text-slate-400'}`}>
                      {ship.isSunk ? 'BATTI 💥' : 'BİLİNMİYOR'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
