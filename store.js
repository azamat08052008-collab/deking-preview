'use strict';
const products = window.products;
const byId = new Map(products.map(p => [p.id, p]));
const get = id => document.getElementById(id);
const money = value => value.toLocaleString('ru-RU') + ' ₽';
const fmt = value => Number(value.toFixed(3)).toLocaleString('ru-RU');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const categoryLink = c => c ? '#catalog?category=' + encodeURIComponent(c) : '#catalog';
const productLink = p => '#product/' + p.id;
const seriesGroups = new Map();
for (const p of products) {
  const key = p.category + '|' + p.series;
  if (!seriesGroups.has(key)) seriesGroups.set(key, []);
  seriesGroups.get(key).push(p);
}
const categories = ['Террасная доска','Фасады','Ступени','Садовый паркет','Ограждения','Опоры и лаги','Комплектующие'];
const displayCategory = c => c === 'Фасады' ? 'Фасадные панели' : c;
const categoryImages = {'Террасная доска':'deck','Фасады':'wall','Ступени':'stair','Комплектующие':'fix'};
get('category-grid').innerHTML = Object.entries(categoryImages).map(([name,img]) => `
  <a class="category" href="${categoryLink(name)}"><h3>${displayCategory(name)}</h3><span class="jump" aria-hidden="true">↗</span><img src="media/sample-${img}.webp" alt="" loading="lazy"></a>`).join('');

const vintage = products.find(p => p.series === 'Vintage' && p.color === 'Венге');
const pine = products.find(p => p.series === 'CM Wall' && p.color === 'Сосна');
const heroSlides = [
  {file:'terrace',title:'CM Decking · Загородная терраса',label:'Доска Vintage · Венге',url:productLink(vintage),alt:'Настил CM Decking Vintage в цвете венге на террасе дома',x:69,y:68},
  {file:'facade',title:'CM Wall · Дом в Карелии',label:'Панель CM Wall · Сосна',url:productLink(pine),alt:'Реечная облицовка входа в дом в Карелии',x:65,y:48},
  {file:'luciano',title:'Декинг+ · ЖК Luciano',label:'Проект Luciano',url:'#project/luciano',alt:'Терраса с перголой на эксплуатируемой кровле ЖК Luciano',x:67,y:72}
];
let slide = 0;
function showSlide(index) {
  slide = (index + heroSlides.length) % heroSlides.length;
  const data = heroSlides[slide], photo = document.querySelector('.hero-image'), pin = get('hero-pin');
  photo.src = 'media/hero/' + data.file + '.webp';
  photo.alt = data.alt;
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) photo.animate([{opacity:.72,transform:'scale(1.025)'},{opacity:1,transform:'scale(1)'}],{duration:480,easing:'ease-out'});
  get('slide-now').textContent = String(slide + 1).padStart(2,'0');
  document.querySelector('.progress-mark').style.background = `linear-gradient(to right,white ${(slide+1)*100/3}%,#ffffff55 0)`;
  get('scene-title').textContent = data.title;
  get('open-tour').hidden=slide!==0;
  pin.href = data.url;
  pin.querySelector('span').textContent = data.label;
  pin.style.left = data.x + '%';
  pin.style.top = data.y + '%';
}
document.querySelectorAll('[data-slide]').forEach(b => b.onclick = () => showSlide(slide + Number(b.dataset.slide)));
let touchX, touchY;
const hero = document.querySelector('.hero');
hero.addEventListener('touchstart',e => {touchX=e.touches[0].clientX;touchY=e.touches[0].clientY},{passive:true});
hero.addEventListener('touchend',e => {
  const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;
  if(Math.abs(dx)>65 && Math.abs(dy)<45) showSlide(slide + (dx<0?1:-1));
},{passive:true});
showSlide(0);
const tour=get('tour-dialog');
const tourFrames=[
  ['terrace','Общий вид террасы','Настил вокруг загородного дома',68,67],
  ['terrace-detail','Галерея вдоль дома','Продольная раскладка террасной доски',54,73],
  ['terrace-board','Фактура настила','Узел настила и рисунок доски Vintage',42,66]
];
let tourIndex=0;
function renderTour(delta=0){
  tourIndex=(tourIndex+delta+tourFrames.length)%tourFrames.length;
  const [file,title,alt,x,y]=tourFrames[tourIndex];
  const image=get('tour-photo');
  image.src='media/'+file+'.webp';image.alt=alt;
  get('tour-caption').textContent=(tourIndex+1)+' / '+tourFrames.length+' · '+title;
  get('tour-pin').style.setProperty('--x',x+'%');get('tour-pin').style.setProperty('--y',y+'%');
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)image.animate([{transform:'scale(1.035)',opacity:.76},{transform:'scale(1)',opacity:1}],{duration:700,easing:'ease-out'});
}
get('tour-pin').href=productLink(vintage);
get('tour-pin').onclick=()=>tour.close();
get('open-tour').onclick=()=>{tourIndex=0;renderTour();tour.showModal()};
get('tour-prev').onclick=()=>renderTour(-1);
get('tour-next').onclick=()=>renderTour(1);
tour.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();renderTour(e.key==='ArrowLeft'?-1:1)}
});
get('vintage-feature').href = productLink(vintage);
get('featured-series').innerHTML=['Bark','Robust','Reverse'].map(name=>{
  const variants=seriesGroups.get('Террасная доска|'+name), p=variants[0];
  return `<a class="series-row" href="${productLink(p)}"><img loading="lazy" src="${p.images[0]}" alt=""><span><strong>${name}</strong><small>${money(p.price)} / шт. · ${p.size} мм</small></span><i aria-hidden="true">↗</i></a>`;
}).join('');

