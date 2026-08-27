import { useState } from 'react'
import { ROBOTIC_PROJECTS } from '../../data/roboticProjects'

export default function RoboticProjects() {
  const [activeProject, setActiveProject] = useState(null)

  if (activeProject) {
    return (
      <div className="max-w-4xl animate-in fade-in duration-300">
        <button 
          onClick={() => setActiveProject(null)}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <span>←</span> Projeler Listesine Dön
        </button>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-3">{activeProject.title}</h1>
          <p className="text-indigo-400 text-lg mb-8">{activeProject.summary}</p>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span> Proje Özeti
            </h2>
            <p className="text-slate-300 leading-relaxed bg-slate-950/50 p-5 rounded-xl border border-slate-800/50">
              {activeProject.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Malzemeler */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🔧</span> Malzeme Listesi
              </h2>
              <ul className="space-y-3">
                {activeProject.materials.map((mat, i) => (
                  <li key={i} className="flex items-start gap-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                    <span className="text-indigo-500 mt-1">✓</span>
                    <span className="text-slate-300">{mat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Geliştirme Adımları */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🛠️</span> Geliştirme Adımları
              </h2>
              <div className="space-y-4">
                {activeProject.steps.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 font-bold">
                      {i + 1}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed mt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h2 className="text-white text-2xl font-bold mb-2">Robotik Projeler Havuzu</h2>
        <p className="text-slate-400">
          Laboratuvarınızda öğrencilere uygulayabileceğiniz, baştan sona tasarlanmış 10 farklı uygulamalı robotik ve AI projesi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ROBOTIC_PROJECTS.map(proj => (
          <div 
            key={proj.id} 
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all cursor-pointer flex flex-col group"
            onClick={() => setActiveProject(proj)}
          >
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                {proj.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {proj.summary}
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 
                {proj.materials.length} Malzeme
              </span>
              <span className="text-indigo-500 font-medium group-hover:underline">
                Detayları Gör →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
