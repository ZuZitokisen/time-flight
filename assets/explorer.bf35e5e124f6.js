(function(){
'use strict';
const section=document.querySelector('#tf-next-explorer'), rail=document.querySelector('#tf-next-years'), button=document.querySelector('#tf-next-reset'), status=document.querySelector('#tf-next-announcement');
const presentation=window.TimeFlightNextPresentation;
if(!section||!presentation)return;
const single=document.querySelector('#tf-next-single'),range=document.querySelector('#tf-next-range'),instruction=document.querySelector('#tf-next-instruction'),current=document.querySelector('#tf-next-current'),cells=rail.querySelector('.tf-next-cells'),highlight=rail.querySelector('.tf-next-highlight');
let focused=null, previous=null, items=[], fingerprint='', lastRender='', initialized=false, pending=false, rangeMode=false, anchor=null, awaitingPeriod=null;
// Native startup gets the prior validated preset before the explorer first paints.
const nativeSettings=window.webkit?.messageHandlers?.presentationSettings;
let configReady=!nativeSettings, configRevision=0;
const update=()=>{if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;paint()})}};
function samePeriod(a,b){return a.from===b.from&&a.to===b.to&&a.yearStart===b.yearStart&&a.yearEnd===b.yearEnd}
function label(a,b){return a===b?a+'年':a+'〜'+b+'年'}
function narrow(a,b){
 const api=window.TimeFlightNextExplorerAdapter,state=api.get(),base=previous||state.period;
 const start=Math.min(a,b),end=Math.max(a,b);
 const from=[base.from,start+'-01-01'].filter(Boolean).sort().at(-1);
 const to=[base.to,end+'-12-31'].filter(Boolean).sort()[0];
 if(start<base.yearStart||end>base.yearEnd||from>to)return;
 if(!api.setPeriod({from,to,yearStart:start,yearEnd:end}))return;
 if(!previous){previous=state.period;fingerprint=state.fingerprint;items=state.years;}
 focused={start,end,period:{from,to,yearStart:start,yearEnd:end}};
 status.textContent=label(start,end)+'の記録に絞り込みました';
 anchor=null;awaitingPeriod=null;paint();
}
function choose(year){
 if(!rangeMode){narrow(year,year);return;}
 if(anchor===null){
  const state=window.TimeFlightNextExplorerAdapter.get();
  anchor=year;awaitingPeriod={period:state.period,fingerprint:state.fingerprint};
  status.textContent=year+'年を始点にしました。もう一つの年を選んでください';paint();return;
 }
 narrow(anchor,year);
}
function setMode(value){
 rangeMode=value;anchor=null;awaitingPeriod=null;paint();
}
single.addEventListener('click',()=>setMode(false));
range.addEventListener('click',()=>setMode(true));
button.addEventListener('click',()=>{
 if(!previous)return;const api=window.TimeFlightNextExplorerAdapter, period=previous, year=focused?.start;
 previous=null;focused=null;anchor=null;awaitingPeriod=null;api.setPeriod(period);status.textContent='元の期間に戻しました';paint();
 cells.querySelector('[data-year="'+year+'"]')?.focus({preventScroll:true});
});
function placeHighlight(start,end,preview){
 const buttons=[...cells.querySelectorAll('button')];
 const matches=buttons.filter(b=>Number(b.dataset.year)>=start&&Number(b.dataset.year)<=end);
 section.dataset.rangePreview=String(preview);
 for(const b of buttons){const y=Number(b.dataset.year),selected=!preview&&y>=start&&y<=end;
  b.setAttribute('aria-pressed',String(selected));
  b.classList.toggle('tf-next-is-start',y===start);b.classList.toggle('tf-next-is-end',y===end);
 }
 if(matches.length){
  const first=matches[0],last=matches.at(-1),visible=highlight.classList.contains('tf-next-highlight-visible');
  // First reveal comes from the tapped year, not from the invisible rail's origin.
  if(!visible)highlight.style.transition='none';
  highlight.style.left=first.offsetLeft+'px';
  highlight.style.width=(last.offsetLeft+last.offsetWidth-first.offsetLeft)+'px';
  if(!visible){highlight.getBoundingClientRect();highlight.style.transition='';}
 }
 highlight.classList.toggle('tf-next-highlight-visible',matches.length>0);
}
function paint(){
 const api=window.TimeFlightNextExplorerAdapter;if(!api||!configReady)return;
 const s=api.get();
 if(focused&&(!samePeriod(s.period,focused.period)||s.fingerprint!==fingerprint)){focused=null;previous=null;anchor=null;awaitingPeriod=null;}
 if(awaitingPeriod&&(!samePeriod(s.period,awaitingPeriod.period)||s.fingerprint!==awaitingPeriod.fingerprint)){anchor=null;awaitingPeriod=null;}
 if(!focused)items=s.years;
 const available=items.filter(y=>y.total>0);
 section.hidden=!!s.direct||!available.length;
 if(section.hidden)return;
 button.hidden=!focused;
 current.textContent=focused?label(focused.start,focused.end):((s.period.from||s.period.to||s.period.yearStart!==s.minYear||s.period.yearEnd!==s.maxYear)?label(s.period.yearStart,s.period.yearEnd):'全期間');
 single.setAttribute('aria-pressed',String(!rangeMode));range.setAttribute('aria-pressed',String(rangeMode));section.dataset.rangeMode=String(rangeMode);
 instruction.textContent=rangeMode?(anchor===null?'開始年を選択':anchor+'年 → 終了年を選択'):'年を選択';
 const signature=JSON.stringify([available,s.sort]);
 if(signature!==lastRender){
  lastRender=signature;
  const max=Math.max(...available.map(x=>x.total),1),oldScroll=rail.scrollLeft;
  const oldFocus=rail.contains(document.activeElement)?document.activeElement.dataset.year:null;
  cells.replaceChildren(...available.map(item=>{
   const el=document.createElement('button');el.type='button';el.dataset.year=item.year;
   el.setAttribute('aria-label',item.year+'年、'+item.total.toLocaleString()+'件。ブログ '+item.blog+'件、公演 '+item.live+'件、発売 '+item.release+'件');
   el.title=item.year+'年 / '+item.total+'件';
   const bars=document.createElement('span');bars.className='tf-next-bars';bars.setAttribute('aria-hidden','true');
   const scale=Math.sqrt(item.total/max)*100;
   for(const kind of ['blog','live','release','other'])if(item[kind]){const bar=document.createElement('i');bar.dataset.kind=kind;bar.style.height=(scale*item[kind]/item.total*.92).toFixed(2)+'%';bars.append(bar)}
   const year=document.createElement('span');year.textContent=item.year;
   el.append(bars,year);el.addEventListener('click',()=>choose(item.year));return el;
  }));
  if(!initialized){rail.scrollLeft=s.sort==='asc'?0:rail.scrollWidth;initialized=true;}else rail.scrollLeft=oldScroll;
  if(oldFocus)cells.querySelector('[data-year="'+oldFocus+'"]')?.focus({preventScroll:true});
 }
 if(anchor!==null)placeHighlight(anchor,anchor,true);
 else if(focused)placeHighlight(focused.start,focused.end,false);
 else placeHighlight(Infinity,-Infinity,false);
}
if(typeof ResizeObserver==='function')new ResizeObserver(update).observe(cells);
presentation.apply(section,presentation.defaults);
// The native bridge sends a validated dictionary. Web loads one fixed same-origin
// data endpoint; this path never downloads HTML, CSS or executable JavaScript.
window.TimeFlightNextApplyPresentation=value=>{
 if(!presentation.apply(section,value))return false;
 configRevision++;
 return true;
};
if(nativeSettings){
 const requestedRevision=configRevision;
 // A response delayed past a more recent native push must never undo it.
 // A missing bridge response cannot prevent the content from being shown.
 const ready=()=>{if(!configReady){configReady=true;update()}};
 const deadline=setTimeout(ready,250);
 Promise.resolve().then(()=>nativeSettings.postMessage({action:'current'}))
  .then(value=>{if(configRevision===requestedRevision)presentation.apply(section,value)})
  .catch(()=>{}).finally(()=>{clearTimeout(deadline);ready()});
}
if(!window.webkit?.messageHandlers?.catalogJSON&&['https:','http:'].includes(location.protocol)){
 const key='timeflight.next.presentation.v1';
 try{const prior=presentation.parse(localStorage.getItem(key));if(prior)presentation.apply(section,prior)}catch{}
 const url=new URL('./presentation.json',location.href);
 if(url.origin===location.origin)fetch(url,{credentials:'omit',cache:'no-store',redirect:'error'}).then(async response=>{
  if(!response.ok||Number(response.headers.get('content-length'))>4096||!response.body)return;
  const reader=response.body.getReader(),decoder=new TextDecoder('utf-8',{fatal:true});let size=0,raw='';
  try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>4096){await reader.cancel();return}raw+=decoder.decode(value,{stream:true})}raw+=decoder.decode()}finally{reader.releaseLock()}
  const next=presentation.parse(raw);if(next&&presentation.apply(section,next)){try{localStorage.setItem(key,JSON.stringify(next))}catch{}}
 }).catch(()=>{});
}
window.addEventListener('timeflight:ready',update);
if(window.TimeFlightNextExplorerAdapter)update();
new MutationObserver(update).observe(document.querySelector('#list'),{childList:true});
})();
