import re

with open('src/pages/DigitalBoardViewer.jsx', 'r') as f:
    content = f.read()

# 1. Extract Günün Menüsü
menu_match = re.search(r'(?s)({\/\* Günün Menüsü \*\/}.*?)(?={\/\* MIDDLE:)', content)
menu_html = menu_match.group(1).strip()

# 2. Extract Hava Durumu
weather_match = re.search(r'(?s)({\/\* Hava Durumu \*\/}.*?)(?={\/\* Sınavlara Kalan Zaman)', content)
weather_html = weather_match.group(1).strip()

# 3. Extract Sınavlara Kalan Zaman (Küçültüldü)
exams_match = re.search(r'(?s)({\/\* Sınavlara Kalan Zaman \(Küçültüldü\) \*\/}.*?)(?=</div>\s*</div>\s*{\/\* RIGHT:)', content)
exams_html = exams_match.group(1).strip()
exams_html = re.sub(r'</div>$', '', exams_html).strip()

# 4. Extract Günün Sözü
quote_match = re.search(r'(?s)({\/\* Günün Sözü \*\/}.*?)(?=</div>\s*</div>\s*<\!-- Marquee Banner|</div>\s*</div>\s*{\/\* Marquee Banner|</div>\s*<div className=\{`absolute bottom-24)', content)
quote_html = quote_match.group(1).strip()

new_timetable_html = """{/* Zaman Çizelgesi (Full Width Horizontal) */}
        <div className="w-full bg-slate-900/40 backdrop-blur-md rounded-3xl p-4 md:p-5 border border-white/10 shadow-2xl flex-shrink-0 mt-4 mb-20">
          <h2 className="text-xl font-bold tracking-widest text-indigo-300 mb-4 flex items-center gap-3">
            <span>⏱️</span> Zaman Çizelgesi
          </h2>
          <div className="flex flex-row flex-nowrap gap-2 overflow-x-auto custom-scrollbar pb-2">
            {(settings.timetable || []).map((t, idx) => {
              let isCurrent = false;
              if (t.time && t.time.includes('-')) {
                const [startStr, endStr] = t.time.split('-').map(s => s.trim())
                const [sh, sm] = startStr.split(':').map(Number)
                const [eh, em] = endStr.split(':').map(Number)
                if (!isNaN(sh) && !isNaN(eh)) {
                  const startMin = sh * 60 + sm
                  const endMin = eh * 60 + em
                  if (currentMinutes >= startMin && currentMinutes <= endMin) {
                    isCurrent = true;
                  }
                }
              }
              
              return (
                <div key={idx} className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-500 min-w-[120px] flex-1 ${
                  isCurrent 
                    ? 'bg-slate-900/80 border-2 border-fuchsia-400 shadow-[0_0_15px_#e879f9,inset_0_0_15px_#e879f9] scale-105 transform z-20 relative animate-pulse' 
                    : 'bg-white/5 border border-white/5 hover:bg-white/10'
                }`}>
                  <span className={`font-bold text-sm whitespace-nowrap ${isCurrent ? 'text-white' : 'text-slate-300'}`}>{t.label}</span>
                  <span className={`font-black text-sm tracking-wide whitespace-nowrap ${isCurrent ? 'text-fuchsia-300' : 'text-indigo-400'}`}>{t.time}</span>
                </div>
              )
            })}
          </div>
        </div>"""

new_layout = f"""{{/* 3-Column Layout (Top) */}}
        <div className="flex-1 grid grid-cols-12 gap-4 md:gap-6 min-h-0">
          {{/* LEFT: Menü */}}
          <div className="col-span-4 flex flex-col gap-4 md:gap-6 min-h-0">
            {menu_html}
          </div>
          {{/* MIDDLE: Hava Durumu & Günün Sözü */}}
          <div className="col-span-4 flex flex-col gap-4 md:gap-6 min-h-0">
            {weather_html}
            {quote_html}
          </div>
          {{/* RIGHT: Sınavlar */}}
          <div className="col-span-4 flex flex-col gap-4 md:gap-6 min-h-0">
            {exams_html}
          </div>
        </div>

        {new_timetable_html}
"""

start_idx = content.find('{/* 3-Column Layout */}')
end_idx = content.find('<div className={`absolute bottom-24')

if start_idx != -1 and end_idx != -1:
    # We need to find the correct `</div>` just before end_idx
    # Let's just strip backwards to find it.
    actual_end_idx = content.rfind('</div>', start_idx, end_idx) 
    actual_end_idx = content.rfind('</div>', start_idx, actual_end_idx) # go one level up for the container
    content = content[:start_idx] + new_layout + '\n      ' + content[end_idx:]
    with open('src/pages/DigitalBoardViewer.jsx', 'w') as f:
        f.write(content)
    print("Replaced successfully")
else:
    print("Could not find boundaries")