const projects = [
  ['luciano','ЖК Luciano','Терраса на крыше · Казань','Установили регулируемые опоры, алюминиевый каркас, настил и перголу. Выполнили электромонтаж.'],
  ['plage','Комплекс «Пляж»','Термальный комплекс · Казань','Подобрали и поставили материалы. Смонтировали винтовые сваи, несущий каркас, террасную доску, ступени, встроенные скамейки и ограждения.'],
  ['golf','Ak Bars Golf Club','Терраса гольф-клуба','Подобрали материалы и смонтировали террасу на регулируемых опорах и алюминиевом каркасе.'],
  ['rivera','Комплекс «Ривьера»','Общественное пространство · Казань','Смонтировали каркас фасада, сварили каркасы скамеек, облицевали их террасной доской и установили освещение.'],
  ['minger','Отель и СПА Minger','Открытая терраса отеля','Поставили материалы под ключ. Террасный настил уложили на алюминиевом каркасе и регулируемых опорах.'],
  ['stars','ЖК «5 звёзд»','Эксплуатируемая кровля · Казань','Установили опоры и алюминиевый каркас, смонтировали террасную доску и декоративную облицовку из ДПК.'],
  ['pool','Терраса с бассейном','Частный объект · Татарстан','Сварили несущий каркас, смонтировали настил, ступени и фасадные панели, собрали реечные перегородки.']
];
let allProjects=false;
function renderProjects(){
  get('project-grid').innerHTML=(allProjects?projects:projects.slice(0,3)).map(([id,title,type])=>
    `<a class="project-card" href="#project/${id}"><img src="media/${id}.webp" alt="" loading="lazy"><span class="project-meta"><span><small>${type}</small><strong>${title}</strong></span><span>↗</span></span></a>`).join('');
  get('all-projects').textContent=allProjects?'Свернуть ↑':'Все объекты ↗';
  get('all-projects').setAttribute('aria-expanded',String(allProjects));
}
get('all-projects').onclick=()=>{allProjects=!allProjects;renderProjects()};
renderProjects();
const files = [
  ['Технический каталог CM','technical-2025.pdf'],
  ['Монтаж террасной доски','deck.pdf'],['Монтаж облицовки Cladding','facade.pdf'],
  ['Монтаж стеновых панелей Wall','wall.pdf'],['Монтаж ступеней Stair','stairs.pdf']
];
function fileLink(label,url){
  return `<a class="doc" href="${esc(url)}" target="_blank" rel="noopener"><span class="filetype">${url.split('.').pop().toUpperCase()}</span>${esc(label)}<span class="external">↗</span></a>`;
}
get('library-files').innerHTML=files.map(([n,f])=>fileLink(n,'documents/'+f)).join('');
const menu=document.querySelector('.menu-toggle');
function closeMenu(){get('mobile-nav').hidden=true;menu.setAttribute('aria-expanded','false')}
menu.onclick=()=>{get('mobile-nav').hidden=!get('mobile-nav').hidden;menu.setAttribute('aria-expanded',String(!get('mobile-nav').hidden))};
get('mobile-nav').addEventListener('click',closeMenu);

