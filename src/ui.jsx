const P={
 search:<><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
 sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
 moon:<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>,
 grid:<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
 list:<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>,
 copy:<><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
 plus:<path d="M12 5v14M5 12h14"/>, minus:<path d="M5 12h14"/>,
 edit:<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>,
 trash:<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>,
 x:<path d="M18 6 6 18M6 6l12 12"/>, check:<path d="M20 6 9 17l-5-5"/>,
 alert:<><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></>,
 chip:<><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/></>,
 bolt:<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>,
 phone:<><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/></>,
 box:<path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/>,
 sliders:<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>,
 upload:<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>,
 clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>}
export const Icon=({n,s=18,className=''})=><svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`} aria-hidden>{P[n]}</svg>

const C='linear-gradient(90deg,#22d3ee,#3b82f6,#8b5cf6,#ec4899,#f5c04a,#22d3ee)'
export const BrandText=()=>{let i=0
  return <div className="font-black italic leading-none tracking-tight" aria-label="SKY PHONE SHOP">
    {['SKY','PHONE SHOP'].map((w,wi)=><div key={w} className={wi?'mt-1 text-2xl sm:text-4xl':'text-6xl sm:text-8xl'}>
      {[...w].map(ch=>{const k=i++;return <span key={k} aria-hidden style={{backgroundImage:C,animationDelay:`${-k*.2}s`}} className="chase inline-block whitespace-pre">{ch}</span>})}</div>)}</div>}
