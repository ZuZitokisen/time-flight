/* Same-origin static JSON transport. No tokens, remote APIs or service worker. */
(function(root){
'use strict';
const requests=new Map();let manifest,base,detailsReady=false,detailRequest;
function decode(p){if(p?.format==='timeline-shape-table-v1'){function read(v){if(!Array.isArray(v))return v;if(v[0]===-2)return p.strings[v[1]];if(v[0]===-1)return v.slice(1).map(read);const keys=p.shapes[v[0]],o={};if(!keys||keys.length!==v.length-1)throw new Error('Invalid shape');keys.forEach((key,i)=>Object.defineProperty(o,key,{value:read(v[i+1]),enumerable:true,writable:true,configurable:true}));return o;}return read(p.data);}if(!p||p.format!=='timeline-node-table-v1')return p;function read(id){const n=p.nodes[id];if(n[0]===0)return n[1];if(n[0]===2)return n.slice(1).map(read);const o={};for(let i=1;i<n.length;i+=2)Object.defineProperty(o,read(n[i]),{value:read(n[i+1]),enumerable:true,writable:true,configurable:true});return o}return read(p.root)}
function json(url,immutable=true){const key=String(url);if(requests.has(key))return requests.get(key);const pending=fetch(key,{credentials:'omit',cache:immutable?'force-cache':'no-cache'}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).then(decode).catch(e=>{requests.delete(key);throw e});requests.set(key,pending);return pending;}
function dataURL(path){const url=new URL(path,base);if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname.slice(0,base.pathname.lastIndexOf('/')+1)))throw new Error('Invalid data path');return url;}
async function pool(items,limit,work){let next=0;await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{while(next<items.length){const i=next++;await work(items[i],i)}}));}
function merge(target,source){for(const [k,v] of Object.entries(source)){if(Array.isArray(v)&&Array.isArray(target[k]))target[k].splice(0,target[k].length,...v);else if(v&&typeof v==='object'&&!Array.isArray(v)&&target[k]&&typeof target[k]==='object'&&!Array.isArray(target[k]))merge(target[k],v);else target[k]=v;}}
async function load(path='./data/manifest.json'){
 base=new URL(path,root.location.href);manifest=await json(base,false);
 if(manifest.schema!==1||!Array.isArray(manifest.records))throw new Error('Invalid manifest');
 const db=await json(dataURL(manifest.core));db.records=new Array(manifest.recordCount);
 await pool(manifest.records,4,async part=>{const rows=await json(dataURL(part.file));if(rows.length!==part.count)throw new Error('Record count mismatch');for(const [index,row] of rows){if(!Number.isInteger(index)||index<0||index>=db.records.length||db.records[index]!==undefined)throw new Error('Invalid record position');db.records[index]=row;}});
 if(db.records.includes(undefined)||new Set(db.records.map(r=>r.id)).size!==db.records.length)throw new Error('Incomplete records');
 return db;
}
function ensureDetails(db){
 if(detailsReady)return Promise.resolve(db);if(detailRequest)return detailRequest;
 detailRequest=json(dataURL(manifest.details)).then(extra=>{merge(db,extra);detailsReady=true;return db;}).catch(e=>{detailRequest=undefined;throw e;});return detailRequest;
}
root.TimeFlightData=Object.freeze({load,ensureDetails,isDetailsReady:()=>detailsReady});
})(typeof window==='undefined'?globalThis:window);