const shop=get('shop-view');
const priceText=p=>p.price==null?'Цена по запросу':money(p.price)+' / '+p.unit;
let activeCategory='',query='',colorFilter='',sort='default',shown=16,activeProduct=null,photoIndex=0;
let returnCatalog='#catalog';
function catalogView(params){
  activeCategory=categories.includes(params.get('category'))?params.get('category'):'';
  query=params.get('q')||'';colorFilter=params.get('color')||'';sort=['low','high'].includes(params.get('sort'))?params.get('sort'):'default';shown=16;
  const availableColors=[...new Set(products.filter(p=>(!activeCategory||p.category===activeCategory)&&p.color).map(p=>p.color))].sort((a,b)=>a.localeCompare(b,'ru'));
  if(!availableColors.includes(colorFilter))colorFilter='';
  shop.innerHTML=`<div class="breadcrumbs"><a href="#home">Главная</a><span>/</span>Каталог</div>
    <div class="catalog-header"><div><p class="kicker">CM Scandinavia</p><h1>Каталог материалов</h1></div>
    <label class="search-box"><i class="search-icon"></i><input id="catalog-search" type="search" aria-label="Поиск по каталогу" placeholder="Серия, цвет или материал" value="${esc(query)}"></label></div>
    <div class="cat-tabs">${['',...categories].map(c=>`<a class="chip ${activeCategory===c?'active':''}" href="${categoryLink(c)}">${displayCategory(c)||'Все материалы'}</a>`).join('')}</div>
    <div class="result-bar"><span id="result-count" aria-live="polite"></span><div class="filter-selects"><label>Цвет <select id="color-filter"><option value="">Все цвета</option>${availableColors.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select></label><label>Порядок <select id="sort"><option value="default">По коллекциям</option><option value="low">Сначала дешевле</option><option value="high">Сначала дороже</option></select></label></div></div>
    <div id="product-grid" class="product-grid"></div><button class="button outline" id="show-more" hidden>Показать ещё</button>
    <p class="shop-footer-note">Цены по розничному прайсу Казани за июнь 2026 года. Менеджер подтвердит стоимость и наличие перед заказом.</p>`;
  get('color-filter').value=colorFilter;
  get('color-filter').onchange=e=>{colorFilter=e.target.value;shown=16;updateCatalogAddress();renderTiles()};
  get('sort').value=sort;
  get('catalog-search').oninput=e=>{query=e.target.value;shown=16;updateCatalogAddress();renderTiles()};
  get('sort').onchange=e=>{sort=e.target.value;shown=16;updateCatalogAddress();renderTiles()};
  get('show-more').onclick=()=>{shown+=16;renderTiles()};
  renderTiles();
}
function updateCatalogAddress(){
  const p=new URLSearchParams();
  if(activeCategory)p.set('category',activeCategory);
  if(query.trim())p.set('q',query.trim());
  if(sort!=='default')p.set('sort',sort);
  if(colorFilter)p.set('color',colorFilter);
  returnCatalog='#catalog'+(p.size?'?'+p:'');
  try{history.replaceState(null,'',returnCatalog)}catch{}
}
function renderTiles(){
  const words=query.trim().toLocaleLowerCase('ru').split(/\s+/);
  const matching=[];
  for(const variants of seriesGroups.values()){
    const options=variants.filter(p=>{
      const terms=[p.series,p.color,p.category,displayCategory(p.category),p.size,'CM Scandinavia',p.category==='Террасная доска'||p.category==='Фасады'?'дпк композит':''].join(' ').toLocaleLowerCase('ru');
      return (!activeCategory||p.category===activeCategory)&&(!colorFilter||p.color===colorFilter)&&words.every(word=>terms.includes(word));
    });
    if(options.length)matching.push(options);
  }
  const min=options=>Math.min(...options.map(p=>p.price??Infinity));
  if(sort!=='default')matching.sort((a,b)=>!Number.isFinite(min(a))?Number.isFinite(min(b))?1:0:!Number.isFinite(min(b))?-1:sort==='low'?min(a)-min(b):min(b)-min(a));
  get('result-count').textContent='Серий и моделей: '+matching.length;
  get('show-more').hidden=matching.length<=shown;
  get('product-grid').innerHTML=matching.length?matching.slice(0,shown).map(opts=>{
    const p=opts[0],colors=[...new Set(opts.map(v=>v.color).filter(Boolean))],amount=min(opts);
    return `<a class="product-tile" href="${productLink(p)}"><span class="visual"><img loading="lazy" src="${p.images[0]}" alt="${esc(p.series)}"></span><span class="tile-meta"><small>${displayCategory(p.category)}</small><strong>${esc(p.series)}</strong><small>${colors.length>1?'Оттенков: '+colors.length:esc(colors[0]||p.size||'CM Scandinavia')}</small><span class="price">${isFinite(amount)?(new Set(opts.map(v=>v.price)).size>1?'от ':'')+money(amount)+' / '+p.unit:'Цена по запросу'}</span></span></a>`;
  }).join(''):'<p class="empty">Материалов по этому запросу пока нет. Попробуйте другое название или цвет.</p>';
}
function variantsOf(p){return seriesGroups.get(p.category+'|'+p.series)}
function quantityControl(value,pack,label,attr=''){
  return `<span class="stepper" ${attr}><button type="button" data-step="-1" aria-label="Уменьшить количество">−</button><input type="number" aria-label="${esc(label)}" min="${pack}" max="${maxQuantity(pack)}" step="${pack}" value="${value}"><button type="button" data-step="1" aria-label="Увеличить количество">+</button></span>`;
}
function maxQuantity(pack){return Math.floor(99999/pack)*pack}
function allowed(value,pack){return Math.min(maxQuantity(pack),Math.max(pack,Math.ceil((Number(value)||pack)/pack)*pack))}
function productView(p){
  activeProduct=p;photoIndex=0;
  const variants=variantsOf(p),colors=[...new Set(variants.map(v=>v.color).filter(Boolean))],lengths=variants.filter(v=>v.color===p.color);
  const imageList=[...p.images];
  if(p.scene)imageList.push(p.scene);
  if(p.scene==='media/terrace.webp')imageList.push('media/terrace-board.webp');
  shop.innerHTML=`<div class="breadcrumbs"><a href="#home">Главная</a> / <a href="${esc(returnCatalog)}">Каталог</a> / <a href="${categoryLink(p.category)}">${displayCategory(p.category)}</a></div>
    <div class="detail-layout"><div><div class="product-photo"><img id="detail-image" src="${imageList[0]}" alt="${esc(p.series+' '+p.color)}"></div>
    ${imageList.length>1?`<div class="thumbs">${imageList.map((url,i)=>`<button data-thumb="${i}" aria-label="${i>=p.images.length?'Материал на объекте':'Ракурс '+(i+1)}" aria-pressed="${i===0}"><img src="${url}" alt="">${i===p.images.length?'<small>На объекте</small>':''}</button>`).join('')}</div>`:''}</div>
    <div><p class="kicker">${p.series.toLowerCase().startsWith('level')?'Level':'CM Scandinavia'} · ${displayCategory(p.category)}</p><h1>${esc(p.series)}</h1>
    ${p.description?`<p class="product-summary">${esc(p.description)}</p>`:''}
    ${colors.length?`<span class="choice-label">Цвет · ${esc(p.color)}</span><div class="swatches">${colors.map(c=>{
      const variant=variants.find(v=>v.color===c&&v.size===p.size)||variants.find(v=>v.color===c);
      return `<a class="chip ${c===p.color?'active':''}" href="${productLink(variant)}">${esc(c)}</a>`;
    }).join('')}</div>`:''}
    ${lengths.length>1?`<span class="choice-label">Размер, мм</span><div class="select-size">${lengths.map(v=>`<a class="chip ${v.id===p.id?'active':''}" href="${productLink(v)}">${esc(v.size)}</a>`).join('')}</div>`:''}
    <div class="purchasing"><div class="detail-price">${priceText(p)}</div>${p.areaPrice!=null?`<span class="card-meta">${money(p.areaPrice)} / м²</span>`:''}
    ${p.coverage?`<details class="area-calc"><summary>Рассчитать по площади</summary><label>Площадь, м² <input id="area-input" type="number" min="0.01" step="any" placeholder="Например, 12"></label><button id="calc-apply" class="chip">Рассчитать</button><span id="calc-result" role="status"></span></details>`:''}
    <div class="buy-row">${quantityControl(p.pack,p.pack,'Количество к заказу','id="detail-qty"')}<button class="button primary" id="add-product">В корзину <span class="add-icon" aria-hidden="true">+</span></button></div>
    <p class="buy-note" id="detail-total"></p></div>
    <p class="buy-note">Менеджер уточнит наличие, доставку и монтаж по вашему списку.</p></div></div>
    <div class="detail-extra"><div><h3>Характеристики</h3><dl>${[['Бренд',p.series.toLowerCase().startsWith('level')?'Level':'CM Scandinavia'],['Категория',displayCategory(p.category)],['Серия',p.series],['Цвет',p.color],['Размер',p.size&&p.size+(/клипс|уголков/i.test(p.size)?'':' мм')],['Единица заказа',p.unit],['Количество в упаковке',p.pack>1?p.pack+' шт.':''],['Площадь на штуку',p.coverage?fmt(p.coverage)+' м²':'']].filter(([,v])=>v).map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div><div><h3>Документы производителя</h3>${p.documents.map(d=>fileLink(d.label,d.url)).join('')}</div></div>
    <p class="shop-footer-note">Розничный прайс · Казань, июнь 2026 года.</p>`;
  shop.querySelectorAll('[data-thumb]').forEach(b=>b.onclick=()=>{
    photoIndex=Number(b.dataset.thumb);get('detail-image').src=imageList[photoIndex];
    get('detail-image').classList.toggle('scene-photo',photoIndex>=p.images.length);
    shop.querySelectorAll('[data-thumb]').forEach(el=>el.setAttribute('aria-pressed',String(b===el)));
  });
  const input=get('detail-qty').querySelector('input');
  const update=()=>{
    const q=allowed(input.value,p.pack);input.value=q;
    get('detail-total').textContent=[p.pack>1?'Упаковка '+p.pack+' шт.':'',p.coverage?fmt(q*p.coverage)+' м²':'',p.price!=null?'Сумма '+money(p.price*q):''].filter(Boolean).join(' · ');
  };
  const areaInput=get('area-input');
  if(areaInput){
    get('calc-apply').onclick=()=>{
      const area=areaInput.valueAsNumber, largest=maxQuantity(p.pack)*p.coverage;
      if(!Number.isFinite(area)||area<=0||area>largest){
        get('calc-result').textContent='Укажите площадь от 0,01 до '+fmt(largest)+' м².';return;
      }
      input.value=allowed(Math.ceil(area/p.coverage-1e-9),p.pack);update();
      get('calc-result').textContent='Для '+fmt(area)+' м² — '+input.value+' '+p.unit+' с округлением до упаковки.';
    };
  }
  input.onchange=()=>{update();if(get('calc-result'))get('calc-result').textContent=''};

  get('detail-qty').querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{input.value=Number(input.value)+Number(b.dataset.step)*p.pack;update()});
  get('add-product').onclick=()=>{update();basket[p.id]=allowed((basket[p.id]||0)+Number(input.value),p.pack);saveCart();openCart()};
  update();
}
const cartKey='decking-cart-v2';
let basket={};
try{
  const raw=localStorage.getItem(cartKey);
  if(raw){
    for(const [id,q] of Object.entries(JSON.parse(raw))){
      if(byId.has(id)&&Number.isSafeInteger(q)&&q>0)basket[id]=allowed(q,byId.get(id).pack);
    }
  }else if(typeof items!=='undefined'){
    const old=JSON.parse(localStorage.getItem('decking-order-v1')||'{}');
    for(const [index,q] of Object.entries(old)){
      const row=items[index];if(!row||!Number.isSafeInteger(q)||q<=0)continue;
      const [series,color='']=row[0].split(' · ');
      const p=products.find(p=>p.series===series&&p.color===color&&p.category===row[1]&&(!row[5]||p.size===row[5]));
      if(p)basket[p.id]=allowed(q,p.pack);
    }
  }
}catch{}
function saveCart(){
  try{localStorage.setItem(cartKey,JSON.stringify(basket))}catch{}
  document.querySelector('[data-cart-count]').textContent=Object.keys(basket).length;
}
saveCart();
const cart=get('cart-dialog');
function orderText(){
  const entries=Object.entries(basket);let total=0,asked=false;
  const lines=entries.map(([id,q])=>{
    const p=byId.get(id);
    if(p.price==null)asked=true;else total+=p.price*q;
    return ['CM '+p.series,p.color,p.size].filter(Boolean).join(' · ')+' — '+q+' '+p.unit+' · '+priceText(p);
  });
  if(total)lines.push((asked?'Сумма позиций с ценами: ':'Сумма по прайсу: ')+money(total));
  return 'Добрый день! Прошу проверить наличие и рассчитать заказ.\n\n'+lines.join('\n');
}
function renderCart(){
  const contents=Object.entries(basket);
  if(!contents.length){
    get('cart-body').innerHTML='<p class="empty">Добавьте материалы из каталога, чтобы отправить список менеджеру.</p><a href="#catalog" class="button primary" data-cart-catalog>В каталог ↗</a>';
    get('cart-body').querySelector('a').onclick=()=>cart.close();return;
  }
  const total=contents.reduce((sum,[id,q])=>sum+(byId.get(id).price??0)*q,0);
  const someUnknown=contents.some(([id])=>byId.get(id).price==null);
  const text=orderText();
  get('cart-body').innerHTML=contents.map(([id,q])=>{
    const p=byId.get(id);
    return `<div class="cart-line" data-cart-line="${id}"><img src="${p.images[0]}" alt=""><div><strong>${esc(p.series)}</strong><small>${esc([p.color,p.size].filter(Boolean).join(' · '))}</small><small>${priceText(p)}${p.pack>1?' · уп. '+p.pack+' шт.':''}</small></div><div class="controls">${quantityControl(q,p.pack,'Количество '+p.series+' '+p.color)}<button class="remove" data-remove>Убрать</button></div></div>`;
  }).join('')+`<div class="cart-total"><span>${someUnknown?'По позициям с ценой':'По прайсу'}</span><strong>${total?money(total):'По запросу'}</strong></div>
  <h3 class="cart-delivery">Посмотреть пример заявки</h3><p class="card-meta">Выберите мессенджер для просмотра текста.</p>
  <div class="actions">
    <button class="button primary" type="button" data-preview-channel="Telegram">Telegram</button>
    <button class="button primary" type="button" data-preview-channel="WhatsApp">WhatsApp</button>
    <button class="button primary" type="button" data-preview-channel="MAX">MAX</button>
  </div>
  <p class="cart-tip" id="preview-status" role="status"></p>
  <details><summary>Текст заявки</summary><pre class="order-text" id="order-text">${esc(text)}</pre><button class="chip" id="copy-order">Скопировать список</button><span role="status" id="copy-status"></span></details>`;
  get('cart-body').querySelectorAll('[data-preview-channel]').forEach(button=>{
    button.onclick=()=>{
      get('order-text').closest('details').open=true;
      get('preview-status').textContent='Текст заявки для '+button.dataset.previewChannel+'.';
      get('order-text').scrollIntoView({block:'nearest'});
    };
  });
  get('copy-order').onclick=async()=>{
    try{await navigator.clipboard.writeText(text);get('copy-status').textContent=' Скопировано'}
    catch{const r=document.createRange();r.selectNodeContents(get('order-text'));getSelection().removeAllRanges();getSelection().addRange(r);get('copy-status').textContent=' Текст выделен для копирования'}
  };
}
function openCart(){closeMenu();renderCart();if(!cart.open)cart.showModal()}
document.querySelectorAll('[data-open-cart]').forEach(b=>b.onclick=openCart);
function updateLine(el,remove=false,delta=0){
  const line=el.closest('[data-cart-line]');if(!line)return;
  const id=line.dataset.cartLine, p=byId.get(id);
  if(remove)delete basket[id];else basket[id]=allowed(Number(line.querySelector('input').value)+delta*p.pack,p.pack);
  saveCart();renderCart();
  const next=cart.querySelector('[data-cart-line="'+id+'"]');
  if(next)(next.querySelector(delta?'[data-step="'+delta+'"]':'input'))?.focus();
}
cart.onclick=e=>{const step=e.target.closest('[data-step]');if(step)updateLine(step,false,Number(step.dataset.step));if(e.target.closest('[data-remove]'))updateLine(e.target,true)};
cart.onchange=e=>{if(e.target.matches('.stepper input'))updateLine(e.target)};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{
  if(e.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();
}));
let lastProduct=null;
function route(){
  closeMenu();
  const [path,qs='']=location.hash.slice(1).split('?'), params=new URLSearchParams(qs);
  const p=path.startsWith('product/')?byId.get(path.slice(8)):null;
  const shopping=path==='catalog'||!!p;
  get('home-view').hidden=shopping;shop.hidden=!shopping;
  if(cart.open)cart.close();
  const projectDialog=get('project-dialog');
  if(projectDialog.open&&!path.startsWith('project/'))projectDialog.close();
  if(shopping){
    const prev=lastProduct;
    if(p){
      document.title=p.series+' — '+displayCategory(p.category)+' | Декинг+';
      productView(p);lastProduct=p;
    }else{
      document.title='Каталог материалов CM | Декинг+';
      returnCatalog=location.hash;catalogView(params);activeProduct=lastProduct=null;
    }
    if(!prev||!p||prev.series!==p.series||prev.category!==p.category)window.scrollTo(0,0);
  }else{
    lastProduct=activeProduct=null;
    document.title='Декинг+ — террасная доска и фасады в Казани';
    if(path.startsWith('project/')){
      const record=projects.find(r=>r[0]===path.slice(8));
      if(record){
        const [id,title,type,desc]=record;
        get('project-heading').textContent=title;get('project-img').src='media/'+id+'.webp';get('project-img').alt=type;get('project-description').textContent=desc;
        const images=['media/'+id+'.webp','media/'+id+'-1.webp','media/'+id+'-2.webp'];
        const gallery=get('project-gallery');
        gallery.innerHTML=images.map((url,i)=>`<button aria-label="Фото объекта ${i+1}" aria-pressed="${i===0}"><img src="${url}" alt=""></button>`).join('');
        [...gallery.children].forEach((button,i)=>button.onclick=()=>{
          get('project-img').src=images[i];
          [...gallery.children].forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
        });
        if(!projectDialog.open)projectDialog.showModal();
      }
    }else{
      const section=get(path==='case'?'projects':path==='montage'?'services':path);
      if(section)section.scrollIntoView();else window.scrollTo(0,0);
    }
  }
}
get('project-dialog').addEventListener('close',()=>{
  if(location.hash.startsWith('#project/'))location.hash='projects';
});
document.querySelector('[data-search]').onclick=()=>{
  if(!location.hash.startsWith('#catalog')){location.hash='catalog';window.addEventListener('hashchange',()=>get('catalog-search')?.focus(),{once:true})}
  else get('catalog-search')?.focus();
};
window.addEventListener('hashchange',route);
route();
