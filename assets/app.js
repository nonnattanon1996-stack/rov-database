
(function(){
const RAW = window.__ROV;
const H = RAW.heroes;
const byName = Object.fromEntries(H.map(h=>[h.th,h]));
H.forEach(h=>{ byName[h.name]=h; });

const STY = {
  P:{name:'Poke',short:'ยิงไกล กดเลือด',full:'ยิงจากระยะไกล กดเลือดศัตรูก่อนเปิดไฟต์',
     how:['ยืนระยะไกลสุดที่สกิลยังโดน','กดเลือดก่อนชิงมังกรหรือ Dark Slayer','ยิงไล่ตัวป้องกันป้อม แล้วตีป้อม','เก็บสกิลหนีไว้ ให้แทงค์คอยกันคนบุก'],
     counter:['บุกให้ถึงตัวเร็วด้วยตัวอึดและพุ่งไว','อย่ายืนระยะกลางที่โดนยิงฟรี','อ้อมพุ่มไม้เข้าด้านข้างหรือหลัง','ใช้ Heal และไอเทมฟื้นเลือด']},
  T:{name:'ทีมไฟต์',short:'รวม 5 คน สู้พร้อมกัน',full:'รวมตัว 5 คน แล้วชนะไฟต์ใหญ่ด้วยอัลติหมู่',
     how:['กลางเกมเดินเป็นกลุ่ม','ให้แทงค์เปิดไฟต์ก่อน','ใช้อัลติหมู่ตอนศัตรูยืนรวมกัน','สู้รอบมังกรและ Dark Slayer แล้วต่อป้อมทันที'],
     counter:['อย่าสู้ 5 ต่อ 5 ตรง ๆ ตอนอัลติเขาพร้อม','ยืนกระจาย ไม่ให้อัลติหมู่โดนหลายคน','หลอกให้ใช้อัลติก่อนแล้วสวน','แยกดันเลนอื่น บังคับให้แบ่งคน']},
  K:{name:'จับฆ่า',short:'ซุ่มเก็บทีละคน',full:'ดักเก็บศัตรูที่เดินคนเดียวหรือยืนผิดที่',
     how:['ซุ่มในพุ่มตามทางที่ศัตรูเดิน','ล็อกเป้าตัวบางด้วยสกิลควบคุม แล้วระเบิดดาเมจ','หายจากแผนที่ให้ศัตรูไม่รู้ตำแหน่ง','ได้คิลแล้วรีบไปตีป้อมหรือชิงมังกร'],
     counter:['เดินเป็นกลุ่ม อย่าเข้าป่าศัตรูคนเดียว','ดูมินิแมป ถ้านักฆ่าศัตรูหายให้เล่นเซฟ','ให้ตัวอึดส่องพุ่มก่อน','ใช้ Purify แก้สกิลควบคุม']},
  S:{name:'แยกดัน',short:'ดันเลนคนเดียว',full:'1–2 คนดันเลนข้าง บังคับศัตรูแบ่งกำลัง',
     how:['ดันเลนที่อยู่ไกลจากทีมศัตรู','อีก 4 คนคุมเลนกลาง ห้ามเปิดไฟต์ 4 ต่อ 5','ศัตรูมา 2–3 คนให้ถอยทันที','ดันตอนมังกรหรือ Dark Slayer เกิด'],
     counter:['ตอนเขาแยก ให้บุกไฟต์ 5 ต่อ 4','ส่งตัวที่สู้ตัวต่อตัวได้ไปกันเลน','ไป 2–3 คนดักจับตัวที่แยกดัน','ชิง Dark Slayer ตอนเขาขาดคน']},
};
const ORDER=['P','T','K','S'];
const DOTL={P:'P',T:'ท',K:'จ',S:'ด'};
const ROLE_TH={Warrior:'ไฟเตอร์',Tank:'แทงค์',Mage:'เมจ',Marksman:'แครี่ (ยิงไกล)',Assassin:'แอสซาซิน',Support:'ซัพพอร์ต'};
const LANE_TH={DS_Lane:'เลน Dark Slayer',Dragon_Lane:'เลนมังกร',Mid:'เลนกลาง',Jungle:'ป่า',Roam:'โรมมิ่ง',Unknown:'ไม่ระบุ'};
const TIER_RANK={'S+':0,S:1,A:2,B:3,C:4};

const state={sel:new Set(),mode:'all',q:'',role:'',lane:'',sort:'name',strict:false,phase:''};
const has=(h,k)=>h.styles[k]&&(!state.strict||h.styles[k].lv===2);
const SRC={
chart:['ตารางในวิดีโอที่คุณส่งมา','ไม่ทราบปี',''],
aov:['ไกด์ฮีโร่รายตัว aov-builds','2026','https://aov-builds.com/en/heroes/'],
rovmeta:['ไกด์ ROV META แพตช์ 1.64','2026','https://rovmeta.com/heroes'],
pro24:['ONE Esports: ฮีโร่ที่โปรเลือกใน RPL 2024 Winter','ส.ค. 2024','https://www.oneesports.co.th/arena-of-valor/meta-rov-rov-pro-league-2024-winter/'],
vn_pro24:['ฮีโร่ยอดนิยมในการแข่งระดับโปร (hoanghamobile)','ก.ค. 2024','https://hoanghamobile.com/tin-tuc/tuong-lien-quan-meta/'],
vn_split24:['5 ตัวแยกดัน (cellphones)','มี.ค. 2024','https://cellphones.com.vn/sforum/5-tuong-day-le-uy-tin-nhat-lien-quan'],
vn_split25:['5 ตัวคุมเลนและแยกดัน (fpt.vn)','มิ.ย. 2025','https://fpt.vn/tin-tuc/5-tuong-lien-quan-dieu-linh-day-le-tot-nhat-mua-s2-2025-11904.html'],
vn_split26:['5 ตัวแยกดันชั้นนำ (mytour)','2026','https://mytour.vn/vi/blog/bai-viet/strongbang-xep-hang-5-tuong-day-le-manh-me-nhat-lien-quan-mobile-chinh-phuc-dinh-cao-phep-pha-tru-strong.html'],
vn_tower26:['ตัวดันป้อมไวและแยกดัน (nubagame)','มิ.ย. 2026','https://nubagame.com/bai-viet/tuong-lien-quan-ay-tru/'],
vn_tower26b:['10 ตัวทุบป้อมไวที่สุด (mytour)','2026','https://mytour.vn/vi/blog/bai-viet/top-10-tuong-pha-tru-nhanh-nhat-trong-lien-quan-mobile.html'],
vn_poke25a:['5 ตัวกดเลือดเด่น (cellphones)','มิ.ย. 2025','https://cellphones.com.vn/sforum/tuong-lien-quan-cau-ria-mua-s2-2025'],
vn_poke25b:['ตัวกดเลือดเด่น (hoanghamobile)','มิ.ย. 2025','https://hoanghamobile.com/tin-tuc/tuong-lien-quan-cau-ria/'],
vn_engage25:['5 ตัวเปิดไฟต์เด่น (hoanghamobile)','เม.ย. 2025','https://hoanghamobile.com/tin-tuc/tuong-lien-quan-mo-giao-tranh/'],
vn_meta26:['ฮีโร่ที่ขึ้นมาในเมต้า (cellphones)','ม.ค. 2026','https://cellphones.com.vn/sforum/tuong-lien-quan-len-tier-s4-2025'],
vn_assn25a:['แอสซาซินเด่น S3 2025 (cellphones)','ส.ค. 2025','https://cellphones.com.vn/sforum/sat-thu-lien-quan-s3-2025'],
vn_assn25b:['แอสซาซินเด่น S3 2025 (hoanghamobile)','ส.ค. 2025','https://hoanghamobile.com/tin-tuc/sat-thu-lien-quan-s3-2025/'],
vn_assn26:['แอสซาซินคอมโบเดียวจบ (cellphones)','มี.ค. 2026','https://cellphones.com.vn/sforum/sat-thu-lien-quan-out-vang'],
rework25:['ข่าวรีเมค Gildur','ส.ค. 2025','https://cellphones.com.vn/sforum/remake-gildur-2025']
};
// Counter sources (matchups)
const CSRC={
aovb:['aov-builds (สากล, อังกฤษ)','ต.ค. 2026','https://aov-builds.com/en/counters/'],
vn:['ตารางแก้ทางทุกฮีโร่ (cellphones / hoanghamobile, เวียดนาม)','มี.ค.–ก.ย. 2026','https://hoanghamobile.com/tin-tuc/khac-che-tuong-lien-quan/'],
lqmgg:['lienquanmobile.gg (เวียดนาม)','S3 2026','https://lienquanmobile.gg/'],
vnart:['บทความแก้ทางรายตัว (cellphones / hoanghamobile / fptshop, เวียดนาม)','พ.ย. 2023–2026',''],
one:['ONE Esports ไทย (บทความเมต้าและไกด์)','2024–2025','https://www.oneesports.co.th/arena-of-valor/'],
richman:['Richman ไทย (ไกด์ฮีโร่)','2025',''],
lemon25:['Lemon8 ผู้เล่นไทยแรงก์สูง','ก.ย. 2025',''],
dcard25:['Dcard ผู้เล่นไต้หวัน (傳說對決)','2025',''],
qzadd:['Qzadd (เพจโรมมิ่งไทย 4.4 แสนผู้ติดตาม) · สรุปแก้ทาง Roaming 2026 จากผู้เล่นเม็ดรุ้ง/Immortal/Glorious Ruler','12 ต.ค. 2026','https://www.facebook.com/Qzaddroaming/posts/pfbid02WZh51PuWRN9qcBCwK6rcUdCc3wMbhNCBUqT27iCR7Pa9J8APwNUQSvZxutnyyitjl'],
qzadd_ab:['Qzadd · สรุปแก้ทาง Abyssal Dragon Lane 2026 (เม็ดรุ้ง/Immortal/Glorious Ruler)','5 ก.ย. 2026','https://www.facebook.com/Qzaddroaming/posts/pfbid03cgFn33D2br2xJkLd9FxkeXLF1euEjRxhWch7EbnH45V57c6uaDNR4nmkWpMEZ8jl'],
qzadd_mid:['Qzadd · สรุปแก้ทาง Midlane 2026 (30 ตัว)','27 ส.ค. 2026','https://www.facebook.com/Qzaddroaming/posts/pfbid02aWVByz5MMg9kv6nqLhtDb9qMpng1i6UG3Zr1itxbP3YMVj3kvofhEM44PxHYwzeyl'],
qzadd_jg:['Qzadd · สรุปแก้ทาง Jungle 2026','21 ก.ค. 2026','https://www.facebook.com/Qzaddroaming/posts/pfbid02crnFiuz5xdsX6QjbgqE4WLxeGJp58ky22YmDite7bswZ8RtCGNUH5bdXzXasNfA1l'],
qzadd_ds:['Qzadd · สรุปแก้ทาง Dark Slayer Lane 2026','11 ก.ค. 2026','https://www.facebook.com/Qzaddroaming/posts/pfbid02SYRFLVnuRVcQzTcQ7np3TCVT9bLJNTFSLRe22vrtTgU5NuecusAfoPrr9hrRRPjxl'],
};
const PUB={
aovb:['aov-builds · ไกด์รายตัว (สากล, ต.ค. 2026)','https://aov-builds.com/en/heroes/'],
fin:['finhay · ไกด์ 2026 (เวียดนาม)','https://www.finhay.com.vn/'],
fpt:['fptshop · ไกด์/บทแก้ทาง (เวียดนาม)','https://fptshop.com.vn/tin-tuc/giai-tri'],
hhm:['hoanghamobile · ไกด์/บทแก้ทาง (เวียดนาม)','https://hoanghamobile.com/tin-tuc/'],
farm:['hoanghamobile/cellphones · รายชื่อตัวฟาร์มรอท้ายเกม (เวียดนาม)','https://hoanghamobile.com/tin-tuc/'],
cps:['cellphones Sforum · ไกด์/เทียบตัว (เวียดนาม)','https://cellphones.com.vn/sforum/'],
ddv:['didongviet · ไกด์ (เวียดนาม)','https://didongviet.vn/dchannel/'],
myt:['mytour · ไกด์ (เวียดนาม)','https://mytour.vn/'],
voh:['VOH · ไกด์ (เวียดนาม)','https://voh.com.vn/game/'],
vts:['viettelstore · ไกด์ (เวียดนาม)','https://viettelstore.vn/tin-tuc/'],
'1v9':['1v9.gg · บทจัดอันดับฮีโร่ (สากล, 2025)','https://1v9.gg/blog/arena-of-valor-aov-best-heroes-ranked'],
csg:['commonsensegamer · tier list (สากล, 2026)','https://commonsensegamer.com/arena-of-valor-tier-list-hcja/'],
bsEN:['BlueStacks · tier list (สากล, 2025)','https://www.bluestacks.com/blog/game-guides/arena-of-valor/aov-tier-list-en.html'],
bsTH:['BlueStacks ไทย · tier list (2025)','https://www.bluestacks.com/th/blog/game-guides/arena-of-valor/aovr-tier-list-th.html'],
user:['คำแก้จากคุณ (ผู้เล่น)','']
};
const CS_SHORT={aovb:'สากล',vn:'VN ตาราง',lqmgg:'VN lqm.gg',vnart:'VN บทความ',one:'ONE ไทย',richman:'Richman',lemon25:'Lemon8',dcard25:'Dcard TW',qzadd:'Qzadd ไทย'};
const CT=new Map(), CBY=new Map(), CVS=new Map();
(RAW.ctr||[]).forEach(r=>{const [c,t]=r;const o={c,t,s:r[2],src:r[3],g:r[4],pro:r[5],rev:r[6]};CT.set(c*256+t,o);
  if(!CBY.has(t))CBY.set(t,[]);CBY.get(t).push(o);if(!CVS.has(c))CVS.set(c,[]);CVS.get(c).push(o);});
const proTxt=p=>p?`ผลแข่งโปร${p[2]?'เลนเดียวกัน':'ทุกคู่'} ${p[1]}/${p[0]} เกม (${Math.round(p[1]/p[0]*100)}%)`:'';
const $=id=>document.getElementById(id);

// Build style buttons
$('styleBtns').innerHTML=ORDER.map(k=>`<button type="button" class="sbtn" data-s="${k}" aria-pressed="false" style="--c:var(--${k})"><b>${STY[k].name}</b></button>`).join('');
$('roleChips').innerHTML='<button class="rchip" aria-pressed="true" data-r="">ทั้งหมด</button>'+Object.entries(ROLE_TH).map(([k,v])=>`<button class="rchip" aria-pressed="false" data-r="${k}">${v.replace(' (ยิงไกล)','')}</button>`).join('');
$('lane').innerHTML='<option value="">ทุกเลน</option>'+['DS_Lane','Mid','Jungle','Dragon_Lane','Roam'].map(k=>`<option value="${k}">${LANE_TH[k]}</option>`).join('');

function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function filtered(){
  const q=state.q.trim().toLowerCase();
  let list=H.filter(h=>{
    if(q && !h.name.toLowerCase().includes(q) && !h.th.toLowerCase().includes(q)) return false;
    if(state.role && h.role!==state.role && h.role2!==state.role) return false;
    if(state.lane && h.lane!==state.lane) return false;
    if(state.phase && !h.tm.peaks.includes(state.phase)) return false;
    if(state.sel.size){
      const ks=[...state.sel];
      if(state.mode==='all' ? !ks.every(k=>has(h,k)) : !ks.some(k=>has(h,k))) return false;
    }
    return true;
  });
  const s=state.sort;
  list.sort((a,b)=> s==='tier' ? (TIER_RANK[a.tier]-TIER_RANK[b.tier]) || a.th.localeCompare(b.th)
    : s==='wr' ? (b.wr-a.wr) || a.th.localeCompare(b.th)
    : s==='styles' ? (Object.values(b.styles).reduce((x,y)=>x+y.lv,0)-Object.values(a.styles).reduce((x,y)=>x+y.lv,0)) || a.th.localeCompare(b.th)
    : a.th.localeCompare(b.th));
  return list;
}

function renderGuide(){
  const g=$('guide');
  if(state.sel.size!==1){g.innerHTML='';return;}
  const k=[...state.sel][0], s=STY[k];
  g.innerHTML=`<div class="guide" style="--c:var(--${k})"><h2>${s.name} <small>${s.full}</small></h2>
    <div><h3>วิธีเล่น</h3><ul>${s.how.map(x=>`<li>${x}</li>`).join('')}</ul></div>
    <div><h3>วิธีแก้ทาง เมื่อศัตรูเล่นสายนี้</h3><ul>${s.counter.map(x=>`<li>${x}</li>`).join('')}</ul></div></div>`;
}

function card(h){
  return `<button type="button" class="hbtn" data-h="${esc(h.name)}" aria-pressed="${h.name===curHero}" title="${esc(h.th)}"><img src="${h.img}" alt="" loading="lazy" width="44" height="44"><span>${esc(h.th)}</span></button>`;
}

let curHero='',pane=0;
function render(){
  document.querySelectorAll('.sbtn').forEach(b=>b.setAttribute('aria-pressed',state.sel.has(b.dataset.s)));
  $('modeBox').hidden=state.sel.size<2;
  document.querySelectorAll('#modeBox button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===state.mode));
  const list=filtered();
  $('count').textContent=list.length;
  const names=[...state.sel].map(k=>STY[k].name);
  $('countLabel').textContent = names.length ? `ฮีโร่ที่เล่นสาย ${names.join(state.mode==='all'?' + ':' หรือ ')} ได้` : 'ฮีโร่ทั้งหมด';
  renderGuide();
  $('grid').innerHTML = list.length ? list.map(card).join('') :
    `<div class="empty">ไม่มีฮีโร่ที่ตรงเงื่อนไข ลองเลือก “สายใดก็ได้” หรือล้างตัวกรอง</div>`;
}

// Detail sheet
function open(name,fromUser){
  const h=byName[name]; if(!h) return; curHero=h.name;
  const role=[ROLE_TH[h.role]||h.role, h.role2?(ROLE_TH[h.role2]||h.role2):''].filter(Boolean).join(' / ');
const fit=ORDER.map(k=>{
    const st=h.styles[k];
    return `<div class="fitrow ${st?'':'no'}" style="--c:var(--${k})"><b>${STY[k].name}</b><div class="tx">${st?`<span class="lv l${st.lv}">${st.lv===2?'จุดเด่น':'เล่นได้'}</span><p>${esc(st.why)}</p><p class="evs">${evTxt(st)}</p>`:(h.ment&&h.ment[k]?`<p>ไม่ใช่วิธีเล่นหลัก มีแหล่งพูดถึงแค่ผ่าน ๆ (${[...new Set(h.ment[k].map(srcName))].join(' · ')}) จึงไม่นับ</p>`:'<p>ไม่มีแหล่งที่ระบุว่าเป็นวิธีเล่นของตัวนี้</p>')}</div></div>`;
  }).join('');
  const chips=arr=>arr.length?`<div class="chips">${arr.map(n=>`<button type="button" class="chip" data-h="${esc(n)}">${esc(n)}</button>`).join('')}</div>`:'<p class="note">ข้อมูลการแข่งยังไม่พอ</p>';
  const PN=['สถานะและสกิล','สายการเล่น','แพ้/ชนะทาง','ที่มา'];
  $('hdetail').innerHTML=`<div class="panel">
    <div class="hhead"><img src="${h.img}" alt="" width="64" height="64"><div><h2 id="dName">${esc(h.th)}</h2>
      <div class="tags"><span class="tag">${role}</span><span class="tag">${h.range==='Ranged'?'ระยะไกล':'ระยะประชิด'}</span><span class="tag">${LANE_TH[h.lane]||h.lane}</span>${h.th!==h.name?`<span class="tag">${esc(h.name)}</span>`:''}</div>
      <div class="tags"><span class="tag t2">Tier ${esc(h.tier)}</span><span class="tag t2">ชนะ ${h.wr}%</span><span class="tag t2">เลือก ${h.pick}%</span><span class="tag t2">แบน ${h.ban}%</span></div></div></div>
    <div class="stabs" id="stabs" role="tablist">${PN.map((t,i)=>`<button type="button" data-p="${i}" aria-pressed="${i===pane}">${t}</button>`).join('')}</div>
    <div class="pane" data-p="0"${pane===0?'':' hidden'}><rov-db view="hero" hero="${esc(h.name)}"></rov-db></div>
    <div class="pane" data-p="1"${pane===1?'':' hidden'}>
      <div class="sec"><h3>เล่นสายไหนได้ <small>นับจากไกด์ผู้เล่น ${h.psrc.length} สำนัก</small></h3>${Object.keys(h.styles).length?'':'<p class="note">ยังหาแหล่งที่ระบุสายการเล่นของตัวนี้ได้ไม่พอ</p>'}<div class="fit">${fit}</div></div>
      <div class="sec"><h3>ช่วงเกมที่เก่ง <small>${peakTxt(h)?'เก่ง'+peakTxt(h):'แหล่งยังไม่ชี้ชัด'}${h.tm.weaks.length?' · อ่อน'+h.tm.weaks.map(k=>({E:'ต้นเกม',M:'กลางเกม',L:'ท้ายเกม'})[k]).join(', '):''}</small></h3>${timing(h)}</div>
      <div class="sec"><h3>เล่นเลนไหนในการแข่ง <small>จำนวนเกมที่ถูกเลือก 2024–2026</small></h3>${lanes(h)}</div>
      <div class="sec"><h3>คู่หูที่ดี <small>ตามสถิติการแข่ง</small></h3>${chips(h.duo)}</div></div>
    <div class="pane" data-p="2"${pane===2?'':' hidden'}>
      <div class="sec"><h3>แพ้ทาง <small>ตัวที่แก้ทางตัวนี้ · 9 แหล่ง + ผลแข่งโปร</small></h3>${ctrList(CBY.get(IDX.get(h.name))||[],'c',h)}${ctrExtra(h,'c')}</div>
      <div class="sec"><h3>ชนะทาง <small>ตัวที่ตัวนี้แก้ทางได้</small></h3>${ctrList(CVS.get(IDX.get(h.name))||[],'t',h)}${ctrExtra(h,'t')}</div>
      <p class="note">ตัวเลขทางขวาคือจำนวนแหล่งที่ระบุตรงกัน ยิ่งมากยิ่งน่าเชื่อ ถ้าแหล่งใดบอกกลับกัน (ว่าฝั่งนี้แพ้) คะแนนจะถูกหัก ผลแข่งโปร 4,208 เกมใช้ยืนยันหรือหักล้าง ไม่ใช้เดี่ยว ๆ ยกเว้นคู่ที่ชนะชัดในเลนเดียวกันอย่างน้อย 12 เกม</p>
</div>
    <div class="pane" data-p="3"${pane===3?'':' hidden'}>
      <div class="sec"><h3>แหล่งข้อมูลของฮีโร่ตัวนี้</h3><ul class="srcs">${h.psrc.map(p=>PUB[p]?`<li>${PUB[p][1]?`<a href="${p==='aovb'?'https://aov-builds.com/en/heroes/'+h.name.toLowerCase().replace(/[^a-z]/g,'')+'/':PUB[p][1]}" target="_blank" rel="noopener">${PUB[p][0]}</a>`:PUB[p][0]}</li>`:'').join('')}${[...new Set(Object.values(h.styles).flatMap(s=>s.ev))].map(k=>SRC[k]?`<li><a href="${SRC[k][2]}" target="_blank" rel="noopener">${SRC[k][0]}</a> · ${SRC[k][1]}</li>`:'').join('')}</ul></div></div>
  </div>`;
  document.querySelectorAll('#grid .hbtn').forEach(b=>b.setAttribute('aria-pressed',b.dataset.h===h.name));
  if(fromUser&&innerWidth<760)$('hdetail').scrollIntoView({behavior:'smooth',block:'start'});
}
function ctrExtra(h,key){
  const inList=new Set(); (key==='c'?CBY:CVS).get(IDX.get(h.name))?.forEach(o=>inList.add(H[o[key]].name));
  const out=[];
  for(const [k,W] of Object.entries(RAW.why||{})){ if(!W.s) continue; const [c,t]=k.split('>'); const other=key==='c'?(t===h.name?c:null):(c===h.name?t:null); if(!other||inList.has(other)||!IDX.has(other)) continue; if(W.s.every(r=>r.s.includes('ภาพรวม'))) continue; out.push([other,W]); }
  if(!out.length) return '';
  return `<details class="note xtra"><summary>เสริมจากบทความ (แหล่งเดียว · ยังไม่ผ่านเกณฑ์หลายแหล่ง) · ${out.length}</summary><div class="cl">${out.map(([n,W])=>{const x=H[IDX.get(n)];return `<div class="crw"><button type="button" class="cr chip weak1" data-h="${esc(x.name)}"><img src="${x.img}" alt=""><div class="t"><b>${esc(x.th)}</b><span>${W.s.map(r=>esc(r.s)).filter((v,i,a)=>a.indexOf(v)===i).join(' · ')}</span></div><div class="n">บทความ</div></button><details class="why"><summary>แพ้ชนะเพราะอะไร · วิธีเล่น</summary>${W.s.map(r=>`<div class="wb src"><span class="tag">จากบทความ · ${esc(r.s)}</span><p>${esc(r.w)}</p><p class="how"><b>วิธีเล่น:</b> ${esc(r.h)}</p></div>`).join('')}</details></div>`}).join('')}</div></details>`;
}
function ctrList(arr,key,cur){
  if(!arr.length) return '<p class="note">ยังไม่พบแหล่งที่ระบุคู่นี้มากพอ</p>';
  const L=[...arr].sort((a,b)=>b.s-a.s||b.src.length-a.src.length).slice(0,key==='c'?8:8);
  return `<div class="cl">${L.map(o=>{const x=H[o[key]];const n=o.src.length;
    const ps=o.pro?`<span class="${o.pro[1]/o.pro[0]>=.53?'pw':o.pro[1]/o.pro[0]<=.47?'pl':''}">${proTxt(o.pro)}</span>`:'';
    const rv=o.rev.length?`<span class="pl">มีแหล่งที่บอกกลับกัน: ${o.rev.map(k=>CS_SHORT[k]||k).join(', ')}</span>`:'';
    const wk=key==='c'?x.name+'>'+cur.name:cur.name+'>'+x.name, W=(RAW.why||{})[wk];
    let wh='';
    if(W){
      const sp=(W.s||[]).map(r=>`<div class="wb src"><span class="tag">จากบทความ · ${esc(r.s)}</span><p>${esc(r.w)}</p><p class="how"><b>วิธีเล่น:</b> ${esc(r.h)}</p></div>`).join('');
      const op=W.o?`<div class="wb op"><span class="tag">${W.o.t==='c'?'ความเห็น Claude (วิเคราะห์จากสกิล)':'สรุปอัตโนมัติจากสกิล (ความเห็น Claude ไม่ใช่คำพูดโปร)'}</span><p>${esc(W.o.w)}</p><p class="how"><b>วิธีเล่น:</b> ${esc(W.o.h)}</p></div>`:'';
      wh=`<details class="why"><summary>แพ้ชนะเพราะอะไร · วิธีเล่น${W.s?` <em>(${W.s.length} บทความ)</em>`:''}</summary>${sp}${op}</details>`;
    }
    return `<div class="crw"><button type="button" class="cr chip ${n<2?'weak1':''}" data-h="${esc(x.name)}"><img src="${x.img}" alt=""><div class="t"><b>${esc(x.th)}</b><span>${n?o.src.map(k=>CS_SHORT[k]||k).join(' · '):'ผลแข่งโปรอย่างเดียว'}</span>${ps}${rv}</div><div class="n">${n?n+' แหล่ง':'โปร'}<small>คะแนน ${o.s.toFixed(1)}</small></div></button>${wh}</div>`;}).join('')}</div>`;
}
function peakTxt(h){const p=h.tm.peaks;if(!p.length)return '';if(p.length===3)return 'ทุกช่วงเกม';const N={E:'ต้น',M:'กลาง',L:'ท้าย'};return p.map(k=>N[k]).join('–')+'เกม';}
function srcName(code){const p=pubOf(code);return PUB[p]?PUB[p][0].split(' · ')[0]:code;}
function pubOf(c){for(const p of Object.keys(PUB))if(c.startsWith(p))return p;return c;}
function evTxt(st){const c=[...new Set(st.core.map(x=>srcName(x[0])))],m=[...new Set(st.minor.map(x=>srcName(x[0])))].filter(x=>!c.includes(x)),e=st.ev.map(k=>SRC[k]?SRC[k][0]:k);
  const parts=[];if(c.length||e.length)parts.push('ระบุเป็นวิธีเล่นหลัก: '+[...c,...e].join(' · '));if(m.length)parts.push('กล่าวถึงเป็นทางเลือก: '+m.join(' · '));return parts.join('<br>');}
function timing(h){
  const t=h.tm,PH={E:'ต้นเกม',M:'กลางเกม',L:'ท้ายเกม'},V={'+':'แรง','0':'กลาง ๆ','-':'อ่อน'};
  const box=k=>{const d=t.ph[k],n=d.pos+d.avg+d.neg;let verdict,cls='';
    if(!n){verdict='ไม่มีแหล่งระบุ';cls='na';}
    else if(d.net>=1){verdict=d.neg?'ค่อนข้างแรง':'แรง';cls='pk';}
    else if(d.net<=-1){verdict=d.pos?'ค่อนข้างอ่อน':'อ่อน';cls='wk';}
    else if(d.pos&&d.neg){verdict='แหล่งเห็นต่างกัน';}
    else verdict='กลาง ๆ';
    const w=n?Math.round(d.pos/n*100):0,b=n?Math.round(d.neg/n*100):0;
    return `<div class="tm ${cls}"><span>${PH[k]}</span><b>${verdict}</b><div class="tmbar2">${n?`<u class="g" style="width:${w}%"></u><u class="r" style="width:${b}%;left:${100-b}%"></u>`:''}</div><i>${n?`แรง ${d.pos} · กลาง ${d.avg} · อ่อน ${d.neg} แหล่ง`:'–'}</i></div>`;};
  const rows=['E','M','L'].flatMap(k=>t.ph[k].by.map(([c,v,dt])=>`<li><b>${PH[k]} ${V[v]}</b> · ${esc(srcName(c))}${dt?' ('+esc(dt)+')':''}</li>`));
  const notes=t.notes.length?`<ul class="srcs" style="margin-top:6px">${[...new Map(t.notes.map(n=>[n[1],n])).values()].map(([c,n,dt])=>`<li>${esc(n)} <span style="color:var(--dim)">— ${esc(srcName(c))}</span></li>`).join('')}</ul>`:'';
  const pro=t.pro?`<details class="note" style="margin-top:6px"><summary>ข้อมูลเสริม: อัตราชนะในการแข่งโปรแยกตามความยาวเกม</summary><p style="margin-top:6px">${['E','M','L'].map(k=>{const d=t.pro[k];return d&&d.g?`${PH[k]} ${d.wr}% (${d.g} เกม)`:'';}).filter(Boolean).join(' · ')}</p><p>ตัวเลขนี้ขึ้นกับทั้งทีม ไม่ได้บอกพลังของฮีโร่ตัวเดียว จึงไม่ได้ใช้ตัดสินช่วงเกมแล้ว</p></details>`:'';
  return `<div class="tmrow">${['E','M','L'].map(box).join('')}</div>${notes}${rows.length?`<details class="note" style="margin-top:6px"><summary>ดูว่าแต่ละแหล่งว่าไว้อย่างไร (${rows.length})</summary><ul class="srcs" style="margin-top:6px">${rows.join('')}</ul></details>`:'<p class="note">ยังไม่พบแหล่งที่ระบุช่วงเกมของฮีโร่ตัวนี้อย่างชัดเจน</p>'}${pro}`;
}
function lanes(h){
  const L={ds_lane:'เลน Dark Slayer',jungle:'ป่า',mid:'เลนกลาง',dragon_lane:'เลนมังกร',roam:'โรมมิ่ง'};
  const arr=Object.entries(h.lanepicks||{}).filter(([,v])=>v>=3).sort((a,b)=>b[1]-a[1]);
  return arr.length?`<div class="lanes">${arr.map(([k,v])=>`<span class="lane">${L[k]} <b>${v}</b></span>`).join('')}</div>`:'<p class="note">แทบไม่ถูกใช้ในการแข่ง</p>';
}


// Events
$('styleBtns').addEventListener('click',e=>{const b=e.target.closest('.sbtn'); if(!b) return; const k=b.dataset.s; state.sel.has(k)?state.sel.delete(k):state.sel.add(k); render();});
$('modeBox').addEventListener('click',e=>{const b=e.target.closest('button'); if(!b) return; state.mode=b.dataset.mode; render();});
$('q').addEventListener('input',e=>{state.q=e.target.value; render();});
$('roleChips').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.role=b.dataset.r;document.querySelectorAll('#roleChips button').forEach(x=>x.setAttribute('aria-pressed',x===b));render();});
$('lane').addEventListener('change',e=>{state.lane=e.target.value; render();});
$('sort').addEventListener('change',e=>{state.sort=e.target.value; render();});
$('strict').addEventListener('change',e=>{state.strict=e.target.checked; render();});
$('phase').addEventListener('change',e=>{state.phase=e.target.value; render();});
$('reset').addEventListener('click',()=>{state.sel.clear();state.mode='all';state.phase='';$('phase').value='';state.strict=false;$('strict').checked=false;state.q='';state.role='';state.lane='';$('q').value='';document.querySelectorAll('#roleChips button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.r===''));$('lane').value='';render();});
$('grid').addEventListener('click',e=>{const c=e.target.closest('.hbtn'); if(c) open(c.dataset.h,true);});
$('hdetail').addEventListener('click',e=>{ const sb=e.target.closest('#stabs button'); if(sb){ pane=+sb.dataset.p; $('hdetail').querySelectorAll('#stabs button').forEach(x=>x.setAttribute('aria-pressed',x===sb)); $('hdetail').querySelectorAll('.pane').forEach(p=>p.hidden=+p.dataset.p!==pane); return; }
  const c=e.target.closest('.chip'); if(c&&c.dataset.h) open(c.dataset.h,true);});

// ===================== Draft simulator =====================
const LN=['เลน DS','ป่า','เลนกลาง','เลนมังกร','โรม'];
const LNF=['เลน Dark Slayer','ป่า','เลนกลาง','เลนมังกร','โรมมิ่ง'];
const PH={E:'ต้นเกม',M:'กลางเกม',L:'ท้ายเกม'};
// [action 0=ban 1=pick, side 0=blue 1=red]
const STEPS=[[0,0],[0,1],[0,0],[0,1],[1,0],[1,1],[1,1],[1,0],[1,0],[1,1],[0,1],[0,0],[0,1],[0,0],[1,1],[1,0],[1,0],[1,1]];
const SYN=new Map();
RAW.syn.forEach(([a,b,v,g])=>{SYN.set(a*256+b,[v,g]);SYN.set(b*256+a,[v,g]);});
const conf=g=>Math.min(1,g/25);
// matchup from merged multi-source counters: a counters b -> +, b counters a -> -
const adv=(a,b)=>{const o=CT.get(a*256+b),q=CT.get(b*256+a);let v=0,n=0;if(o){v+=o.s*2;n=Math.max(n,o.src.length);}if(q){v-=q.s*2;n=Math.max(n,q.src.length);}return {v,n,has:!!(o||q)};};
const syn=(a,b)=>{const r=SYN.get(a*256+b);return r?[r[0]*conf(r[1]),r[0],r[1]]:[0,0,0];};
const IDX=new Map(H.map((h,i)=>[h.name,i]));
const COUNTER_STYLE={P:['T','K'],T:['S','P'],K:['T'],S:['K','T']};
const COUNTER_TXT={P:'ศัตรูเน้นยิงไกลกดเลือด ให้เลือกตัวบุกถึงตัวเร็วและเปิดไฟต์ก่อนเลือดหมด',T:'ศัตรูเน้นไฟต์ใหญ่ ให้เลือกตัวแยกดันหรือกดเลือดก่อน ไม่ให้เขาได้ไฟต์ 5 ต่อ 5 ตอนอัลติพร้อม',K:'ศัตรูเน้นซุ่มเก็บทีละคน ให้เลือกตัวทีมไฟต์และเดินเป็นกลุ่ม',S:'ศัตรูเน้นแยกดัน ให้มีตัวจับฆ่าไว้ดักตัวที่ดันเลน และบังคับไฟต์ 5 ต่อ 4'};

const DS={bo:5,game:1,our:0,gbp:true,steps:[],used:{us:[],them:[]},hist:[]};
const team=side=>side===DS.our?'us':'them';
const isUlt=()=>DS.bo===7&&DS.game===7;
function cur(){
  const b=[[],[]],p=[[],[]];
  DS.steps.forEach((h,i)=>{const [a,s]=STEPS[i];(a?p:b)[s].push(h);});
  return {b,p};
}
const taken=()=>new Set(DS.steps);
function globalBlocked(i,side){return DS.gbp&&!isUlt()&&DS.used[team(side)].includes(i);}
function canAct(i){
  if(DS.steps.length>=STEPS.length) return [false,'ดราฟต์เกมนี้ครบแล้ว'];
  if(taken().has(i)) return [false,'ถูกแบนหรือเลือกไปแล้วในเกมนี้'];
  const [a,s]=STEPS[DS.steps.length];
  if(a===1&&globalBlocked(i,s)) return [false,'Global Ban Pick: ทีมนี้ใช้ไปแล้วในซีรีส์'];
  return [true,''];
}
// best lane assignment (max sum log prob)
function perms(n){const r=[];const a=[...Array(5).keys()];(function rec(pre,rest){if(pre.length===n){r.push(pre);return;}rest.forEach((x,k)=>rec([...pre,x],rest.filter((_,j)=>j!==k)));})([],a);return r;}
const PERM=[0,1,2,3,4,5].map(perms);
function assign(list){
  if(!list.length) return {lanes:[],score:0};
  let best=null,bs=-1e9;
  for(const p of PERM[list.length]){let s=0;for(let k=0;k<list.length;k++)s+=Math.log(H[list[k]].lp[p[k]]+1e-3);if(s>bs){bs=s;best=p;}}
  return {lanes:best,score:bs};
}
function openLanes(list){const a=assign(list);return [0,1,2,3,4].filter(l=>!a.lanes.includes(l));}
function laneFit(list,h){
  const a0=assign(list),a1=assign([...list,h]);
  const p=Math.exp(a1.score-a0.score);
  return {p,lane:a1.lanes[a1.lanes.length-1]};
}
function profile(list){
  const st={P:0,T:0,K:0,S:0},tm={E:0,M:0,L:0};
  list.forEach(i=>{const h=H[i];ORDER.forEach(k=>{if(h.styles[k])st[k]+=h.styles[k].lv;});h.tm.peaks.forEach(p=>tm[p]++);});
  return {st,tm};
}
function dominant(st){let k=null,v=0;ORDER.forEach(x=>{if(st[x]>v){v=st[x];k=x;}});return v>=4?k:null;}

function scorePick(i,side){
  const {p}=cur(),me=p[side],op=p[1-side],h=H[i],why=[];
  let s=(h.swr-50)*0.5+h.pres*0.04;
  if(h.pres>=40) why.push(['g',`เมต้าแข่ง: ถูกเลือกหรือแบน ${Math.round(h.pres)}%`]);
  let cv=0;op.forEach(e=>{const r=adv(i,e);cv+=r.v;if(r.v>0)why.unshift(['g',`แก้ทาง ${H[e].th}${r.n?` (${r.n} แหล่ง)`:' (ผลแข่งโปร)'}`]);else if(r.v<0)why.push(['b',`โดน ${H[e].th} แก้ทาง`]);});
  let sy=0;me.forEach(a=>{const [v,raw,g]=syn(i,a);sy+=v*0.7;if(g>=6&&raw>=3)why.push(['g',`เข้าคู่ ${H[a].th} +${raw.toFixed(1)}%`]);});
  const lf=laneFit(me,i);let ln=0;
  if(lf.p<0.04){ln=-14;why.push(['b','ไม่มีเลนว่างที่ตัวนี้เล่น']);}
  else{ln=Math.min(1,lf.p*1.4)*6;why.push(['',`ลง${LNF[lf.lane]}`]);}
  let sty=0;const mp=profile(me).st,opp=profile(op);
  if(me.length>=2&&mp.T<2&&h.styles.T&&h.styles.T.lv===2){sty+=1.5;why.push(['g','ทีมยังขาดตัวทีมไฟต์']);}
  const d=dominant(opp.st);
  if(d&&COUNTER_STYLE[d].some(k=>h.styles[k]&&h.styles[k].lv===2)){sty+=1.5;why.push(['g',`แก้สาย${STY[d].name}ของศัตรู`]);}
  let tmv=0;
  if(opp.tm.L>=2&&h.tm.peaks.includes('E')){tmv+=1;why.push(['g','ศัตรูเก่งท้ายเกม ตัวนี้เก่งต้นเกม']);}
  if(opp.tm.E>=2&&h.tm.weaks.includes('E')){tmv-=1;why.push(['b','อ่อนต้นเกม แต่ศัตรูเก่งต้นเกม']);}
  return {i,s:s+cv+sy+ln+sty+tmv,why};
}
function scoreBan(i,side){
  // side bans a hero the opponent (1-side) could pick
  const {p}=cur(),me=p[side],op=p[1-side],h=H[i],why=[];
  let s=h.pres*0.08+(h.swr-50)*0.5;
  if(h.pres>=40) why.push(['g',`ถูกเลือกหรือแบน ${Math.round(h.pres)}% ในแข่ง`]);
  if(h.swr>=53&&h.games>=40) why.push(['g',`อัตราชนะแข่ง ${h.swr.toFixed(1)}%`]);
  let th=0;me.forEach(x=>{const r=adv(i,x);th+=Math.max(0,r.v);if(r.v>0)why.unshift(['b',`แก้ทาง ${H[x].th} ของเรา${r.n?` (${r.n} แหล่ง)`:''}`]);});
  let sy=0;op.forEach(y=>{const [v,raw,g]=syn(i,y);sy+=v*0.7;if(g>=6&&raw>=3)why.push(['b',`เข้าคู่ ${H[y].th} ของศัตรู`]);});
  let ln=0;if(op.length){const lf=laneFit(op,i);if(lf.p<0.04)ln=-8;else{ln=Math.min(1,lf.p*1.4)*3;why.push(['',`ศัตรูยังว่าง${LNF[lf.lane]}`]);}}
  return {i,s:s+th+sy+ln,why};
}
function recommend(){
  if(DS.steps.length>=STEPS.length) return [];
  const [a,s]=STEPS[DS.steps.length];const tk=taken();const out=[];
  H.forEach((h,i)=>{
    if(tk.has(i)) return;
    if(a===1){ if(globalBlocked(i,s)) return; out.push(scorePick(i,s)); }
    else { if(globalBlocked(i,1-s)) return; out.push(scoreBan(i,s)); }
  });
  return out.sort((x,y)=>y.s-x.s).slice(0,6);
}
function counters(){
  const {p}=cur(),us=p[DS.our],them=p[1-DS.our],tk=taken(),res=[];
  them.forEach(e=>{
    const list=[];
    (CBY.get(e)||[]).forEach(o=>{const i=o.c;if(tk.has(i)||globalBlocked(i,DS.our))return;list.push({i,s:o.s,n:o.src.length,fit:us.length<5&&laneFit(us,i).p>=0.04});});
    list.sort((x,y)=>(y.fit-x.fit)||(y.s-x.s)||(y.n-x.n));
    res.push({e,list:list.slice(0,5)});
  });
  return res;
}

const $$=id=>document.getElementById(id);
const img=i=>H[i].img;
function teamPanel(side){
  const {b,p}=cur(),nxt=DS.steps.length,stp=STEPS[nxt]||[];
  const isUs=side===DS.our,col=side===0?'var(--T)':'var(--bad)';
  const a=assign(p[side]);
  const slot=(h,ban,k)=>{const isCur=stp[0]===(ban?0:1)&&stp[1]===side&&k===(ban?b:p)[side].length;
    return `<div class="slot ${ban?'ban':''} ${h!=null?'filled':''} ${isCur?'cur':''}"><div class="im">${h!=null?`<img src="${img(h)}" alt="${esc(H[h].th)}">`:''}</div><small>${h!=null?esc(H[h].th):(ban?'แบน':'เลือก')}</small></div>`;};
  const bans=[0,1,2,3].map(k=>slot(b[side][k],true,k)).join('');
  const picks=[0,1,2,3,4].map(k=>{let s=slot(p[side][k],false,k);if(p[side][k]!=null)s=s.replace(`<small>${esc(H[p[side][k]].th)}</small>`,`<small>${esc(H[p[side][k]].th)}<br>${LN[a.lanes[k]]}</small>`);return s;}).join('');
  const pr=profile(p[side]);
  const mx=Math.max(4,...ORDER.map(k=>pr.st[k]));
  return `<div class="team" style="--tc:${col}">
    <h3>${isUs?'ทีมเรา':'ทีมศัตรู'} · ฝั่ง${side===0?'น้ำเงิน':'แดง'}<small>${DS.gbp&&!isUlt()?`ใช้ไปแล้วในซีรีส์ ${DS.used[team(side)].length} ตัว`:''}</small></h3>
    <div class="slots" aria-label="แบน">${bans}</div>
    <div class="slots" aria-label="เลือก">${picks}</div>
    <div class="prof">${p[side].length?`<div class="bars">${ORDER.map(k=>`<span class="bar" style="--c:var(--${k})">${STY[k].name}<i style="width:${Math.round(pr.st[k]/mx*48)}px"></i>${pr.st[k]}</span>`).join('')}</div>
      <div>ช่วงที่เก่ง: ต้นเกม ${pr.tm.E} · กลางเกม ${pr.tm.M} · ท้ายเกม ${pr.tm.L} ตัว${p[side].length<5?` · ยังว่าง: ${openLanes(p[side]).map(l=>LNF[l]).join(', ')}`:''}</div>`:'<div>ยังไม่ได้เลือกฮีโร่</div>'}</div>
  </div>`;
}
function renderDraft(){
  const n=DS.steps.length,done=n>=STEPS.length;
  $$('dGame').textContent=`เกม ${DS.game} / Bo${DS.bo}${isUlt()?' · เกมตัดสิน: รีเซ็ต Global Ban':''}`;
  $$('dBo').disabled=$$('dGbp').disabled=DS.game>1||n>0;
  $$('dNext').disabled=!done||DS.game>=DS.bo;
  $$('dUndo').disabled=n===0;
  let bc=[0,0],pc=[0,0];
  const pills=STEPS.map(([a,s],i)=>{const t=a?(++pc[s]):(++bc[s]);return `<span class="pill ${s?'r':'b'} ${i<n?'done':''} ${i===n?'cur':''}">${s?'แดง':'น้ำเงิน'} ${a?'เลือก':'แบน'} ${t}</span>`;}).join('');
  let now='ดราฟต์ครบแล้ว';
  if(!done){const [a,s]=STEPS[n];const cnt=STEPS.slice(0,n+1).filter(x=>x[0]===a&&x[1]===s).length;
    now=`ตาของฝั่ง${s?'แดง':'น้ำเงิน'} (${s===DS.our?'ทีมเรา':'ทีมศัตรู'}) · ${a?'เลือก':'แบน'}ครั้งที่ ${cnt} <small>${n<4?'แบนรอบแรก':n<10?'เลือกรอบแรก':n<14?'แบนรอบสอง':'เลือกรอบสอง'}</small>`;}
  $$('dTurn').innerHTML=`<div class="now">${now}</div><div class="pills">${pills}</div>`;
  $$('dBoard').innerHTML=teamPanel(0)+teamPanel(1);
  // recommendations
  if(!done){
    const [a,s]=STEPS[n],us=s===DS.our;
    const recs=recommend();
    $$('dRec').innerHTML=`<h3>${us?(a?'แนะนำตัวเลือกสำหรับทีมเรา':'แนะนำตัวแบนสำหรับทีมเรา'):(a?'คาดการณ์: ศัตรูน่าจะเลือก':'คาดการณ์: ศัตรูน่าจะแบน')}<small>${a?'คิดจากการแก้ทางฮีโร่ที่ศัตรูเลือก (หลายแหล่ง) เข้าคู่กับทีม เลนที่ยังว่าง สายของทีม และช่วงเกม':'คิดจากความนิยมในแข่ง ตัวที่ชนะทางฮีโร่ของฝั่งตรงข้าม และเลนที่ฝั่งตรงข้ามยังว่าง'} · แตะเพื่อใช้</small></h3>`+
      recs.map((r,k)=>`<button type="button" class="rec" data-i="${r.i}"><img src="${img(r.i)}" alt=""><div class="bd"><div class="nm">${k+1}. ${esc(H[r.i].th)} <em>${LNF[H[r.i].lp.indexOf(Math.max(...H[r.i].lp))]}${peakTxt(H[r.i])?' · เก่ง'+peakTxt(H[r.i]):''}</em><span class="sc">${r.s.toFixed(1)}</span></div><div class="why">${r.why.slice(0,5).map(([c,t])=>`<span class="${c}">${esc(t)}</span>`).join('')}</div></div></button>`).join('');
  } else {
    const {p}=cur(),us=p[DS.our],th=p[1-DS.our];
    let cross=0,n2=0;us.forEach(x=>th.forEach(y=>{const r=adv(x,y);if(r.has){cross+=r.v;n2++;}}));
    let su=0,st=0;for(let i=0;i<5;i++)for(let j=i+1;j<5;j++){su+=syn(us[i],us[j])[0];st+=syn(th[i],th[j])[0];}
    const fu=assign(us).score,ft=assign(th).score;
    $$('dRec').innerHTML=`<h3>สรุปดราฟต์เกมนี้<small>บวก = ทีมเราได้เปรียบ · แก้ทางจากหลายแหล่ง ความเข้าคู่และเลนจากสถิติแข่ง</small></h3>
      <div class="dsum"><div><span>แก้ทางรายคู่ (${n2} คู่ที่มีข้อมูล)</span><b>${cross>=0?'+':''}${cross.toFixed(1)}</b></div>
      <div><span>ความเข้าคู่ในทีม เรา / ศัตรู</span><b>${su.toFixed(1)} / ${st.toFixed(1)}</b></div>
      <div><span>ความลงตัวของเลน</span><b>${fu>ft?'ทีมเราดีกว่า':fu<ft?'ศัตรูดีกว่า':'พอกัน'}</b></div></div>
      <div class="advice">${(()=>{const pu=profile(us),pt=profile(th);const d=dominant(pt.st);const big=(x)=>ORDER.reduce((a,k)=>x.st[k]>x.st[a]?k:a,'P');
        return `ทีมเราเน้นสาย<b> ${STY[big(pu)].name}</b> ศัตรูเน้น<b> ${STY[big(pt)].name}</b>. ${d?COUNTER_TXT[d]+'. ':''}${pt.tm.L>pu.tm.L?'ศัตรูมีตัวเก่งท้ายเกมมากกว่า ควรเร่งจบเกมช่วงกลาง':pu.tm.L>pt.tm.L?'ทีมเราเก่งท้ายเกมกว่า เล่นเซฟแล้วรอไฟต์ใหญ่ท้ายเกม':'ช่วงเกมที่เก่งใกล้เคียงกัน'}`;})()}</div>
      ${DS.game<DS.bo?'<p class="note">กด “เกมถัดไป” เพื่อเล่นเกมต่อไป ฮีโร่ที่แต่ละทีมใช้แล้วจะเลือกซ้ำไม่ได้</p>':''}`;
  }
  // counters
  const cs=counters(),opPicks=cur().p[1-DS.our];
  const pt=profile(opPicks),d=dominant(pt.st);
  $$('dCtr').innerHTML=`<h3>ตัวแก้ทางฮีโร่ของศัตรู<small>ฮีโร่ที่ยังเลือกได้ รวมจากหลายแหล่ง ไทย (รวม Qzadd) เวียดนาม ไต้หวัน สากล + ผลแข่งโปร · ตัวเลขคือจำนวนแหล่งที่ระบุตรงกัน · ตัวจางคือไม่มีเลนว่างให้</small></h3>`+
    (d?`<div class="advice">${COUNTER_TXT[d]}</div>`:'')+
    (cs.length?cs.map(c=>`<div class="ctr"><div class="hd"><img src="${img(c.e)}" alt=""><span>แก้ทาง <b>${esc(H[c.e].th)}</b></span></div><div class="mini">${c.list.length?c.list.map(x=>`<button type="button" class="${x.fit?'':'nofit'}" data-i="${x.i}" title="คะแนน ${x.s.toFixed(1)}"><img src="${img(x.i)}" alt="">${esc(H[x.i].th)} <small>${x.n?x.n+' แหล่ง':'โปร'}</small></button>`).join(''):'<span class="note">ตัวแก้ทางที่มีข้อมูลถูกแบนหรือเลือกไปหมดแล้ว</span>'}</div></div>`).join(''):'<p class="note">ยังไม่มีฮีโร่ของศัตรู เมื่อศัตรูเลือกแล้ว ตัวแก้ทางจะขึ้นที่นี่</p>');
  // pool
  const q=$$('dq').value.trim().toLowerCase(),lf=$$('dLane').value;
  $$('dPool').innerHTML=H.map((h,i)=>({h,i})).filter(({h})=>(!q||h.name.toLowerCase().includes(q)||h.th.toLowerCase().includes(q))&&(lf===''||h.lp[+lf]>=0.2)).sort((x,y)=>x.h.th.localeCompare(y.h.th)).map(({h,i})=>{const [ok,why]=canAct(i);return `<button type="button" class="ph" data-i="${i}" ${ok?'':'disabled'} title="${esc(ok?h.th:why)}"><img src="${h.img}" alt="" loading="lazy"><span>${esc(h.th)}</span></button>`;}).join('');
  const usedHtml=(t,label)=>DS.used[t].length?`<div>${label}: <div class="mini">${DS.used[t].map(i=>`<button type="button" tabindex="-1"><img src="${img(i)}" alt="">${esc(H[i].th)}</button>`).join('')}</div></div>`:'';
  $$('dUsed').innerHTML=DS.gbp&&!isUlt()?(usedHtml('us','ทีมเราใช้ไปแล้ว (เลือกซ้ำไม่ได้)')+usedHtml('them','ทีมศัตรูใช้ไปแล้ว (เลือกซ้ำไม่ได้)')):'';
}
function act(i){const [ok]=canAct(i);if(!ok)return;DS.steps.push(i);renderDraft();}
['dRec','dCtr','dPool'].forEach(id=>$$(id).addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(b&&!b.disabled)act(+b.dataset.i);}));
$$('dUndo').addEventListener('click',()=>{DS.steps.pop();renderDraft();});
$$('dReset').addEventListener('click',()=>{DS.steps=[];DS.game=1;DS.used={us:[],them:[]};renderDraft();});
$$('dNext').addEventListener('click',()=>{const {p}=cur();DS.used.us.push(...p[DS.our]);DS.used.them.push(...p[1-DS.our]);DS.game++;DS.steps=[];renderDraft();window.scrollTo({top:0,behavior:'smooth'});});
$$('dBo').addEventListener('change',e=>{DS.bo=+e.target.value;renderDraft();});
$$('dGbp').addEventListener('change',e=>{DS.gbp=e.target.checked;renderDraft();});
$$('dSide').addEventListener('change',e=>{if(DS.steps.length){e.target.value=DS.our;return;}DS.our=+e.target.value;renderDraft();});
$$('dq').addEventListener('input',renderDraft);$$('dLane').addEventListener('change',renderDraft);
const VIEWS={lib:'viewLib',draft:'viewDraft',items:'viewItems',sim:'viewSim',about:'viewAbout'};
function showView(v){document.querySelectorAll('.tabs button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.view===v));
  for(const k in VIEWS)$$(VIEWS[k]).hidden=k!==v;if(v==='draft')renderDraft();try{history.replaceState(null,'','#'+v)}catch(e){}}
document.querySelector('.tabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b)showView(b.dataset.view);});
{const hv=location.hash.slice(1);if(VIEWS[hv]&&hv!=='lib')showView(hv);}
$('ctrSrc').insertAdjacentHTML('beforeend',`<ul class="srcs" style="margin-top:6px">${Object.values(CSRC).map(v=>v[2]?`<li><a href="${v[2]}" target="_blank" rel="noopener">${v[0]}</a> · ${v[1]}</li>`:`<li>${v[0]} · ${v[1]}</li>`).join('')}<li>ผลแข่งโปร RPL, AoG, GCS, APL, AIC 2024–2026 (golfdesu/rov) ใช้ยืนยันหรือหักล้าง</li></ul>`);
render();
open((filtered()[0]||H[0]).name);
window.openHero=n=>{showView('lib');open(n,false);};
})();
