
(function(){
const el=document.getElementById('intro');if(!el)return;
const hv=location.hash.slice(1);if(hv&&hv!=='lib'){el.remove();return}
const RAW=window.__ROV;
const picks=[...RAW.heroes].filter(h=>h.img).sort((a,b)=>b.pick-a.pick).slice(0,30);
const N=picks.length,ring=el.querySelector('.ring'),reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
ring.innerHTML=picks.map(h=>`<button type="button" class="ic" data-h="${h.name.replace(/"/g,'&quot;')}" aria-label="${h.th}"><img src="${h.img}" alt="" width="64" height="64"></button>`).join('');
const cards=[...ring.children];
let W=0,H=0;const size=()=>{const r=el.querySelector('.stage').getBoundingClientRect();W=r.width;H=r.height;el.style.setProperty('--ic',Math.round(Math.max(46,Math.min(96,Math.min(W,H)*.085)))+'px')};size();addEventListener('resize',()=>{size();lay();onScroll()});
let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const sc=cards.map(()=>({x:(rnd()-.5)*.92,y:(rnd()-.5)*.8,r:(rnd()-.5)*70}));
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,lerp=(a,b,t)=>a+(b-a)*t;
let phase=reduce?'free':'scatter',p=0,t0=performance.now();
const set=(c,x,y,r,s)=>{c.style.transform=`translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(${s})`};
function place(now){
  const small=W<560,land=H<520&&W>H,R=small?Math.min(W*.34,H*.24):land?H*.3:Math.min(W*.4,H*.35);
  const aR=small?W*.42:land?Math.min(W*.42,H*.66):Math.min(W*.46,H*.62),ay=H*.34;
  if(land)ring.style.left=lerp(72,50,ease(Math.min(1,p/.6)))+'%';                       // arc: radius + centre offset
  const sp=reduce?0:(now-t0)*.00012*(1-ease(Math.min(1,p*1.6)));
  const q=ease(Math.min(1,p/.6)),slide=Math.max(0,(p-.6)/.4);
  cards.forEach((c,i)=>{
    if(phase==='scatter'){set(c,sc[i].x*W,sc[i].y*H,sc[i].r,.9);return}
    const a=Math.PI+i/N*2*Math.PI+sp;
    const cx=Math.cos(a)*R,cy=Math.sin(a)*R;
    const th=Math.PI+.1+i/(N-1)*(Math.PI-.2)+(slide-.5)*.22*Math.min(1,slide*5);
    const ax=Math.cos(th)*aR,ay2=Math.sin(th)*aR+ay;
    const x=lerp(cx,ax,q),y=lerp(cy,ay2,q);
    const rot=lerp(a*180/Math.PI+90,th*180/Math.PI+90,q);
    set(c,x,y,rot,lerp(1,small?.95:1.1,q));
    c.style.borderColor=q>.02?`hsl(${Math.round(i/N*300)} 70% ${document.documentElement.dataset.theme==='light'?45:62}% / ${q})`:'';
  });
}
function onScroll(){const r=el.getBoundingClientRect(),L=r.height-innerHeight;p=L>0?Math.min(1,Math.max(0,-r.top/L)):reduce?1:0;if(reduce)p=1;
  const ttl=el.querySelector('.ttl'),cta=el.querySelector('.cta'),hint=el.querySelector('.hint');
  ttl.style.opacity=String(Math.max(0,1-p/.35));ttl.style.transform=`translateY(calc(-50% - ${p*40}px))`;
  const c=Math.max(0,Math.min(1,(p-.45)/.3));cta.style.opacity=String(c);cta.style.transform=`translateY(${(1-c)*16}px)`;cta.style.pointerEvents=c>.6?'auto':'none';
  hint.style.opacity=String(Math.max(0,1-p*6))}
addEventListener('scroll',onScroll,{passive:true});onScroll();
function loop(now){place(now);if(!reduce)requestAnimationFrame(loop)}
cards.forEach((c,i)=>{c.classList.add('tr');setTimeout(()=>c.classList.add('on'),reduce?0:60+i*28)});
function lay(){const sm=W<560,land=H<520&&W>H,ttl=el.querySelector('.ttl'),cta=el.querySelector('.cta');
  ring.style.top=sm?'36%':'50%';if(!land)ring.style.left='50%';
  ttl.style.top=sm?'72%':'50%';
  if(land){ttl.style.right='auto';ttl.style.width='48%';ttl.style.textAlign='left';ttl.style.paddingInline='5vw 0'}else{ttl.style.right='0';ttl.style.width='';ttl.style.textAlign='';ttl.style.paddingInline=''}
  const aR=sm?W*.42:land?Math.min(W*.42,H*.66):Math.min(W*.46,H*.62),cy=(sm?.36:.5)*H+.34*H-aR;
  cta.style.top=Math.max(64,cy>240?cy-190:cy+(land?70:70))+'px'}
lay();
place(performance.now());
if(!reduce){setTimeout(()=>{phase='circle';t0=performance.now()},950);setTimeout(()=>cards.forEach(c=>c.classList.remove('tr')),950+1050)}
requestAnimationFrame(loop);
const go=()=>document.getElementById('app').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
el.querySelector('.go').onclick=go;el.querySelector('.skip').onclick=go;
ring.addEventListener('click',e=>{const b=e.target.closest('.ic');if(!b||!window.openHero)return;window.openHero(b.dataset.h);go()});
})();

(function(){var d=window.__DB;var e=document.getElementById("patchLine");if(e)e.textContent="แพตช์ "+d.meta.patch.split(" – ")[0]})();
