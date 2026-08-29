import React from 'react'

export default function InstagramWidget({ className = '' }) {
  return (
    <a 
      href="https://www.instagram.com/ohepbilisim" 
      target="_blank" 
      rel="noopener noreferrer"
      className={`group block relative overflow-hidden rounded-2xl p-[2px] transition-transform duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 shadow-xl hover:shadow-2xl hover:shadow-pink-500/20 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] animate-pulse opacity-80 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative flex items-center justify-between gap-3 bg-white/95 backdrop-blur-md px-4 py-3 rounded-[14px] h-full border border-white/50">
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white rounded-[10px] shadow-md group-hover:rotate-12 transition-transform duration-300">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
             </svg>
           </div>
           <div>
             <p className="text-[10px] font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] uppercase tracking-[0.2em] mb-0.5">
               Bizi Takip Et!
             </p>
             <p className="text-slate-800 font-black text-sm tracking-wide">@ohepbilisim</p>
           </div>
         </div>
         <div className="text-pink-500 group-hover:translate-x-1 transition-transform">
           <span className="text-xl">✨</span>
         </div>
      </div>
    </a>
  )
}
