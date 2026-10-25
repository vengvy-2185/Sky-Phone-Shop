import {useCallback,useEffect,useMemo,useState} from 'react'
import {supabase,configured} from './supabase'
import {status,ST,T,fmt,priceText,copyText,matches} from './lib'
import {Icon,BrandText} from './ui'
import Admin from './Admin'

function Img({src,alt}){
  const [bad,setBad]=useState(!src)
  return bad
    ? <div className="grid h-28 place-items-center sm:h-40"><img src="/logo.png" alt="" className="h-14 animate-float opacity-70 sm:h-20"/></div>
    : <img src={src} alt={alt} onError={()=>setBad(true)} className="mx-auto h-28 animate-float object-contain drop-shadow-2xl sm:h-40"/>
}
export const Badge=({v,lang})=>{const s=status(v.stock_qty),t=ST[s]
  return <span className={`badge ${t.c}`}><Icon n={s==='out'?'x':s==='low'?'alert':'check'} s={12}/>{t[lang]}{s!=='out'&&` (${v.stock_qty})`}</span>}

function Card({v,i,onCopy,t,lang}){
  return <div style={{animationDelay:`${Math.min(i,14)*60}ms`}}
    className="card group flex animate-fadeUp flex-col p-3 transition duration-300 hover:-translate-y-2 hover:border-indigo-400 hover:shadow-[0_25px_60px_-20px_rgba(99,102,241,.6)] sm:p-4">
    <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-fuchsia-500/10 p-2"><Img src={v.image_url} alt={v.products.name}/></div>
    <h3 className="mt-3 font-bold leading-snug">{v.products.name}</h3>
    <p className="mut flex flex-wrap items-center gap-x-2 text-sm"><span className="inline-flex items-center gap-1"><Icon n="chip" s={14}/>{v.storage}</span>{v.condition&&<span>{v.condition}</span>}</p>
    <p className="grad mt-1 text-xl font-extrabold sm:text-2xl">{priceText(v)}</p>
    {v.preorder_price!=null&&<p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-amber-500"><Icon n="bolt" s={13}/>{t.early}: {fmt(v.preorder_price)}</p>}
    <div className="mt-2"><Badge v={v} lang={lang}/></div>
    {v.notes&&<p className="mut mt-2 text-xs">{v.notes}</p>}
    <button className="btn mt-auto w-full !mt-3" onClick={()=>onCopy(v)}><Icon n="copy" s={16}/>{t.copy}</button>
  </div>
}

export default function App(){
  const [dark,setDark]=useState(()=>localStorage.getItem('theme')!=='light')
  const [lang,setLang]=useState(()=>localStorage.getItem('lang')||'kh')
  useEffect(()=>{document.documentElement.classList.toggle('dark',dark);localStorage.setItem('theme',dark?'dark':'light')},[dark])
  useEffect(()=>{document.documentElement.lang=lang==='kh'?'km':'en';localStorage.setItem('lang',lang)},[lang])
  const t=T[lang], H=lang==='kh'?'moul':'font-extrabold'
  const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[err,setErr]=useState('')
  const [q,setQ]=useState(''),[model,setModel]=useState(''),[storage,setStorage]=useState(''),[stock,setStock]=useState('')
  const [sort,setSort]=useState('default'),[view,setView]=useState('grid'),[page,setPage]=useState('home'),[msg,setMsg]=useState('')
  const toast=m=>{setMsg(m);setTimeout(()=>setMsg(''),1800)}
  const copy=v=>navigator.clipboard.writeText(copyText(v,lang)).then(()=>toast(t.copied),()=>toast('✕'))

  const load=useCallback(async()=>{
    if(!configured){setErr('noconf');setLoading(false);return}
    const {data,error}=await supabase.from('product_variants').select('*,products(name,sort_order)')
    if(error)setErr(error.message);else{setErr('');setRows(data.filter(r=>r.products))}
    setLoading(false)},[])
  useEffect(()=>{load();if(!configured)return
    const ch=supabase.channel('sky-live').on('postgres_changes',{event:'*',schema:'public',table:'product_variants'},load).subscribe()
    return()=>{supabase.removeChannel(ch)}},[load])

  const models=useMemo(()=>[...new Map(rows.map(r=>[r.products.name,r.products.sort_order])).entries()].sort((a,b)=>a[1]-b[1]).map(x=>x[0]),[rows])
  const storages=useMemo(()=>[...new Set(rows.map(r=>r.storage))],[rows])
  const list=useMemo(()=>{
    const by={default:(a,b)=>a.products.sort_order-b.products.sort_order||a.price-b.price,asc:(a,b)=>a.price-b.price,desc:(a,b)=>b.price-a.price,
      stock:(a,b)=>b.stock_qty-a.stock_qty,new:(a,b)=>new Date(b.updated_at)-new Date(a.updated_at)}
    return rows.filter(v=>(!q||matches(v,q))&&(!model||v.products.name===model)&&(!storage||v.storage===storage)&&(!stock||status(v.stock_qty)===stock)).sort(by[sort])},[rows,q,model,storage,stock,sort])
  const inS=rows.filter(r=>r.stock_qty>0).length
  const go=(p,v)=>{setPage(p);if(v)setView(v);window.scrollTo({top:0,behavior:'smooth'})}
  const nav=[['home','grid',t.home,()=>go('home','grid')],['list','list',t.list,()=>go('home','list')],['admin','sliders',t.admin,()=>go('admin')]]
  const active=k=>page==='admin'?k==='admin':k==='home'?view==='grid':k==='list'&&view==='list'

  return <div className="relative flex h-[100dvh] flex-col overflow-hidden">
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute -left-24 -top-24 h-96 w-96 animate-blob rounded-full bg-blue-600/30 blur-3xl"/>
      <div className="absolute right-0 top-1/3 h-96 w-96 animate-blob rounded-full bg-fuchsia-600/25 blur-3xl [animation-delay:-5s]"/>
    </div>
    <header className="relative z-30 shrink-0 bg-[var(--bg)]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:px-4">
        <button onClick={()=>go('home','grid')} className="rounded-xl bg-gradient-to-br from-indigo-950 to-blue-900 px-2 py-1"><img src="/logo.png" alt="SKY PHONE SHOP" className="h-8 sm:h-9"/></button>
        <nav className="ml-auto hidden items-center gap-1 text-sm font-semibold md:flex">
          {nav.map(([k,ic,l,fn])=><button key={k} onClick={fn} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 transition ${active(k)?'bg-indigo-500/15 text-indigo-500':'mut hover:text-indigo-500'}`}><Icon n={ic}/>{l}</button>)}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <div className="card flex overflow-hidden text-xs font-bold">{[['kh','KH'],['en','EN']].map(([k,l])=>
            <button key={k} onClick={()=>setLang(k)} className={`px-3 py-2 transition ${lang===k?'bg-gradient-to-r from-blue-600 to-violet-600 text-white':'mut'}`}>{l}</button>)}</div>
          <button onClick={()=>setDark(!dark)} aria-label="Day / Night" className="card grid h-9 w-9 place-items-center text-amber-500 transition hover:rotate-12"><Icon n={dark?'sun':'moon'}/></button>
        </div>
      </div>
      <div className="kbach"/>
      <div className="card mx-3 my-2 sm:mx-auto flex max-w-3xl items-center gap-3 px-4 py-2 shadow-lg shadow-indigo-500/10 focus-within:ring-4 focus-within:ring-indigo-500/30">
        <Icon n="search" s={22} className="text-indigo-500"/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.search} className="w-full min-w-0 bg-transparent py-1 text-base outline-none sm:text-lg"/>
        {q&&<button onClick={()=>setQ('')} aria-label="clear" className="mut"><Icon n="x"/></button>}
      </div>
    </header>

    <main className="min-h-0 flex-1 overflow-y-auto"><div className="mx-auto max-w-7xl px-3 pb-6 sm:px-4">
      {page==='home'&&<section className="relative mt-4 grid animate-fadeUp overflow-hidden rounded-3xl bg-gradient-to-br from-[#050b2e] via-[#0b1b6b] to-[#4c1d95] shadow-2xl md:grid-cols-[1.1fr_1fr]">
        <div className="z-10 p-5 sm:p-8">
          <BrandText/><h1 className={`${H} mt-4 text-lg text-white sm:text-2xl`}><span className="grad">{t.tag1}</span><br/>{t.tag2}</h1>
          <p className="mt-2 text-white/75">{t.sub}</p>
                  </div>
        <div className="relative h-44 md:h-auto"><img src="/banner.png" alt="" className="absolute inset-0 h-full w-full origin-right scale-[1.4] object-cover object-right md:scale-100 [mask-image:linear-gradient(to_right,transparent,#000_30%)]"/></div>
      </section>}

      {page==='admin'?<Admin models={models} rows={list} reload={load} toast={toast} t={t} lang={lang} H={H}/>:<>
        <div className="hide-sb mt-4 flex items-center gap-2 overflow-x-auto pb-1 text-sm">
          <select className="sel" value={model} onChange={e=>setModel(e.target.value)}><option value="">{t.models}</option>{models.map(m=><option key={m}>{m}</option>)}</select>
          <select className="sel" value={storage} onChange={e=>setStorage(e.target.value)}><option value="">{t.storage}</option>{storages.map(m=><option key={m}>{m}</option>)}</select>
          <select className="sel" value={stock} onChange={e=>setStock(e.target.value)}><option value="">{t.stock}</option>{Object.keys(ST).map(k=><option key={k} value={k}>{ST[k][lang]}</option>)}</select>
          <select className="sel" value={sort} onChange={e=>setSort(e.target.value)}>{[['default','s_def'],['asc','s_asc'],['desc','s_desc'],['stock','s_stock'],['new','s_new']].map(([k,l])=><option key={k} value={k}>{t[l]}</option>)}</select>
          <div className="ml-auto hidden gap-1 sm:flex">{[['grid','grid',t.grid],['list','list',t.table]].map(([k,ic,l])=>
            <button key={k} onClick={()=>setView(k)} className={view===k?'btn !py-2':'ghost mut'}><Icon n={ic} s={16}/>{l}</button>)}</div>
        </div>
        <p className="mut mt-3 text-sm font-semibold">{t.results} ({list.length})</p>

        {err&&<div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-500"><Icon n="alert"/>{err==='noconf'?t.noconf:err}<button className="ml-auto underline" onClick={load}>{t.retry}</button></div>}
        {loading&&<div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({length:8}).map((_,i)=><div key={i} className="card h-64 animate-pulse"/>)}</div>}
        {!loading&&!err&&list.length===0&&<div className="card mt-6 animate-pop p-10 text-center"><Icon n="search" s={40} className="mx-auto text-indigo-500"/><p className="mt-2 font-bold">{t.empty} “{q}”</p><p className="mut text-sm">{t.hint}</p></div>}

        {view==='grid'&&<div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{list.map((v,i)=><Card key={v.id} v={v} i={i} onCopy={copy} t={t} lang={lang}/>)}</div>}
        {view==='list'&&list.length>0&&<div className="mt-3 space-y-2">{list.map((v,i)=>
          <div key={v.id} style={{animationDelay:`${Math.min(i,14)*40}ms`}} className="card flex animate-fadeUp flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 transition hover:border-indigo-400">
            <div className="min-w-[8rem] flex-1"><b>{v.products.name}</b> <span className="mut text-sm">{v.storage}</span></div>
            <b className="grad text-lg">{priceText(v)}</b>
            {v.preorder_price!=null&&<span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500"><Icon n="bolt" s={13}/>{t.early}: {fmt(v.preorder_price)}</span>}
            <Badge v={v} lang={lang}/><button className="ghost !py-1.5 text-indigo-500" onClick={()=>copy(v)} aria-label={t.copy}><Icon n="copy" s={16}/></button></div>)}</div>}
      </>}
    </div></main>

    <footer className="relative z-30 shrink-0 border-t border-[var(--line)] bg-[var(--card)]/95 backdrop-blur-xl">
      <div className="kbach !h-2 opacity-60"/>
      <div className="grid grid-cols-3 pb-[env(safe-area-inset-bottom)] md:hidden">{nav.map(([k,ic,l,fn])=>
        <button key={k} onClick={fn} className={`flex flex-col items-center gap-0.5 py-2 text-xs font-semibold transition ${active(k)?'text-indigo-500':'mut'}`}><Icon n={ic} s={22} className={active(k)?'-translate-y-0.5 transition':''}/>{l}</button>)}</div>
      <div className="mut hidden items-center justify-center gap-3 py-2 text-sm md:flex"><img src="/logo.png" alt="" className="h-6"/><b className="grad">SKY PHONE SHOP</b><span>· {t.foot}</span></div>
    </footer>
    {msg&&<div className="fixed bottom-24 left-1/2 z-50 inline-flex -translate-x-1/2 animate-pop items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2 font-bold text-white shadow-xl md:bottom-14"><Icon n="check" s={16}/>{msg}</div>}
  </div>
}
