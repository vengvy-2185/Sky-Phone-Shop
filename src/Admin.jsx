import {useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import {supabase,configured} from './supabase'
import {priceText,fmt} from './lib'
import {Icon} from './ui'
import {Badge} from './App'

const empty={name:'',storage:'',price:'',price_min:'',price_max:'',preorder_price:'',stock_qty:0,image_url:'',condition:'',notes:''}
const SZ=['64GB','128GB','256GB','512GB','1TB']
const num=x=>x===''||x==null?null:Number(x)
const L='mut mb-1 block text-xs font-bold'
const Txt=({l,...p})=><label className="block"><span className={L}>{l}</span><input className="sel w-full" {...p}/></label>
const Num=({l,...p})=><label className="block"><span className={L}>{l}</span><div className="relative"><span className="mut absolute left-3 top-1/2 -translate-y-1/2 font-bold">$</span><input type="number" step="0.01" min="0" className="sel w-full !pl-7" {...p}/></div></label>
const Thumb=({src})=><div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/15 to-fuchsia-500/15">{src?<img src={src} alt="" className="h-full w-full object-contain"/>:<Icon n="phone" className="text-indigo-400"/>}</div>

async function shrink(file,max=900){ // resize + webp keeps free storage small
  const b=await createImageBitmap(file),r=Math.min(1,max/Math.max(b.width,b.height))
  const c=document.createElement('canvas');c.width=Math.round(b.width*r);c.height=Math.round(b.height*r)
  c.getContext('2d').drawImage(b,0,0,c.width,c.height)
  return new Promise(res=>c.toBlob(res,'image/webp',.85))}

export default function Admin({rows,models,reload,toast,t,lang,H}){
  const [f,setF]=useState(null),[err,setErr]=useState(''),[busy,setBusy]=useState(false),fi=useRef()
  if(!configured)return <p className="mt-6">{t.noconf}</p>
  const adj=async(v,d,r)=>{const {error}=await supabase.rpc('adjust_stock',{p_variant:v.id,p_delta:d,p_reason:r});error?toast(error.message):reload()}
  const del=async v=>{if(!confirm(`${t.confirm} ${v.products.name} ${v.storage}`))return
    const {error}=await supabase.from('product_variants').delete().eq('id',v.id);error?toast(error.message):(toast(t.deleted),reload())}
  const pick=async file=>{if(!file||!file.type.startsWith('image/'))return;setBusy(true);setErr('')
    try{const blob=await shrink(file),path=`${Date.now()}-${Math.random().toString(36).slice(2,8)}.webp`
      const {error}=await supabase.storage.from('product-images').upload(path,blob,{contentType:'image/webp',cacheControl:'31536000'});if(error)throw error
      setF(x=>({...x,image_url:supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl}))}
    catch(e){setErr(e.message)}setBusy(false)}
  const save=async e=>{e.preventDefault();setErr('')
    const name=f.name.trim()
    let {data:p}=await supabase.from('products').select('id').eq('name',name).maybeSingle()
    if(!p){const r=await supabase.from('products').insert({name,sort_order:999}).select('id').single();if(r.error)return setErr(r.error.message);p=r.data}
    const row={product_id:p.id,storage:f.storage.trim(),price:num(f.price),price_min:num(f.price_min),price_max:num(f.price_max),
      preorder_price:num(f.preorder_price),stock_qty:Math.max(0,parseInt(f.stock_qty)||0),image_url:f.image_url||null,condition:f.condition||null,notes:f.notes||null}
    const r=f.id?await supabase.from('product_variants').update(row).eq('id',f.id):await supabase.from('product_variants').insert(row)
    if(r.error)return setErr(r.error.message);setF(null);toast(t.saved);reload()}
  const set=k=>e=>setF({...f,[k]:e.target.value})
  const qty=d=>setF({...f,stock_qty:Math.max(0,(parseInt(f.stock_qty)||0)+d)})
  const edit=v=>{setErr('');setF({id:v.id,name:v.products.name,storage:v.storage,price:v.price??'',price_min:v.price_min??'',price_max:v.price_max??'',
    preorder_price:v.preorder_price??'',stock_qty:v.stock_qty,image_url:v.image_url??'',condition:v.condition??'',notes:v.notes??''})}

  return <div className="mt-4 animate-fadeUp">
    <div className="flex flex-wrap items-center gap-2"><div><h2 className={`grad ${H} text-xl sm:text-2xl`}>{t.adminTitle}</h2><p className="mut text-xs">{t.adminNote}</p></div>
      <button className="btn ml-auto" onClick={()=>{setErr('');setF(empty)}}><Icon n="plus" s={16}/>{t.add}</button></div>
    <div className="mt-4 space-y-2">{rows.map((v,i)=>
      <div key={v.id} style={{animationDelay:`${Math.min(i,14)*40}ms`}} className="card flex animate-fadeUp flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3">
        <Thumb src={v.image_url}/>
        <div className="min-w-[8rem] flex-1"><b>{v.products.name}</b> <span className="mut text-sm">{v.storage}</span>
          <div className="text-sm"><b className="grad">{priceText(v)}</b>{v.preorder_price!=null&&<span className="ml-3 text-xs font-bold text-amber-500">{t.early}: {fmt(v.preorder_price)}</span>}</div></div>
        <Badge v={v} lang={lang}/>
        <div className="flex items-center gap-1">
          <button className="ghost !p-2" disabled={v.stock_qty<=0} onClick={()=>adj(v,-1,'sold')} aria-label="−"><Icon n="minus" s={16}/></button>
          <b className="w-9 text-center text-lg">{v.stock_qty}</b>
          <button className="ghost !p-2" onClick={()=>adj(v,1,'restock')} aria-label="+"><Icon n="plus" s={16}/></button></div>
        <div className="flex gap-1"><button className="ghost !p-2 text-indigo-500" onClick={()=>edit(v)} aria-label={t.edit}><Icon n="edit" s={16}/></button>
          <button className="ghost !p-2 text-rose-500" onClick={()=>del(v)} aria-label={t.del}><Icon n="trash" s={16}/></button></div>
      </div>)}</div>

    {f&&createPortal(<div className="fixed inset-0 z-[60] grid place-items-center bg-black/65 p-3 backdrop-blur-sm" onClick={()=>setF(null)}>
      <form onSubmit={save} onClick={e=>e.stopPropagation()} className="card flex max-h-[92dvh] w-full max-w-2xl animate-pop flex-col overflow-hidden shadow-2xl shadow-indigo-500/30">
        <div className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-blue-700 via-indigo-600 to-fuchsia-600 px-5 py-4 text-white">
          <Icon n={f.id?'edit':'plus'} s={22}/><h3 className={`${H} flex-1 text-base`}>{f.id?t.editp:t.newp}</h3>
          <button type="button" onClick={()=>setF(null)} aria-label={t.cancel} className="rounded-lg p-1 transition hover:bg-white/20"><Icon n="x" s={20}/></button></div>
        <div className="kbach shrink-0"/>
        <div className="grid gap-5 overflow-y-auto p-5 md:grid-cols-[200px_1fr]">
          <div>
            <span className={L}>{t.photo}</span>
            <div onClick={()=>fi.current.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();pick(e.dataTransfer.files[0])}}
              className="relative grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-indigo-400/60 bg-gradient-to-br from-blue-500/10 to-fuchsia-500/10 text-center transition hover:border-fuchsia-400 hover:shadow-lg hover:shadow-indigo-500/20">
              {f.image_url?<img src={f.image_url} alt="" className="h-full w-full object-contain p-2"/>
                :<div className="p-3"><Icon n="upload" s={34} className="mx-auto animate-float text-indigo-500"/><p className="mt-2 text-sm font-bold">{t.upload}</p><p className="mut text-xs">{t.drop}</p></div>}
              {busy&&<div className="absolute inset-0 grid place-items-center bg-black/55 text-sm font-bold text-white"><span className="animate-pulse">{t.busy}</span></div>}
            </div>
            <input ref={fi} type="file" accept="image/*" hidden onChange={e=>{pick(e.target.files[0]);e.target.value=''}}/>
            <div className="mt-2 flex gap-2"><button type="button" className="ghost flex-1 justify-center !py-1.5 text-xs" onClick={()=>fi.current.click()}><Icon n="upload" s={14}/>{t.upload}</button>
              {f.image_url&&<button type="button" className="ghost !p-1.5 text-rose-500" onClick={()=>setF({...f,image_url:''})} aria-label={t.rm}><Icon n="trash" s={14}/></button>}</div>
          </div>
          <div className="space-y-4">
            <Txt l={`${t.model} *`} required list="models" placeholder="iPhone 13 Pro" value={f.name} onChange={set('name')}/>
            <datalist id="models">{models.map(m=><option key={m} value={m}/>)}</datalist>
            <div><span className={L}>{t.storage} *</span><div className="flex flex-wrap gap-1.5">{SZ.map(z=>
              <button type="button" key={z} onClick={()=>setF({...f,storage:z})} className={`rounded-full px-3 py-1 text-sm font-bold transition ${f.storage===z?'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md':'ghost'}`}>{z}</button>)}</div>
              <input required className="sel mt-2 w-full" placeholder="128GB" value={f.storage} onChange={set('storage')}/></div>
            <div className="grid grid-cols-2 gap-3"><Num l={`${t.price} *`} required value={f.price} onChange={set('price')}/><Num l={t.early} value={f.preorder_price} onChange={set('preorder_price')}/></div>
            <div className="rounded-2xl border border-dashed border-[var(--line)] p-3"><span className={L}>{t.range}</span>
              <div className="grid grid-cols-2 gap-3"><Num l={t.min} value={f.price_min} onChange={set('price_min')}/><Num l={t.max} value={f.price_max} onChange={set('price_max')}/></div></div>
            <div className="grid grid-cols-2 gap-3">
              <div><span className={L}>{t.qty}</span><div className="flex items-center gap-1"><button type="button" className="ghost !p-2.5" onClick={()=>qty(-1)}><Icon n="minus" s={16}/></button>
                <input type="number" min="0" className="sel w-full text-center font-bold" value={f.stock_qty} onChange={set('stock_qty')}/><button type="button" className="ghost !p-2.5" onClick={()=>qty(1)}><Icon n="plus" s={16}/></button></div></div>
              <div><span className={L}>{t.cond}</span><div className="grid grid-cols-3 gap-1">{[['','—'],['New','New'],['Used','Used']].map(([k,l])=>
                <button type="button" key={k} onClick={()=>setF({...f,condition:k})} className={`rounded-xl py-2.5 text-sm font-bold transition ${f.condition===k?'bg-gradient-to-r from-blue-600 to-violet-600 text-white':'ghost justify-center'}`}>{l}</button>)}</div></div></div>
            <Txt l={t.notes} value={f.notes} onChange={set('notes')}/>
            {err&&<p className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-500"><Icon n="alert" s={16}/>{err}</p>}
          </div>
        </div>
        <div className="flex shrink-0 gap-3 border-t border-[var(--line)] p-4"><button type="button" className="ghost flex-1 justify-center" onClick={()=>setF(null)}>{t.cancel}</button>
          <button className="btn flex-[2]" disabled={busy}><Icon n="check" s={18}/>{t.save}</button></div>
      </form></div>,document.body)}
  </div>
}
