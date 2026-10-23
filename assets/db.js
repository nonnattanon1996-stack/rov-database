
/* <rov-db view="hero|items|sim|about" hero="Name"> — stats, skills, items, damage simulator. Styles live in a shadow root so they never collide with the library/draft app. */
(function(){
const D=window.__DB;
const CSS=window.__DBCSS;
const IM=k=>(k&&D.imgs[k])||'';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=v=>Math.round(v*100)/100;
const ST=['พลังชีวิต','เกราะ','ต้านเวท','พลังโจมตี','ความเร็วเคลื่อนที่'];
const DT={physical:'กายภาพ',magic:'เวท',true:'จริง',none:'—'};
const SCL={ad_pct:'%AD',ap_pct:'%AP',bonus_ad_pct:'%AD เพิ่ม',bonus_ap_pct:'%AP เพิ่ม',own_hp_pct:'% HP ตัวเอง',target_hp_pct:'% HP เป้าหมาย',target_lost_hp_pct:'% HP ที่เป้าหมายเสีย',target_max_hp_pct:'% HP สูงสุดเป้าหมาย',max_hp_pct:'% HP สูงสุด',bonus_hp_pct:'% HP เพิ่ม',lost_hp_pct:'% HP ที่เสีย',heal_ap_pct:'ฮีล %AP',heal_base:'ฮีลฐาน',shield_base:'โล่ฐาน',shield_ad_pct:'โล่ %AD',shield_ap_pct:'โล่ %AP',level_scaling:'เพิ่มตามเลเวล',slow_pct:'ชะลอ %',move_speed_pct:'ความเร็ว %',atk_speed_pct:'ความเร็วโจมตี %',target_current_hp_pct:'% HP ปัจจุบันเป้าหมาย'};
const CAT={attack:'โจมตี',magic:'เวท',defense:'ป้องกัน',movement:'รองเท้า',jungle:'ป่า',support:'ซัพพอร์ต'};
const SL={attack_damage:['พลังโจมตี',''],ability_power:['พลังเวท',''],max_hp:['พลังชีวิต',''],max_hp_pct:['พลังชีวิต','%'],max_mana:['มานา',''],armor:['เกราะ',''],magic_defense:['ต้านเวท',''],attack_speed:['ความเร็วโจมตี','%'],critical_chance:['คริติคอล','%'],cooldown_reduction:['ลดคูลดาวน์','%'],movement_speed_pct:['ความเร็วเคลื่อนที่','%'],movement_speed:['ความเร็วเคลื่อนที่',''],life_steal:['ดูดเลือด','%'],magic_life_steal:['ดูดเลือดเวท','%'],hp_regen_5s:['ฟื้น HP /5วิ',''],mana_regen_5s:['ฟื้นมานา /5วิ',''],ability_power_pct:['พลังเวท','%']};
const AL={attack_damage:'พลังโจมตี',ability_power:'พลังเวท',max_hp:'HP',armor:'เกราะ',magic_defense:'ต้านเวท',critical_chance_pct:'คริ %',critical_damage_pct:'ดาเมจคริ %',attack_speed_pct:'ตีเร็ว %',cooldown_reduction_pct:'ลดคูลดาวน์ %',life_steal_pct:'ดูดเลือด %',magic_life_steal_pct:'ดูดเลือดเวท %',hp_regen_5s:'ฟื้น HP/5วิ',movement_speed_pct:'วิ่งเร็ว %',armor_pierce:'เจาะเกราะ',magic_pierce:'เจาะเวท'};
const HERO=n=>D.heroes.find(h=>h.n===n);
const IT=s=>D.items.find(i=>i.s===s);
const red=d=>d<=0?0:d/(d+600);
const eff=(d,flat,pct)=>{const x=Math.max(0,d-flat);return x-x*pct/100};
const arcTxt=st=>Object.entries(st).map(([k,v])=>`${AL[k]||k} +${v}`).join(' · ');

/* ---------------- hero stats + skills ---------------- */
function heroView(w,name){
  const h=HERO(name);
  if(!h){w.innerHTML='<p class="note">ยังไม่มีข้อมูลสถานะของฮีโร่ตัวนี้</p>';return}
  let lvl=15;const skl={};
  const rng=h.range==='Melee'?'ระยะประชิด':'ระยะไกล';
  w.innerHTML=`<div class="sec"><h3>สถานะตามเลเวล <small>ไม่รวมไอเทมและพลังแฝง</small></h3>
   <div class="lvrow"><label for="lv">เลเวล</label><input type="range" id="lv" min="1" max="15" value="15"><b id="lvn">15</b></div>
   <div class="tiles" id="tiles"></div>
   <p class="note">เลเวล 1: ${h.res!=null?`พลังงาน/มานา ${h.res}`:'ไม่มีแถบพลังงาน'} · ฟื้น HP ${h.hpr??'—'} /5 วิ${h.rr?` · ฟื้นพลังงาน ${h.rr} /5 วิ`:''} · ${rng}</p>
   <details><summary>ตารางทั้ง 15 เลเวล</summary><div class="scroll"><table><thead><tr><th>Lv</th>${ST.map(s=>`<th>${s}</th>`).join('')}</tr></thead><tbody id="ltb">${h.lv.map((r,i)=>`<tr data-l="${i+1}"><td>${i+1}</td>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
   <p class="note">เลเวล 1 และ 15 อ่านจากหน้าสถานะในเกม ส่วนเลเวล 2–14 คำนวณเป็นเส้นตรงระหว่างสองค่านั้น (โต: HP +${fmt(h.g.hp_growth)} · เกราะ +${fmt(h.g.armor_growth)} · ต้านเวท +${fmt(h.g.mdef_growth)} · พลังโจมตี +${fmt(h.g.ad_growth)} ต่อเลเวล)</p></details></div>
   <div class="sec"><h3>สกิล <small>เลือกเลเวลสกิลดูคูลดาวน์และดาเมจ</small></h3><div id="sks"></div></div>`;
  const q=s=>w.querySelector(s);
  const tiles=()=>{const r=h.lv[lvl-1],b=h.lv[0];q('#lvn').textContent=lvl;
    q('#tiles').innerHTML=r.map((v,i)=>`<div class="tile"><small>${ST[i]}</small><b>${v}</b>${lvl>1&&v!==b[i]?`<i>+${v-b[i]}</i>`:''}</div>`).join('');
    for(const tr of w.querySelectorAll('#ltb tr'))tr.className=+tr.dataset.l===lvl?'sel':''};
  q('#lv').oninput=e=>{lvl=+e.target.value;tiles()};tiles();
  const draw=()=>{q('#sks').innerHTML=h.sk.map((s,i)=>skill(s,i)).join('')};
  function skill(s,i){const n=Math.max(s.cd.length,s.dmg.length,s.mana.length,1);const cur=Math.min(skl[i]||n,n)-1;
    const at=a=>a.length?a[Math.min(cur,a.length-1)]:null;
    const sc=Object.entries(s.sc||{}).map(([k,v])=>`<span class="pill">${SCL[k]||k.replace(/_/g,' ')} ${Array.isArray(v)?v.join('/'):v}${/pct/.test(k)&&!Array.isArray(v)?'%':''}</span>`).join('');
    const cd=at(s.cd),mn=at(s.mana),dm=at(s.dmg);
    const tbl=n>1?`<details><summary>ตารางทุกเลเวลสกิล</summary><div class="scroll"><table><thead><tr><th>Lv</th><th>คูลดาวน์ (วิ)</th><th>มานา</th><th>ค่าฐาน</th></tr></thead><tbody>${Array.from({length:n},(_,j)=>`<tr class="${j===cur?'sel':''}"><td>${j+1}</td><td>${s.cd.length?s.cd[Math.min(j,s.cd.length-1)]:'—'}</td><td>${s.mana.length?s.mana[Math.min(j,s.mana.length-1)]:'—'}</td><td>${s.dmg.length?s.dmg[Math.min(j,s.dmg.length-1)]:'—'}</td></tr>`).join('')}</tbody></table></div></details>`:'';
    return `<div class="skill"><div class="skh">${s.ic?`<img alt="" src="${IM(s.ic)}">`:'<div class="noic"></div>'}<div><span class="slot">${esc(s.slot.replace('Skill','สกิล').replace('Ultimate','อัลติ').replace('Passive','ติดตัว'))}</span><div><b>${esc(s.name)}</b>${s.dt&&s.dt!=='none'?`<span class="dt ${s.dt}">${DT[s.dt]||s.dt}</span>`:''}</div></div></div>
    ${n>1?`<div class="seg"><span>เลเวลสกิล</span>${Array.from({length:n},(_,j)=>`<button data-i="${i}" data-l="${j+1}" aria-pressed="${j===cur}">${j+1}</button>`).join('')}</div>`:''}
    <div class="mini"><div>คูลดาวน์<b>${cd??'—'}${cd?' วิ':''}</b></div><div>มานา<b>${mn??'—'}</b></div><div>ค่าฐาน<b>${dm??'—'}</b></div></div>
    ${sc?`<div>${sc}</div>`:''}<p class="desc">${esc(s.th||s.en)}</p>${s.th&&s.en?`<p class="en">${esc(s.en)}</p>`:''}${tbl}</div>`}
  q('#sks').onclick=e=>{const b=e.target.closest('button[data-i]');if(!b)return;skl[b.dataset.i]=+b.dataset.l;draw()};
  draw();
}

/* ---------------- items ---------------- */
function itemsView(w){
  w.innerHTML=`<div class="row"><input type="search" id="iq" placeholder="ค้นหาไอเทม ชื่อ ค่าสถานะ หรือสกิลติดตัว" aria-label="ค้นหาไอเทม">
   <select id="itier" aria-label="ขั้น"><option value="">ทุกขั้น</option><option value="1">ขั้น 1</option><option value="2">ขั้น 2</option><option value="3">ขั้น 3</option></select>
   <select id="isort" aria-label="เรียง"><option value="cat">เรียงตามหมวด</option><option value="pa">ราคาน้อย → มาก</option><option value="pd">ราคามาก → น้อย</option><option value="n">ชื่อ A–Z</option></select></div>
   <div class="chips" id="icat" style="margin-top:10px"></div><div class="count" id="icount" style="margin-top:10px"></div><div class="igrid" id="igrid"></div>`;
  const q=s=>w.querySelector(s);let cat='';
  q('#icat').innerHTML='<button class="chip" aria-pressed="true" data-v="">ทุกหมวด</button>'+Object.entries(CAT).map(([k,v])=>`<button class="chip" aria-pressed="false" data-v="${k}">${v}</button>`).join('');
  q('#icat').onclick=e=>{const b=e.target.closest('button');if(!b)return;cat=b.dataset.v;for(const x of q('#icat').children)x.setAttribute('aria-pressed',x===b);draw()};
  const draw=()=>{const s=q('#iq').value.trim().toLowerCase(),t=q('#itier').value,so=q('#isort').value,co=Object.keys(CAT);
    const a=D.items.filter(i=>(!cat||i.c===cat)&&(!t||i.t==t)&&(!s||(i.n+' '+i.al.join(' ')+' '+i.ps.join(' ')+' '+i.th.join(' ')+' '+Object.keys(i.st).map(k=>(SL[k]||[k])[0]).join(' ')).toLowerCase().includes(s)));
    a.sort((x,y)=>so==='pa'?(x.p??1e9)-(y.p??1e9):so==='pd'?(y.p??-1)-(x.p??-1):so==='n'?x.n.localeCompare(y.n):co.indexOf(x.c)-co.indexOf(y.c)||x.t-y.t||(x.p??0)-(y.p??0));
    q('#icount').textContent=a.length+' จาก '+D.items.length+' ชิ้น';
    q('#igrid').innerHTML=a.map(i=>{const ps=i.th.length?i.th:i.ps;
      return `<article class="card item"><div class="ih">${i.im?`<img alt="" src="${IM(i.im)}">`:`<div class="ph" title="ยังไม่มีรูป">${esc(i.n.split(/[ -]/).map(x=>x[0]).join('').slice(0,3))}</div>`}<div><b>${esc(i.n)}</b><small>${CAT[i.c]} · ขั้น ${i.t}${i.al.length?` · Global: ${esc(i.al.join(', '))}`:''}</small></div><span class="price">${i.p!=null?i.p.toLocaleString('en-US'):'—'}</span></div>
      ${i.patch&&/Beta 55/.test(i.patch)?'<div><span class="new">ปรับใน Beta 55</span></div>':''}
      <div class="istat">${Object.entries(i.st).map(([k,v])=>{const l=SL[k]||[k,''];return `<span>${l[0]} <b>+${v}${l[1]}</b></span>`}).join('')}</div>
      ${ps.map(p=>`<div class="pass">${esc(p)}</div>`).join('')}${!i.th.length&&i.ps.length?'<div class="en">คำอธิบายเป็นภาษาอังกฤษ (ยังไม่มีข้อความไทยของไอเทมนี้)</div>':''}</article>`}).join('')||'<p class="note">ไม่พบไอเทม</p>'};
  q('#iq').oninput=draw;q('#itier').onchange=draw;q('#isort').onchange=draw;draw();
}

/* ---------------- damage simulator ---------------- */
const SIM={A:{ar:{},hero:HERO('Airi')?'Airi':D.heroes[0].n,lv:15,it:['','','','','',''],fp:0,pp:0,fpm:0,ppm:0,crit:false},
           D:{ar:{},hero:HERO('Toro')?'Toro':D.heroes[1].n,lv:15,it:['','','','','','']}};
const SKSEL={};
const arcUsed=(S,c)=>D.arcana.filter(a=>a.c===c).reduce((t,a)=>t+(S.ar[a.n]||0),0);
function arcSum(S){const t={};for(const [n,c] of Object.entries(S.ar)){const a=D.arcana.find(y=>y.n===n);for(const [k,v] of Object.entries(a.st))t[k]=(t[k]||0)+v*c}return t}
const IGN=['attack_speed','cooldown_reduction','movement_speed','movement_speed_pct','life_steal','magic_life_steal','hp_regen_5s','mana_regen_5s','max_mana'];
function build(id){const S=SIM[id],h=HERO(S.hero),b=h.lv[S.lv-1];
  const t={attack_damage:0,ability_power:0,max_hp:0,armor:0,magic_defense:0,critical_chance:0};const ign=new Set();
  for(const s of S.it){const i=IT(s);if(!i)continue;for(const [k,v] of Object.entries(i.st)){if(k in t)t[k]+=v;else if(!IGN.includes(k))ign.add((SL[k]||[k])[0])}}
  const R=arcSum(S),rd=x=>Math.round(x*100)/100;
  return {h,S,R,hp:rd(b[0]+t.max_hp+(R.max_hp||0)),armor:rd(b[1]+t.armor+(R.armor||0)),mdef:rd(b[2]+t.magic_defense+(R.magic_defense||0)),ad:rd(b[3]+t.attack_damage+(R.attack_damage||0)),bonusAd:rd(t.attack_damage+(R.attack_damage||0)),ap:rd(t.ability_power+(R.ability_power||0)),ign:[...ign]}}
const SUP=['ad_pct','ap_pct','bonus_ad_pct','bonus_ap_pct','own_hp_pct','target_max_hp_pct','target_hp_pct','target_current_hp_pct'];
function skillDmg(sk,lv,A,Dd){const base=sk.dmg.length?sk.dmg[Math.min(lv,sk.dmg.length)-1]:0;let raw=base;const skip=[];
  for(const [k,v] of Object.entries(sk.sc||{})){if(!SUP.includes(k)||typeof v!=='number'){skip.push(k);continue}
    const f=v/100;let x=0;
    if(k==='ad_pct')x=A.ad*f;else if(k==='ap_pct'||k==='bonus_ap_pct')x=A.ap*f;else if(k==='bonus_ad_pct')x=A.bonusAd*f;else if(k==='own_hp_pct')x=A.hp*f;else x=Dd.hp*f;
    raw+=x}
  return {raw,base,skip}}

function simView(w){
  w.innerHTML=`<div class="sides"><div class="card" id="sA"></div><div class="card" id="sD"></div></div><div class="card" id="out" style="margin-top:12px"></div>
  <details class="card" style="margin-top:12px"><summary style="margin-top:0">สูตรที่ใช้และข้อจำกัด</summary><div id="form"></div></details>`;
  const q=s=>w.querySelector(s);
  const side=(id,title,atk)=>{const S=SIM[id],el=q('#s'+id),h=HERO(S.hero);
    el.innerHTML=`<div class="who"><img alt="" src="${IM(h.a)}"><div><small>${title}</small><h2>${esc(S.hero)}</h2></div></div>
    <label class="l" for="${id}h">ฮีโร่</label><select id="${id}h" style="width:100%">${D.heroes.map(x=>`<option${x.n===S.hero?' selected':''}>${esc(x.n)}</option>`).join('')}</select>
    <label class="l" for="${id}l">เลเวล <b id="${id}ln">${S.lv}</b></label><input type="range" id="${id}l" min="1" max="15" value="${S.lv}">
    <label class="l">ไอเทม กดช่องเพื่อเลือก</label><div class="slots">${S.it.map((v,i)=>{const it=IT(v);return `<button class="slotb${it?' on':''}" data-i="${i}" title="${it?esc(it.n):'เลือกไอเทม'}">${it?(it.im?`<img alt="" src="${IM(it.im)}">`:`<div class="ph">${esc(it.n.slice(0,2))}</div>`):'<em>+</em>'}<span>${it?esc(it.n):'ว่าง'}</span></button>`}).join('')}</div>
    <details><summary>พลังแฝง <span class="count">${Object.values(S.ar).reduce((a,b)=>a+b,0)}/30</span></summary><div class="acols">${['Red','Purple','Green'].map(c=>`<div class="acol c${c[0]}"><h4><span>${{Red:'แดง · โจมตี',Purple:'ม่วง · เลือดและความเร็ว',Green:'เขียว · ป้องกันและทะลุ'}[c]}</span><span class="count">${arcUsed(S,c)}/10</span></h4>${D.arcana.filter(a=>a.c===c).map(a=>`<div class="ar"><div class="nm"><b>${esc(a.nt)}</b><small>${arcTxt(a.st)}</small></div><button data-a="${esc(a.n)}" data-d="-1" aria-label="ลด">−</button><span class="ct">${S.ar[a.n]||0}</span><button data-a="${esc(a.n)}" data-d="1" aria-label="เพิ่ม">+</button></div>`).join('')}</div>`).join('')}</div></details>
    ${atk?`<details><summary>ค่าเจาะและคริติคอล</summary><p class="note">ค่าเจาะจากพลังแฝงถูกรวมให้อัตโนมัติ ส่วนค่าเจาะจากสกิลติดตัวไอเทมให้กรอกเอง</p><div class="two"><div><label class="l" for="Afp">เจาะเกราะ (คงที่)</label><input type="number" id="Afp" min="0" value="${S.fp}"></div><div><label class="l" for="App">เจาะเกราะ (%)</label><input type="number" id="App" min="0" max="100" value="${S.pp}"></div><div><label class="l" for="Afpm">เจาะเวท (คงที่)</label><input type="number" id="Afpm" min="0" value="${S.fpm}"></div><div><label class="l" for="Appm">เจาะเวท (%)</label><input type="number" id="Appm" min="0" max="100" value="${S.ppm}"></div></div><label class="chk"><input type="checkbox" id="Acrit"${S.crit?' checked':''}> ตีติดคริติคอล (×2)</label></details>`:''}
    <div class="stats2" id="${id}stat"></div>`;
    el.querySelector('#'+id+'h').onchange=e=>{S.hero=e.target.value;side(id,title,atk);sim()};
    el.querySelector('#'+id+'l').oninput=e=>{S.lv=+e.target.value;el.querySelector('#'+id+'ln').textContent=S.lv;sim()};
    for(const x of el.querySelectorAll('button[data-a]'))x.onclick=()=>{const a=D.arcana.find(y=>y.n===x.dataset.a),d=+x.dataset.d,cur=S.ar[a.n]||0;
      if(d>0&&arcUsed(S,a.c)>=10)return;if(cur+d<0)return;S.ar[a.n]=cur+d;if(!S.ar[a.n])delete S.ar[a.n];side(id,title,atk);el.querySelector('details').open=true;sim()};
    for(const x of el.querySelectorAll('button[data-i]'))x.onclick=()=>pick(S,+x.dataset.i,()=>{side(id,title,atk);sim()});
    if(atk){for(const k of ['fp','pp','fpm','ppm'])el.querySelector('#A'+k).oninput=e=>{S[k]=Math.max(0,+e.target.value||0);sim()};el.querySelector('#Acrit').onchange=e=>{S.crit=e.target.checked;sim()}}};
  function pick(S,idx,done){const o=document.createElement('div');o.className='pick';
    o.innerHTML=`<div role="dialog" aria-label="เลือกไอเทม"><div class="row"><input type="search" placeholder="ค้นหาไอเทม" id="pq"><button class="chip" id="px">ล้างช่อง</button><button class="chip" id="pc">ปิด</button></div><div class="chips" id="pcat"></div><div class="pgrid" id="pg"></div></div>`;
    w.appendChild(o);let cat='';const oq=s=>o.querySelector(s);
    const draw=()=>{const s=oq('#pq').value.trim().toLowerCase();
      oq('#pg').innerHTML=D.items.filter(i=>(!cat||i.c===cat)&&(!s||(i.n+' '+i.al.join(' ')).toLowerCase().includes(s))).sort((a,b)=>Object.keys(CAT).indexOf(a.c)-Object.keys(CAT).indexOf(b.c)||a.t-b.t).map(i=>`<button data-s="${esc(i.s)}">${i.im?`<img alt="" src="${IM(i.im)}">`:`<div class="ph">${esc(i.n.slice(0,2))}</div>`}<span>${esc(i.n)}</span><small>${i.p??'—'}</small></button>`).join('')};
    oq('#pcat').innerHTML='<button class="chip" aria-pressed="true" data-v="">ทั้งหมด</button>'+Object.entries(CAT).map(([k,v])=>`<button class="chip" aria-pressed="false" data-v="${k}">${v}</button>`).join('');
    oq('#pcat').onclick=e=>{const b=e.target.closest('button');if(!b)return;cat=b.dataset.v;for(const x of oq('#pcat').children)x.setAttribute('aria-pressed',x===b);draw()};
    oq('#pq').oninput=draw;draw();
    const close=()=>{o.remove();document.removeEventListener('keydown',k)};const k=e=>{if(e.key==='Escape')close()};document.addEventListener('keydown',k);
    o.onclick=e=>{if(e.target===o)close()};oq('#pc').onclick=close;
    oq('#px').onclick=()=>{S.it[idx]='';close();done()};
    oq('#pg').onclick=e=>{const b=e.target.closest('button');if(!b)return;S.it[idx]=b.dataset.s;close();done()}}
  function sim(){const A=build('A'),Dd=build('D');
    for(const [id,x] of [['A',A],['D',Dd]])q('#'+id+'stat').innerHTML=`<div class="tile"><small>HP</small><b>${x.hp}</b></div><div class="tile"><small>เกราะ</small><b>${x.armor}</b></div><div class="tile"><small>ต้านเวท</small><b>${x.mdef}</b></div><div class="tile"><small>${id==='A'?'โจมตี / เวท':'พลังโจมตี'}</small><b>${x.ad}${id==='A'?' / '+x.ap:''}</b></div>${x.ign.length?`<p class="note" style="grid-column:1/-1;margin:0">ค่าที่ยังไม่ถูกนำมาคำนวณ: ${x.ign.join(', ')}</p>`:''}`;
    const S=SIM.A,fpA=S.fp+(A.R.armor_pierce||0),fpM=S.fpm+(A.R.magic_pierce||0),cm=2+(A.R.critical_damage_pct||0)/100;
    const eA=eff(Dd.armor,fpA,S.pp),eM=eff(Dd.mdef,fpM,S.ppm),rP=red(eA),rM=red(eM);
    const bas=Math.floor(A.ad-A.ad*rP),cr=Math.floor(bas*cm),per=S.crit?cr:bas;
    const hN=bas>0?Math.ceil(Dd.hp/bas):Infinity,hC=cr>0?Math.ceil(Dd.hp/cr):Infinity,hits=per>0?Math.ceil(Dd.hp/per):Infinity;
    const rows=A.h.sk.map((sk,i)=>{const n=Math.max(sk.dmg.length,sk.cd.length,1),lv=SKSEL[A.h.n+i]||n,r=skillDmg(sk,lv,A,Dd),has=sk.dt!=='none'&&r.raw>0;
      const fin=!has?0:sk.dt==='true'?Math.floor(r.raw):Math.floor(r.raw-r.raw*(sk.dt==='physical'?rP:rM));return {sk,i,n,lv,r,has,fin}});
    const chosen=rows.filter(r=>r.has&&SKSEL['c'+A.h.n+r.i]),combo=chosen.reduce((a,r)=>a+r.fin,0);
    const nf=x=>isFinite(x)?x:'—';
    q('#out').innerHTML=`<div class="vs"><img alt="" src="${IM(A.h.a)}"><b>${esc(A.h.n)} Lv${A.S.lv}</b><span style="font-size:22px;color:var(--dim)">→</span><img alt="" src="${IM(Dd.h.a)}"><b>${esc(Dd.h.n)} Lv${Dd.S.lv}</b></div>
    <div class="kpis"><div class="kpi main"><small>ตีปกติกี่ครั้งถึงตาย${S.crit?' (คริทุกครั้ง)':''}</small><b>${nf(hits)}</b><small>ไม่คริ ${nf(hN)} · คริทุกครั้ง ${nf(hC)}</small></div>
    <div class="kpi"><small>ตีปกติ 1 ครั้ง</small><b>${bas}</b><small>คริ ${cr} (×${cm.toFixed(2)})</small></div>
    <div class="kpi"><small>เกราะเป้าหมาย (หลังเจาะ)</small><b>${fmt(eA)}</b><small>ลดกายภาพ ${(rP*100).toFixed(1)}%</small></div>
    <div class="kpi"><small>ต้านเวท (หลังเจาะ)</small><b>${fmt(eM)}</b><small>ลดเวท ${(rM*100).toFixed(1)}%</small></div></div>
    <p class="note">HP เป้าหมาย ${Dd.hp} · ตีปกติ = ${A.ad} × (1 − ${rP.toFixed(4)}) ปัดลง ไม่นับโล่ ฟื้นฟู หรือสกิลลดดาเมจ และยังไม่คิดความเร็วโจมตี จึงเป็น “จำนวนครั้ง” ไม่ใช่วินาที</p>
    <h3 style="margin-top:18px">สกิล <small>ติ๊กสกิลที่จะนับเป็นคอมโบ</small></h3>
    <div class="scroll"><table><thead><tr><th>ใช้</th><th>สกิล</th><th>เลเวล</th><th>ค่าฐาน</th><th>ดิบ</th><th>หลังป้องกัน</th></tr></thead><tbody>${rows.map(r=>`<tr><td><input type="checkbox" data-c="${r.i}" ${SKSEL['c'+A.h.n+r.i]?'checked':''} ${r.has?'':'disabled'} aria-label="ใช้"></td><td style="text-align:left">${r.sk.ic?`<img class="sico" alt="" src="${IM(r.sk.ic)}">`:''}${esc(r.sk.name)} <span class="dt ${r.sk.dt}">${DT[r.sk.dt]||''}</span></td><td>${r.n>1?`<select data-k="${r.i}" aria-label="เลเวลสกิล">${Array.from({length:r.n},(_,j)=>`<option${j+1===r.lv?' selected':''}>${j+1}</option>`).join('')}</select>`:'—'}</td><td>${r.has?r.r.base:'—'}</td><td>${r.has?Math.floor(r.r.raw):'—'}</td><td><b>${r.has?r.fin:'—'}</b></td></tr>`).join('')}</tbody></table></div>
    <p class="note">ส่วนที่ไม่ได้รวม: ${[...new Set(rows.flatMap(r=>r.r.skip))].map(k=>SCL[k]||k).join(', ')||'—'} เช่น ดาเมจต่อเนื่อง ดาเมจเสริมเมื่อเสริมพลัง และค่าตามเลเวล ถ้าสกิลมีหลายฮิตให้เทียบกับคำอธิบายในหน้าฮีโร่</p>
    <div class="kpis"><div class="kpi"><small>คอมโบที่เลือก (${chosen.length} สกิล)</small><b>${combo}</b></div><div class="kpi"><small>HP ที่เหลือ</small><b>${Math.max(0,Dd.hp-combo)}</b><div class="bar2"><i style="width:${Math.min(100,combo/Dd.hp*100)}%"></i></div></div><div class="kpi"><small>ตีปกติเก็บอีก</small><b>${combo>=Dd.hp?0:per>0?Math.ceil((Dd.hp-combo)/per)+' ครั้ง':'—'}</b></div></div>`;
    for(const c of w.querySelectorAll('#out input[data-c]'))c.onchange=()=>{SKSEL['c'+A.h.n+c.dataset.c]=c.checked;sim()};
    for(const c of w.querySelectorAll('#out select[data-k]'))c.onchange=()=>{SKSEL[A.h.n+c.dataset.k]=+c.value;sim()}}
  q('#form').innerHTML=`<div class="formula">% ลดดาเมจกายภาพ = เกราะ ÷ (เกราะ + 600)
% ลดดาเมจเวท      = ต้านเวท ÷ (ต้านเวท + 600)
ดาเมจที่ได้รับ      = ดาเมจ − (ดาเมจ × % ลด)  ปัดลงเป็นจำนวนเต็ม</div>
  <div class="formula">เจาะเกราะ: เกราะที่เหลือ = (เกราะ − เจาะคงที่) − (เกราะ − เจาะคงที่) × เจาะ%
คริติคอล:  ดาเมจที่ได้รับจริง × 2
ดาเมจจริง: ไม่ถูกลดด้วยเกราะหรือต้านเวท</div>
  <p>ตัวอย่างทางการ: Violet AD 172 ตีเป้าหมายเกราะ 259 → 259 ÷ 859 = 30.15% → 172 − 51.86 = 120.14 แสดงเป็น 120 (เครื่องมือนี้ได้ <b>${Math.floor(172-172*red(259))}</b>) ค่าลดดาเมจที่เกราะ 300 / 600 / 900 คือ 33.3% / 50% / 60%</p>
  <ul><li>สูตรมาจากบทความ <a href="https://www.arenaofvalor.com/webplat/info/news_version3/26190/33996/33997/34436/m19726/201808/748194.shtml" target="_blank" rel="noopener">How Damage is Calculated?</a> (ทางการ ฝั่ง Global) ตรงกับตารางทดสอบ RoV ไทยของ <a href="https://www.thepexcel.com/rov-damage-calculation/" target="_blank" rel="noopener">Thep Excel</a> บทความทั้งสองเก่ากว่าแพตช์ปัจจุบัน ยังไม่ได้ทดสอบซ้ำใน Beta 55</li>
  <li>พลังแฝง: ตัวเลขระดับ 3 ใส่ได้สีละ 10 รวม 30 ช่อง ค่า “ดาเมจคริ %” ผมสมมติว่าบวกเข้าตัวคูณคริ (2 + x%) ยังไม่ได้ยืนยัน</li>
  <li>“+x% AD/AP” คูณกับพลังโจมตี/เวทรวม และ “AD เพิ่ม” นับเฉพาะจากไอเทมและพลังแฝง ซึ่งเป็นข้อสันนิษฐานของผม</li>
  <li>ไม่ได้จำลอง: โล่ ลดดาเมจ/บล็อกของฮีโร่ สกิลติดตัวไอเทมที่เพิ่มดาเมจ เอนแชนต์ ความเร็วโจมตี และคูลดาวน์</li></ul>`;
  side('A','ผู้โจมตี',true);side('D','เป้าหมาย',false);sim();
}

/* ---------------- about ---------------- */
function aboutView(w){
  const ni=D.items.filter(i=>!i.im).map(i=>i.n);
  w.innerHTML=`<div class="card"><div class="sec"><h3>แพตช์ที่ใช้</h3><p style="margin:0"><b>${esc(D.meta.patch)}</b> · ตรวจข้อมูลล่าสุด ${esc(D.meta.checked)} · ฮีโร่ ${D.heroes.length} ตัว สกิล ${D.heroes.reduce((a,h)=>a+h.sk.length,0)} สกิล ไอเทม ${D.items.length} ชิ้น (มีรูป ${D.items.length-ni.length})</p></div>
  <div class="sec"><h3>ข้อจำกัด</h3><ul><li>สถานะฮีโร่เลเวล 2–14 คำนวณเป็นเส้นตรงจากเลเวล 1 และ 15 ที่อ่านจากเกม ค่าฟื้นฟูมีเฉพาะเลเวล 1</li><li>ไอเทมที่ยังไม่มีรูป: ${esc(ni.join(', ')||'ไม่มี')} ไอเทมที่ยังไม่มีราคาแสดงเป็น “—”</li><li>ไอเทมใช้ชื่อฝั่งไทย ชื่อฝั่ง Global แสดงต่อท้ายเมื่อไม่ตรงกัน</li></ul></div>
  <div class="sec"><h3>แหล่งข้อมูล</h3><ul>${D.meta.sources.map(s=>`<li><a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.t)}</a></li>`).join('')}</ul></div>
  <div class="sec"><h3>เมื่อมีแพตช์ใหม่</h3><p style="margin:0">อัปเดตไฟล์ข้อมูล แก้ชื่อแพตช์ใน <code>db/meta.json</code> แล้วรัน <code>python3 db/build.py</code> จากนั้นสร้างหน้ารวมใหม่ด้วย <code>merge/build_merge.py</code></p></div></div>`;
}

class RovDB extends HTMLElement{
  connectedCallback(){if(this._m)return;this._m=1;const r=this.attachShadow({mode:'open'});r.innerHTML=`<style>${CSS}</style><div class="w"></div>`;
    const w=r.querySelector('.w'),v=this.getAttribute('view');
    ({hero:()=>heroView(w,this.getAttribute('hero')),items:()=>itemsView(w),sim:()=>simView(w),about:()=>aboutView(w)})[v]();}
}
customElements.define('rov-db',RovDB);
})();

