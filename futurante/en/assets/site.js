(()=>{
 'use strict';
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const menu=document.getElementById('menu-panel');
 const toggle=document.getElementById('menu-toggle');
 const closeMenu=document.getElementById('menu-close');
 function setMenu(open){if(!menu)return; menu.hidden=!open; toggle?.setAttribute('aria-expanded',String(open));if(open)closeMenu?.focus();else toggle?.focus();}
 toggle?.addEventListener('click',()=>setMenu(menu.hidden));
 closeMenu?.addEventListener('click',()=>setMenu(false));
 menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
 document.addEventListener('keydown',e=>{if(e.key==='Escape' && menu && !menu.hidden)setMenu(false)});
 // Original EF 3D orbit: continuous 70s rotation, pointer-drag to explore.
 const ring=document.querySelector('.ring');const stage=document.querySelector('.stage');
 if(ring&&stage){
  let ang=0,last=performance.now(),drag=null,velocity=reduced?0:360/70,justDragged=false;
  const targetVelocity=reduced?0:360/70;
  function tick(t){const dt=Math.min((t-last)/1000,.07);last=t;
   if(!drag){velocity+=(targetVelocity-velocity)*Math.min(1,dt*.95);ang+=velocity*dt;}
   ring.style.transform=`rotateX(var(--tilt)) rotateY(${ang}deg)`;
   requestAnimationFrame(tick);
  }requestAnimationFrame(tick);
  stage.addEventListener('pointerdown',e=>{if(e.button!==0 && e.pointerType==='mouse')return; drag={x:e.clientX,t:performance.now(),dist:0,id:e.pointerId};justDragged=false;});
  stage.addEventListener('pointermove',e=>{if(!drag)return;
   const now=performance.now(),dx=e.clientX-drag.x; ang+=dx*.31;
   velocity=(dx*.31)/Math.max(.016,(now-drag.t)/1000);
   drag.dist+=Math.abs(dx);drag.x=e.clientX;drag.t=now;
   if(drag.dist>7){stage.classList.add('dragging');justDragged=true;try{stage.setPointerCapture(drag.id)}catch{}}
  });
  function endDrag(){if(!drag)return;drag=null;stage.classList.remove('dragging');velocity=Math.max(-100,Math.min(100,velocity));setTimeout(()=>justDragged=false,100)}
  stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);
  ring.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>{if(justDragged){e.preventDefault();justDragged=false}}));
 }
 // Real native dialogs: one per principle, reading remains accessible without JS via stack text.
 const dialogs=[...document.querySelectorAll('dialog.carta')];
 function openCard(i){const dialog=dialogs[i];if(dialog?.showModal)dialog.showModal(); else if(dialog)dialog.setAttribute('open','');}
 document.querySelectorAll('[data-open-card]').forEach(btn=>btn.addEventListener('click',()=>openCard(Number(btn.dataset.openCard))));
 document.querySelectorAll('[data-close-dialog]').forEach(btn=>btn.addEventListener('click',()=>btn.closest('dialog')?.close()));
 dialogs.forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()}));
 document.getElementById('draw')?.addEventListener('click',()=>openCard(Math.floor(Math.random()*dialogs.length)));
 // Allow the official orbit cards to open full reading with keyboard when the section is reached via links.
 // The anchors keep native navigation semantics, including control without scripting.
 // Reveal animation only where it preserves reading and motion preference.
 if(!reduced && 'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target)}}),{threshold:.12});
  document.querySelectorAll('.statement-strip,.triad,.ai-intro').forEach(el=>observer.observe(el));
 }
})();
