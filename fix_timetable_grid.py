import re

with open('src/pages/DigitalBoardViewer.jsx', 'r') as f:
    content = f.read()

# Replace the scrolling container with a simple grid
old_container_regex = r'<div className="flex-1 overflow-hidden relative">.*?<div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-900/40 to-transparent z-10 pointer-events-none"></div>\s*<div className="flex flex-col gap-3 animate-scroll-vertical hover:pause">\s*\{\[\.\.\.\(settings\.timetable \|\| \[\]\), \.\.\.\(settings\.timetable \|\| \[\]\)\]\.map\(\(t, idx\) => \{'

new_container = """<div className="flex-1 flex flex-col justify-center">
                <div className="w-full grid grid-cols-2 gap-3 pb-2">
                  {(settings.timetable || []).map((t, idx) => {"""

content = re.sub(old_container_regex, new_container, content, flags=re.DOTALL)

# Let's replace the whole `return ( ... )` inside the map!
# Find the start of the return statement
start_return = content.find('return (', content.find('// Basic time parsing logic for active row highlight'))
end_return = content.find(')', start_return) + 1 # wait, the return block might have nested parenthesis
# A safer way: we can just find `<div key={idx}` and replace until `</div>`
# since we know the exact structure.

old_div_start = '<div key={idx} className={`flex justify-between items-center p-3 rounded-2xl transition-all duration-500 ${'
new_div_start = '<div key={idx} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-500 ${'
content = content.replace(old_div_start, new_div_start)

# Now replace the inner spans
old_spans = """<span className={`font-bold text-lg ${isCurrent ? 'text-white' : 'text-slate-300'}`}>{t.label}</span>
                      <span className={`font-black tracking-widest ${isCurrent ? 'text-white' : 'text-indigo-400'}`}>{t.time}</span>"""

new_spans = """<span className={`font-bold text-sm md:text-base ${isCurrent ? 'text-white' : 'text-slate-300'}`}>{t.label}</span>
                      <span className={`font-black text-sm tracking-wide ${isCurrent ? 'text-fuchsia-300' : 'text-indigo-400'}`}>{t.time}</span>"""

content = content.replace(old_spans, new_spans)

with open('src/pages/DigitalBoardViewer.jsx', 'w') as f:
    f.write(content)

print("Done")
