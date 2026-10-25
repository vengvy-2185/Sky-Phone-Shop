export const LOW=2 // stock <= LOW (and > 0) = Low Stock
export const status=q=>q<=0?'out':q<=LOW?'low':'in'
export const ST={
  in:{kh:'មានស្តុក',en:'Available',c:'bg-emerald-500/15 text-emerald-500'},
  low:{kh:'ជិតអស់ស្តុក',en:'Low Stock',c:'bg-amber-500/15 text-amber-500'},
  out:{kh:'អស់ស្តុក',en:'Out of Stock',c:'bg-rose-500/15 text-rose-500'}}
export const T={
 kh:{home:'ទំព័រដើម',list:'តារាងតម្លៃ',admin:'គ្រប់គ្រង',search:'ស្វែងរកអ្វីក៏បាន៖ 13 Pro, 15PM, 399, មានស្តុក...',models:'ម៉ូដែលទាំងអស់',storage:'ទំហំផ្ទុក',stock:'ស្ថានភាពស្តុក',
  s_def:'តាមម៉ូដែល',s_asc:'តម្លៃ ទាប→ខ្ពស់',s_desc:'តម្លៃ ខ្ពស់→ទាប',s_stock:'ស្តុកច្រើន',s_new:'ថ្មីៗ',grid:'កាត',table:'តារាង',results:'លទ្ធផល',
  copy:'ចម្លងតម្លៃ',copied:'បានចម្លង',early:'ចូលរួមមុន',price:'តម្លៃ',total:'សរុប',instock:'មានស្តុក',outstock:'អស់ស្តុក',
  empty:'រកមិនឃើញ',hint:'សាកល្បងពាក្យផ្សេង ឬលុបតម្រង',retry:'ព្យាយាមម្តងទៀត',add:'បន្ថែមផលិតផល',save:'រក្សាទុក',edit:'កែប្រែ',del:'លុប',
  confirm:'លុបផលិតផលនេះ?',saved:'បានរក្សាទុក',deleted:'បានលុប',model:'ម៉ូដែល',cond:'ស្ថានភាពទំនិញ',notes:'កំណត់ចំណាំ',img:'តំណរូបភាព',
  min:'តម្លៃទាបបំផុត',max:'តម្លៃខ្ពស់បំផុត',qty:'ចំនួនស្តុក',adminTitle:'គ្រប់គ្រងស្តុក',adminNote:'ក្រុមការងារកែបានភ្លាមៗ គ្មានការ Login',
  tag1:'តម្លៃល្អ',tag2:'ស្តុកច្បាស់',sub:'iPhone · កុំព្យូទ័រ · គ្រឿងបន្លាស់',noconf:'មិនទាន់ភ្ជាប់ Supabase សូមបំពេញ .env',cancel:'បោះបង់',upload:'ផ្ទុករូបភាពឡើង',drop:'ចុច ឬទាញរូបមកទីនេះ',busy:'កំពុងផ្ទុក...',rm:'ដករូប',range:'ជួរតម្លៃ (ស្រេចចិត្ត)',newp:'ផលិតផលថ្មី',editp:'កែប្រែផលិតផល',photo:'រូបភាព',foot:'តម្លៃល្អ ស្តុកច្បាស់ ប្រើប្រាស់ច្រើន'},
 en:{home:'Home',list:'Price list',admin:'Manage',search:'Search anything: 13 Pro, 15PM, 399, in stock...',models:'All models',storage:'Storage',stock:'Stock status',
  s_def:'By model',s_asc:'Price low→high',s_desc:'Price high→low',s_stock:'Most stock',s_new:'Recent',grid:'Cards',table:'Table',results:'Results',
  copy:'Copy price',copied:'Copied',early:'Early Join',price:'Price',total:'Total',instock:'In stock',outstock:'Out',
  empty:'No match for',hint:'Try another word or clear filters',retry:'Retry',add:'Add product',save:'Save',edit:'Edit',del:'Delete',
  confirm:'Delete this product?',saved:'Saved',deleted:'Deleted',model:'Model',cond:'Condition',notes:'Notes',img:'Image URL',
  min:'Min price',max:'Max price',qty:'Stock qty',adminTitle:'Stock management',adminNote:'Staff can edit instantly, no login',
  tag1:'Best price',tag2:'Real stock',sub:'iPhone · Computer · Accessories',noconf:'Supabase not connected. Fill in .env',cancel:'Cancel',upload:'Upload photo',drop:'Click or drop a photo here',busy:'Uploading...',rm:'Remove',range:'Price range (optional)',newp:'New product',editp:'Edit product',photo:'Photo',foot:'Best price · Real stock · Trusted'}}
export const fmt=n=>'$'+Number(n).toLocaleString('en-US',{maximumFractionDigits:2})
export const priceText=v=>v.price_min!=null&&v.price_max!=null&&+v.price_min!==+v.price_max?`${fmt(v.price_min)}–${fmt(v.price_max)}`:fmt(v.price)
export const copyText=(v,l='en')=>['SKY PHONE SHOP',`${v.products.name} ${v.storage}`,`${T[l].price}: ${priceText(v)}`,
  v.preorder_price!=null&&`${T[l].early}: ${fmt(v.preorder_price)}`,`${T[l].stock}: ${ST[status(v.stock_qty)][l]}`].filter(Boolean).join('\n')
// "12PM"→"12 pro max", "13p"→"13 pro", "128gb"→"128 gb"; $ , – ignored
export const norm=s=>String(s).toLowerCase().replace(/[$,–/]/g,' ').replace(/(\d+)\s*pm\b/g,'$1 pro max').replace(/(\d+)\s*p\b/g,'$1 pro')
  .replace(/(\d+)\s*(gb|tb)/g,'$1 $2').replace(/\s+/g,' ').trim()
// searches model, storage, prices, preorder, condition, notes, stock number and status (KH + EN)
const hay=v=>norm([v.products.name,v.storage,v.price,v.price_min,v.price_max,v.preorder_price,v.condition,v.notes,v.stock_qty,ST[status(v.stock_qty)].kh,ST[status(v.stock_qty)].en].filter(x=>x!=null&&x!=='').join(' '))
export const matches=(v,q)=>{const h=hay(v),w=h.split(' ')
  return norm(q).split(' ').filter(Boolean).every(t=>/^\d+$/.test(t)?w.includes(t)||(t.length>2&&w.some(x=>x.startsWith(t))):h.includes(t))}
