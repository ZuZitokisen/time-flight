(function(root){
'use strict';
const defaults=Object.freeze({schema:1,density:'compact',accent:'warm'});
const categories=Object.freeze(['all','blog','live','release','song']);
const iconTokens=Object.freeze({blog:Object.freeze(['article','document']),live:Object.freeze(['penlight','microphone']),release:Object.freeze(['disc','album']),song:Object.freeze(['notes','headphones'])});
const layoutDefaults=Object.freeze({genreOrder:categories,genreLayout:'row',genreLabels:'full',genreSize:'standard',scopeOrder:'genresFirst',yearRail:'belowFilters',showCounts:true,icons:Object.freeze({blog:'article',live:'penlight',release:'disc',song:'notes'})});
const enumOf=(value,choices)=>choices.includes(value);
const exact=(x,keys)=>!!x&&Object.getPrototypeOf(x)===Object.prototype&&Object.keys(x).sort().join(',')===[...keys].sort().join(',');
function validate(x){
 if(!x||!['compact','roomy'].includes(x.density)||!['warm','cocoa'].includes(x.accent))return null;
 if(x.schema===1&&exact(x,['schema','density','accent']))return Object.freeze({schema:1,density:x.density,accent:x.accent});
 const keys=['schema','density','accent',...Object.keys(layoutDefaults)];
 if(x.schema!==2||!exact(x,keys)||
    !Array.isArray(x.genreOrder)||x.genreOrder.length!==categories.length||new Set(x.genreOrder).size!==categories.length||x.genreOrder.some(k=>!categories.includes(k))||
    !enumOf(x.genreLayout,['row','tiles'])||!enumOf(x.genreLabels,['full','short'])||!enumOf(x.genreSize,['standard','large'])||
    !enumOf(x.scopeOrder,['genresFirst','periodFirst'])||!enumOf(x.yearRail,['belowFilters','aboveFilters','hidden'])||typeof x.showCounts!=='boolean'||
    !exact(x.icons,Object.keys(iconTokens))||Object.keys(iconTokens).some(k=>!enumOf(x.icons[k],iconTokens[k])))return null;
 return Object.freeze({schema:2,density:x.density,accent:x.accent,genreOrder:Object.freeze([...x.genreOrder]),genreLayout:x.genreLayout,genreLabels:x.genreLabels,genreSize:x.genreSize,scopeOrder:x.scopeOrder,yearRail:x.yearRail,showCounts:x.showCounts,icons:Object.freeze({...x.icons})});
}
function parse(raw){if(typeof raw!=='string'||new TextEncoder().encode(raw).length>4096)return null;try{return validate(JSON.parse(raw))}catch{return null}}
const values=new WeakMap(), mounts=new WeakMap();
function layout(element){const config=values.get(element);return config?.schema===2?config:layoutDefaults}
function apply(element,x){
 const config=validate(x);if(!config||!element)return false;
 element.dataset.density=config.density;element.dataset.accent=config.accent;values.set(element,config);
 const doc=element.ownerDocument,recipe=layout(element);
 if(doc){
  const html=doc.documentElement,nav=doc.querySelector('.scope>.tiles'),scope=doc.querySelector('.scope');
  for(const [k,v] of Object.entries({GenreLayout:recipe.genreLayout,GenreLabels:recipe.genreLabels,GenreSize:recipe.genreSize,ScopeOrder:recipe.scopeOrder,YearRail:recipe.yearRail,ShowCounts:String(recipe.showCounts)}))html.dataset['tf'+k]=v;
  if(nav&&scope&&element.parentElement){
   let mount=mounts.get(element);
   if(!mount){const anchor=doc.createComment('Time Flight year rail home');element.before(anchor);mount={anchor,scopeChildren:[...scope.children]};mounts.set(element,mount);}
   const active=doc.activeElement;
   const ordered=recipe.genreOrder.map(k=>nav.querySelector('#tile-'+k));
   if(ordered.every(Boolean)&&ordered.some((b,i)=>nav.children[i]!==b))for(const b of ordered)nav.append(b);
   const children=mount.scopeChildren.filter(b=>b.parentElement===scope);
   const period=children.filter(b=>b.matches('.year-range,.view-tools'));
   const target=recipe.scopeOrder==='periodFirst'?[...period,...children.filter(b=>!period.includes(b))]:children;
   if(target.some((b,i)=>scope.children[i]!==b))for(const b of target)scope.append(b);
   if(recipe.yearRail==='aboveFilters'){if(element.nextElementSibling!==scope)scope.before(element);}
   else if(mount.anchor.nextSibling!==element)mount.anchor.after(element);
   if(active&&active.isConnected&&doc.activeElement!==active)active.focus?.({preventScroll:true});
  }
  doc.dispatchEvent(new doc.defaultView.CustomEvent('timeflight:presentation-changed'));
 }
 return true;
}
function current(element){return values.get(element)||validate({schema:1,density:element.dataset.density,accent:element.dataset.accent})||defaults}
const api=Object.freeze({defaults,layoutDefaults,validate,parse,apply,current,layout});
if(typeof module==='object'&&module.exports)module.exports=api;else root.TimeFlightNextPresentation=api;
})(typeof window==='undefined'?globalThis:window);
