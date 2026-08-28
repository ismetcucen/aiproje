const jsx = `
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
                const isShip = ships.find(s => s.x === x && s.y === y)

                return (
                  <div key={i} className={\`w-8 h-8 sm:w-10 sm:h-10 rounded-sm flex items-center justify-center transition-all duration-300 \${isHit ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : isMiss ? 'bg-slate-300/20' : 'bg-cyan-800/40'}\`}>
                    {isHit && <span className="text-sm sm:text-xl animate-bounce-in">💥</span>}
                    {isMiss && <span className="text-xs sm:text-lg opacity-50">💦</span>}
                    {(!shot && isShip) && <span className="text-sm sm:text-xl opacity-80 animate-pulse">👾</span>}
                  </div>
                )
              })}
          </div>
        </div>

      </div>
`;
