
(async()=>{

'use strict';function unpackTimelinePayload(p){if(!p||p.format!=='timeline-node-table-v1')return p;function read(id){const n=p.nodes[id];if(n[0]===0)return n[1];if(n[0]===2)return n.slice(1).map(read);const o={};for(let i=1;i<n.length;i+=2)Object.defineProperty(o,read(n[i]),{value:read(n[i+1]),enumerable:true,writable:true,configurable:true});return o}return read(p.root)}
function appendUnallocatedDays(a,e){const rows=e.unallocated_day_song_references||[];if(!rows.length)return;const d=node('details');d.append(node('summary','日単位の参考曲（部・ステージ未確定）'));for(const r of rows)d.append(node('p',r.title,'songhead'),node('p',r.public_note,'notice'),sourceLink(r.source_url));a.append(d)}
function appendIndividualRecordings(a,e){const rows=e.individual_recorded_singing_links||[];if(!rows.length)return;const d=node('details');d.append(node('summary','個人の録画弾き語り（公演とは別）'));for(const r of rows){d.append(node('p',r.person+' / '+r.title,'songhead'),node('p','公開日：'+(r.publication_date||'未確認')+' / 報告日：'+(r.report_date||'未記載')+' / 収録日：未確認','meta'),node('p',r.public_note,'notice'));for(const u of r.source_urls||[])d.append(sourceLink(u));if(r.video_url)d.append(sourceLink(r.video_url));}a.append(d)}
function appendPrejoinLinks(a,e){const rows=e.member_prejoin_participation_links||[];if(!rows.length)return;const d=node('details');d.append(node('summary','加入前の個人ユニット参加（当時の本編とは別）'));for(const r of rows){d.append(node('p',r.person+' / '+r.performance_credit,'songhead'),node('p','加入前の個人活動として参加確認。当時のときめき♡宣伝部の本編・通常披露行には加算していません。個別歌割りは未確認。','notice'));const ev=DB.records.find(x=>x.id===r.event_id),song=(DB.song_catalog||[]).find(x=>x.id===resolveSongID(r.song_id));if(e.kind==='song'&&ev)d.append(internalButton('個人参加が記録されたイベント',[ev],'加入前の個人ユニット参加'));else if(song)d.append(internalButton('個人ユニットで披露した作品を見る',[song],'加入前の個人ユニット参加・本編とは別'));for(const s of r.sources||[])if(s.url)d.append(sourceLink(s.url))}a.append(d)}
function validateTimelineData(d){
 if(!d||!Array.isArray(d.records)||!Array.isArray(d.song_catalog))throw Error('records / song_catalog が必要です');
 const all=[...d.records,...d.song_catalog];const ids=new Set;
 for(const r of all){if(!r||typeof r.id!=='string'||!r.id||typeof r.title!=='string'||ids.has(r.id))throw Error('ID重複またはレコード形式不正');ids.add(r.id);}
 const events=new Map(d.records.map(r=>[r.id,r]));const catalog=new Set(d.song_catalog.map(r=>r.id));
 for(const r of d.records)for(const s of r.songs||[])if(s.song_id&&!catalog.has(s.song_id))throw Error('楽曲参照が見つかりません：'+s.song_id);
 for(const c of d.song_catalog)for(const o of c.occurrences||[])if(!events.has(o.event_id))throw Error('公演参照が見つかりません：'+o.event_id);
 return d;
}
/* Shared by the private Web copy and next-version offline iPhone HTML. */
(function(root){
'use strict';
function dateKey(value){
 const s=String(value||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return null;
 const d=new Date(s+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s?s:null;
}
function clock(value){const m=String(value||'').normalize('NFKC').match(/(?:^|[^\d])(\d{1,2}):(\d{2})(?!\d)/);return m&&+m[1]<24&&+m[2]<60?+m[1]*60 + +m[2]:null;}
function part(value){const s=String(value||'').normalize('NFKC'),m=s.match(/第?\s*(\d+)\s*部/);if(m)return +m[1];if(/昼公演|昼の部/.test(s))return 1;if(/夜公演|夜の部/.test(s))return 2;return null;}
function entries(song,records){
 const events=new Map(records.filter(r=>r.kind==='live').map(r=>[r.id,r]));
 return [...(song.occurrences||[]).map(row=>({type:'event',row,event:events.get(row.event_id)})),...(song.day_occurrences||[]).map(row=>({type:'day',row}))].map((e,index)=>{
  const r=e.event||{},o=e.row,session=o.session||r.session||'';
  return {...e,index,date:dateKey(r.date)||dateKey(o.event_date)||dateKey(o.date),time:e.type==='day'?null:(clock(r.time)??clock(o.event_time)??clock(o.time)??clock(session)),part:e.type==='day'?null:part(session)};
 });
}
function optional(a,b,direction){if(a===null)return b===null?0:1;if(b===null)return -1;return (a<b?-1:a>b?1:0)*direction;}
function sorted(song,records,order='new'){
 const direction=order==='old'?1:-1;
 return entries(song,records).sort((a,b)=>optional(a.date,b.date,direction)||optional(a.time,b.time,direction)||optional(a.part,b.part,direction)||a.index-b.index);
}
function append(container,song,records,ui){
 const {node,str,navigateRecords,sourceLink,internalButton}=ui;
 const controls=node('div',undefined,'performance-order'),list=node('div',undefined,'performance-list');
 controls.setAttribute('style','display:flex;gap:8px;flex-wrap:wrap');controls.setAttribute('role','group');controls.setAttribute('aria-label','楽曲の披露公演の並び順');
 const newer=node('button','NEW'),older=node('button','OLD');
 newer.setAttribute('aria-label','披露公演を新しい順（NEW）');older.setAttribute('aria-label','披露公演を古い順（OLD）');
 controls.append(newer,older);container.append(controls,node('p','公演日順。時刻・部が不明な記録は同日の末尾、日付不明は最後に表示します。','meta'),list);
 function draw(order){
  newer.setAttribute('aria-pressed',String(order==='new'));older.setAttribute('aria-pressed',String(order==='old'));
  for(const [button,active] of [[newer,order==='new'],[older,order==='old']])button.setAttribute('style',active?'background:#f9f1ea;border-color:var(--pink,#a9672d);font-weight:700':'');
  list.replaceChildren();
  for(const entry of sorted(song,records,order)){
   const occ=entry.row,event=entry.event||{};
   if(entry.type==='day'){
    const row=node('p');row.dataset.performanceDate=entry.date||'';
    row.append(node('span',(entry.date||'日付不明')+' / 当日の特典会後（部の明記なし） / 曲順：'+(occ.sequence??'未確認')));
    const related=(occ.related_event_ids||[]).map(id=>records.find(r=>r.id===id)).filter(Boolean);
    if(related.length)row.append(internalButton('同日の関連公演（部の帰属は未確定）',related,'当日の特典会後・部未特定'));
    if(occ.source_url)row.append(sourceLink(occ.source_url));list.append(row);continue;
   }
   if(occ.aki_singing_excluded)list.append(node('p','歌唱者：'+str(occ.performers)+'。菅田愛貴は歌唱対象外。','notice'));
   const row=node('p');row.dataset.performanceDate=entry.date||'';row.dataset.eventId=occ.event_id;
   const button=node('button',[entry.date||'日付不明',event.time||occ.event_time||occ.time,occ.event_title||event.title,occ.session||event.session,'曲順：'+(occ.sequence??'不明')].filter(Boolean).join(' / '));
   button.onclick=()=>navigateRecords([occ.event_id],'楽曲の披露公演');row.append(button);
   if(occ.source_url)row.append(sourceLink(occ.source_url));list.append(row);
  }
 }
 newer.onclick=()=>draw('new');older.onclick=()=>draw('old');draw('new');
}
const api={dateKey,clock,part,entries,sorted,append};root.TimeFlightPerformanceOrder=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window==='undefined'?globalThis:window);

let DB=unpackTimelinePayload(await window.TimeFlightData.load('./data-manifest.9d1d89dccdca.json'));let visible=[],limit=50,draftSongs=[],draftEvent=null,loadInProgress=false,directIds=null,navigationLabel="",navigationStack=[];const $=s=>document.querySelector(s),safeUrl=u=>{try{let p=new URL(u);return p.protocol==='https:'||p.protocol==='http:'?p.href:null}catch{return null}},str=v=>Array.isArray(v)?v.join('・'):v==null?'':String(v);const segment={main:'本編',encore:'アンコール',double_encore:'ダブルアンコール',medley:'メドレー',unknown:'区分不明'};function node(tag,text,cls){let n=document.createElement(tag);if(text!==undefined)n.textContent=publicText66(text);if(cls)n.className=cls;return n}function link(u,text){if(isNonOfficialSource(u))return node('span','非公式情報');let x=safeUrl(u);if(!x)return node('span','URL未確認');let a=node('a',text||u);a.href=x;a.target='_blank';a.rel='noopener noreferrer';return a}function members(r){return str(r.members||r.performers||r.member)}function songs(r){return (r.songs||[]).filter(s=>s.publication_confirmation_v76r2?.state!=='candidate')}function songName(s){return s.song_title||s.title||''}function segmentName(s){if(s.segment==='short_excerpt')return '短い合唱（抜粋）';if(s.segment==='curtain_call')return 'カーテンコール';if(s.segment==='member_unit')return '本人参加ユニット（グループ本編とは別）';if(s.segment==='medley_component')return 'メドレー内抜粋';if(s.segment==='double_encore')return 'Wアンコール';if(s.segment==='collaboration')return 'コラボ（絶対曲順未確認）';if(s.segment==='before_main')return '入場時の歌唱';if(s.segment==='post_benefit')return '特典会後';return segment[s.segment]||s.segment||'区分不明'}function eventText(e){return [e.title,e.date||'日付不明',e.time||'',e.session,e.venue].filter(Boolean).join(' / ')}function sourceUrls(e){return [...new Set([e.source_url,e.url,...(e.additional_sources||[]).map(x=>x.url),...songs(e).map(s=>s.source_url),...songs(e).map(s=>s.corroboration_url),...(e.blog_relations||[]).filter(x=>x.classification==='official').map(x=>x.url)].filter(Boolean))]}
// Public provenance policy: keep raw URLs in DB; only classified official/reporting sources may leave the data layer.
let sourcePolicyData66=null,sourcePolicy66=new Map();
function normalizeSourceClass66(value){const v=String(value||'').toLowerCase();if(/unofficial|fan|crowdsourc|user_contribut/.test(v))return /official/.test(v.replaceAll('unofficial',''))&&/unofficial/.test(v)?'mixed':'unofficial';if(/^official(?:_|$)/.test(v)||['primary','primary_source'].includes(v))return 'official';if(['reporting','press'].includes(v)||/music_news|news_report/.test(v))return 'reporting';return null}
function sourceKey66(u){try{const p=new URL(u);return ['http:','https:'].includes(p.protocol)?p.href:null}catch{return null}}
function ensureSourcePolicy66(){if(sourcePolicyData66===DB)return;sourcePolicyData66=DB;sourcePolicy66=new Map();const put=(u,c,rank)=>{const k=sourceKey66(u);if(!k||!c||c==='mixed')return;const old=sourcePolicy66.get(k);if(!old||rank>old.rank||(rank===old.rank&&c==='unofficial'))sourcePolicy66.set(k,{classification:c,rank})};for(const [url,meta]of Object.entries(DB.source_registry||{}))put(url,normalizeSourceClass66(meta.classification),3);const walk=x=>{if(Array.isArray(x)){x.forEach(walk);return}if(!x||typeof x!=='object')return;const own=normalizeSourceClass66(x.source_classification)||normalizeSourceClass66(x.source_type)||normalizeSourceClass66(x.evidence_type)||normalizeSourceClass66(x.classification)||(x.official===true?'official':x.official===false?'unofficial':null);for(const [key,value]of Object.entries(x)){const prefix=key.replace(/_urls?$/,'');const specific=normalizeSourceClass66(x[prefix+'_classification'])||normalizeSourceClass66(x[prefix+'_type']);const cls=specific||own;const sourceField=/^(url|source|source_url|source_urls|evidence_url|evidence_urls|reference_url|reference_urls|corroboration_url|order_source_url|secondary_order_source_url|performance_source_url|date_venue_source|historical_source|original_reference_url|official_url|official_post_url|public_url)$/.test(key);if(sourceField){if(typeof value==='string')put(value,cls,2);else if(Array.isArray(value))value.filter(v=>typeof v==='string').forEach(u=>put(u,cls,2))}walk(value)}};walk(DB)}
function sourceClassification66(u){ensureSourcePolicy66();const found=sourcePolicy66.get(sourceKey66(u));return found?.classification||(isOfficialSource(u)?'official':'unofficial')}
function publicSourceUrl66(u){return ['official','reporting'].includes(sourceClassification66(u))?safeUrl(u):null}
function publicText66(value){return str(value).replace(/https?:\/\/[^\s<>"'\u3000\u3001\u3002\uff0c\uff09]+/g,raw=>{const url=raw.replace(/[),.;\]}]+$/,'');return publicSourceUrl66(url)?raw:'非公式情報'+raw.slice(url.length)})}
function isOfficialSource(u){return DB.source_registry?.[u]?.classification==='official'}function songSourceTag(s){return s.source_classification==='official'?'公式情報':s.source_classification==='unofficial'?'非公式情報':sourceTag(s.source_url)}function sourceTag(u){return {official:'公式情報',reporting:'報道情報（第三者）',unofficial:'非公式情報'}[sourceClassification66(u)]||'非公式情報'}function isNonOfficialSource(u){return !!u&&!publicSourceUrl66(u)}function sourceLink(u){return isNonOfficialSource(u)?node('span','非公式情報'):link(u,sourceTag(u)+'：'+u)}function privateSong(s){return normalizeSourceClass66(s.source_classification)==='unofficial'||normalizeSourceClass66(s.evidence_type)==='unofficial'||isNonOfficialSource(s.source_url)}function publicEvidence(s){return privateSong(s)?(s.public_evidence_note||[s.evidence_inferred?'曲目は資料の記述からの解釈。曲順未確認。':'',s.performance_context||'',s.collaboration_note||''].filter(Boolean).join(' / ')):s.evidence_note}function privateEvent(e){return sourceUrls(e).some(isNonOfficialSource)||songs(e).some(privateSong)}function publicEventNote(e){return e.public_notes||(privateEvent(e)?'非公式情報':e.notes||e.note||'')}function publicVerification(s){return privateSong(s)?(s.evidence_inferred?'記述からの解釈・曲順未確認':'非公式情報（全編性・演奏尺は未確認）'):(s.verification_label||s.verification_status||'原調査の記録による')}function appendWorkCreditLinks(a,e){let links=(e.work_credit_links||[]).filter(x=>['clear_orthographic_alias','confirmed_work_alias_by_event_context'].includes(x.classification));let ids=[...new Set(links.flatMap(x=>x.target_song_ids||[]))].filter(id=>id!==e.id);let targets=(DB.song_catalog||[]).filter(c=>ids.some(id=>resolveSongID(id)===c.id));if(targets.length){let d=node('details');d.append(node('summary','表記差で関連付けた作品の作詞・作曲'));for(let x of links)if(x.classification==='confirmed_work_alias_by_event_context')d.append(node('p','公演文脈で作品同定を確認した対象日：'+(x.event_dates||[]).join('・')+'。録音・編曲は未統合。','notice'));for(let c of targets){d.append(internalButton('作品の根拠を確認：'+c.title,[c],'表記差の作品リンク・録音未統合'));for(let cr of c.recording_credits||[]){let roles=cr.credits||{};let r=cr.recording||{};d.append(node('p','参照元：'+[c.title,r.version,r.release_title||r.album_title||r.single_title].filter(Boolean).join(' / '),'meta'));for(let [role,label]of [['lyricists','原曲の作詞'],['composers','原曲の作曲']]){let known=cr.role_status?.[role]!=='conflict'&&(roles[role]||[]).length;d.append(node('p',label+'：'+(known?(role==='lyricists'&&cr.lyric_role_details?.length?cr.lyric_role_details.filter(x=>x.role==='original_lyrics').map(x=>x.name):roles[role]).join('・'):'未確認'),'meta'));}if(cr.lyric_role_details?.some(x=>x.role==='訳詞'))d.append(node('p','訳詞：'+cr.lyric_role_details.filter(x=>x.role==='訳詞').map(x=>x.name).join('・'),'meta'));for(let s of cr.sources||[])if(s.url)d.append(sourceLink(s.url));}}d.append(node('p','作品の表記差として参照しています。録音は未統合。今回のライブ編曲者は未確認で、参照元の編曲者を転記していません。','notice'));a.append(d)}let aliases=(DB.song_catalog||[]).filter(c=>(e.work_credit_alias_ids||[]).some(id=>resolveSongID(id)===c.id));if(aliases.length)a.append(internalButton('関連する表記の披露記録',aliases,'表記差の関連記録・録音未統合'));}
function appendReferenceWorks(a,e){for(let r of (e.reference_work_credits||[]).filter(x=>!x.superseded_by)){let d=node('details');let matched=['official_collaboration_identified','confirmed_work_link','confirmed_work_link_participation_unconfirmed','work_link_supported_nonofficial'].includes(r.performance_work_link_status);let review=r.performance_work_link_status==='confirmed_work_link_participation_unconfirmed';d.append(node('summary',matched?'原曲作品の参照情報（作品対応を確認）':'原曲作品の参照候補（実演との同定は未確定）'));d.append(node('p','参照曲：'+r.title+' / 参照歌唱者・作品元：'+r.reference_recording_performer,'meta'));for(let [role,label]of [['lyricists','参照作品の作詞'],['composers','参照作品の作曲']])d.append(node('p',label+'：'+(role==='lyricists'&&r.lyricists_status==='not_applicable_to_instrumental_original'?'該当なし':((r.work_credits?.[role]||[]).join('・')||'未確認')),'meta'));d.append(node('p','原曲作品の情報です。'+(review?'作品は同定済みですが、本人の当日歌唱は要再確認。':matched?'指定公演の資料との作品対応を確認。':'今回の披露曲と同一作品かは候補の段階です。')+' 今回のライブ編曲者は未確認。参照録音の編曲者は転記していません。','notice'));let candidates=r.research_evidence?.unconfirmed_credit_candidates;if(candidates?.composers?.length)d.append(node('p','未確認の作曲候補（検索断片のみ）：'+candidates.composers.join('・'),'notice'));if(r.lyricists_status==='not_applicable_to_instrumental_original')d.append(node('p','器楽原作品のため作詞は該当しません。','meta'));if(r.lyric_role_details?.length)d.append(node('p','作詞関連の役割：'+r.lyric_role_details.map(x=>x.role+'：'+x.name).join(' / '),'meta'));if(r.source_specific_credits?.length)d.append(node('p','出典別の作詞表記：'+r.source_specific_credits.map(x=>(x.lyricists||[]).join('・')).join(' / ')+'。共同作詞の省略を不参加の証拠とはしていません。','notice'));if(r.public_scope_note)d.append(node('p',r.public_scope_note,'notice'));if(r.words_contributors?.length)d.append(node('p','ことば提供：'+r.words_contributors.join('・')+'（作詞者とは役割を分けて記録）','meta'));for(let s of r.sources||[])if(s.url){d.append(sourceLink(s.url));if(s.access==='search_excerpt_only')d.append(node('span','検索断片のみ・本文未確認','meta'));}if(r.performance_evidence?.url)d.append(sourceLink(r.performance_evidence.url));a.append(d)}}
function appendNonVocalEventRefs(a,e){if(e.work_origin_note)a.append(node('p',e.work_origin_note,'notice'));let rows=e.non_vocal_event_references||[];if(!rows.length)return;let d=node('details');d.append(node('summary',rows.some(r=>r.activity_kind==='dance')?'ダンス参加の記録（本人歌唱へ未算入）':'観客歌唱・本人伴奏の記録（本人歌唱へ未算入）'));for(let r of rows){d.append(node('p',r.title,'songhead'),node('p',r.public_note,'notice'));let ev=DB.records.find(x=>x.id===r.event_id);if(ev)d.append(internalButton(r.activity_kind==='dance'?'ダンス参加が記録された公演':'観客歌唱・伴奏が記録された公演',[ev],'本人歌唱へ加算しない演目参加'));for(let u of r.source_urls||[])d.append(sourceLink(u));}a.append(d)}
function appendParticipationReviews(a,e){let rows=e.performance_participation_reviews||e.participation_review_occurrences||[];if(!rows.length)return;let d=node('details');d.append(node('summary','本人歌唱の関与を再確認（披露行に未算入）'));for(let r of rows){d.append(node('p',r.title,'songhead'),node('p',r.public_note,'notice'));for(let u of r.source_urls||[])d.append(sourceLink(u));let ev=DB.records.find(x=>x.id===r.event_id);if(ev)d.append(internalButton('関与を確認中の公演', [ev], '本人歌唱の関与を再確認'));let song=(DB.song_catalog||[]).find(c=>c.id===r.song_id);if(song)d.append(internalButton('参照作品を見る',[song],'作品同定と本人歌唱の確認を分離'));}a.append(d)}
function appendMusicalEvidence(a,e){if(!(e.musical_program_evidence||[]).length)return;let d=node('details');d.append(node('summary','公演全体の演目証拠と本人歌唱の確認範囲'));for(let item of e.musical_program_evidence){let s=item.evidence;let label=s.ensemble_attribution_supported_bundle37?'合唱参加に帰属（全員参加証言と配役の接合推定、個人歌唱は直接未確認）':s.member_vocal_confirmed?(s.member_full_song_count_eligible?'役群・キャスト照合による合唱参加確認':'短い合唱参加のみ確認'):'本人歌唱は未確認（他役・公演全体の証拠を含む）';d.append(node('p',s.title+' / '+label,'meta'));let ids=s.source_ids||[];for(let src of e.research_event_evidence?.sources||[])if(ids.includes(src.source_id)&&src.url)d.append(sourceLink(src.url));}d.append(node('p','公演全体の演目を本人の歌唱曲数へ一括加算していません。CD収録曲も各公演へ転記していません。','notice'));a.append(d)}
function appendReferenceSetlists(a,e){for(let ref of e.reference_setlists||[]){if(ref.display_as_reference===false)continue;let d=node('details');d.append(node('summary','参考セットリスト（実演未確認）'));d.append(node('p',ref.public_note,'notice'));d.append(node('p','非公式情報 / 参考'+ref.rows.length+'行。披露曲数・完全セットリスト件数には含めていません。','meta'));for(let r of ref.rows||[]){let row=node('div');row.append(node('span',r.title,'songhead'),node('p','参考資料上の掲載順：'+(r.reported_order??'未記載')+' / 区分：'+(r.reported_section||'未記載')+'。実演の順序・区分としては未確認。','meta'));d.append(row)}for(let u of ref.source_urls||[])d.append(sourceLink(u));a.append(d)}}
function sharedMedia76(e){return (DB.media_track_work_links_v76?.items||[]).filter(t=>t.work_id===e.id)}
function appendSharedMedia76(a,e){const rows=sharedMedia76(e);if(!rows.length)return;const d=node('details');d.append(node('summary','収録媒体からの作品参照（'+rows.length+'件）'));d.addEventListener('toggle',()=>{if(!d.open||d.dataset.loaded)return;d.dataset.loaded='true';d.append(node('p','共通作品対応表の参照。録音の同一性や各公演の演奏との一致は自動確定しません。','notice'));for(const row of rows){const p=(DB.recording_products||[]).find(p=>p.recording_id===row.product_id);const box=node('div');box.append(node('p',[p?.product_title,row.catalog_number,row.disc,row.track_position!=null?'収録順 '+row.track_position:'',row.source_title].filter(Boolean).join(' / '),'meta'));if(p){const releases=releaseRecords(p);if(releases.length)box.append(internalButton('この媒体の発売情報',releases,'共通作品対応表の収録媒体'));}for(const u of row.source_urls||[])box.append(sourceLink(u));d.append(box)}});a.append(d)}
function sharedTrackWorks76(p,title){const rows=(DB.media_track_work_links_v76?.items||[]).filter(t=>(t.product_id===p.recording_id||t.catalog_number===p.catalog_number)&&normalizedTitle(t.source_title||'')===normalizedTitle(title));return [...new Set(rows.map(t=>t.work_id))].map(id=>(DB.song_catalog||[]).find(s=>s.id===id)).filter(Boolean)}
function appendMediaTrackDetails(parent,p){if(!p.recording_research_evidence)return;let d=node('details');d.append(node('summary','媒体の収録表・照合状況'));d.append(node('p',p.public_media_note||'媒体収録順と公演実演順は別です。','notice'));if(p.catalog_number==='PDCS-1905')d.append(node('p','旧公式告知は21曲、現行の商品掲載は22曲。両方の資料を保持し、実盤による確認は未実施です。','notice'));if(p.catalog_number==='AVCD-96613～4')d.append(node('p','公式現行ページの3・6曲目に表記差があります。当時の公式番号付き発表と特設ページを採用し、原表記も保持しています。','notice'));if(p.media_track_list_ref)d.append(node('p','共通の混合CD収録表は別の公演関連行に一度だけ保存。採用公演日は未確認。','notice'));if(!(p.media_tracks||[]).length&&!p.media_track_list_ref)d.append(node('p','この媒体の個別チャプター・収録曲一覧は未確認。別媒体の曲目を転記していません。','meta'));for(let t of p.media_tracks||[]){let title=t.title||t.title_raw||t.title_as_source||t.title_normalized||'';let n=t.media_track_number??t.media_track_order??t.recording_program_position??t.track_number;d.append(node('p',(n!=null?'媒体内 '+n+'：':'')+title,'songhead'));if(t.event_link_mapping){const m=t.event_link_mapping,ev=DB.records.find(x=>x.id===m.event_id);d.append(node('p','照合区分：'+({opening_act:'オープニングアクト',momoclo_tribute:'ももクロトリビュート',all_cast_group_participation:'オールキャスト（個人歌割り未確認）'}[m.scope]||m.scope)+' / 物理チャプター未確認','meta'));if(ev)d.append(internalButton('照合した公演・区分を見る',[ev],'媒体掲載項目に対応する既存公演'));}if(t.member_vocal_count_eligible===false||['stage_magic_performance','mascot_dancers_audience_segment','documentary'].includes(t.kind))d.append(node('p','非歌唱・観客参加などの媒体項目。本人歌唱行には加算していません。','notice'));let matches=DB.song_id_redirects_v76?sharedTrackWorks76(p,title):(DB.song_catalog||[]).filter(c=>c.artist_identity==='ときめき♡宣伝部／超ときめき♡宣伝部'&&[c.title,...(c.title_aliases||[])].some(alias=>normalizedTitle(alias)===normalizedTitle(title)));if(matches.length)d.append(internalButton('同名作品の候補（録音未照合）',matches,'媒体の曲名から作品候補・録音未統合'));}parent.append(d)}
function appendCreditGapAudit(a,e){if(!(e.credit_gap_review_bundle39||[]).length)return;const d=node('details');d.append(node('summary','作者情報の未解決事項'));for(const r of e.credit_gap_review_bundle39){d.append(node('p',r.finding,'notice'),node('p','次の確認：'+r.next_verification,'meta'));for(const s of r.sources||[]){d.append(node('p','資料の確認範囲：'+s.access,'meta'));d.append(sourceLink(s.url));}}a.append(d)}
function appendReferenceRecordings(a,e){const rows=e.reference_recording_versions||[];if(!rows.length)return;const d=node('details');d.append(node('summary','参照録音版（当日の実演とは別）'));for(const v of rows){const r=v.recording||{};d.append(node('p',[v.title,r.release_title,r.version_label,r.catalog_number,r.disc!=null?'Disc '+r.disc:'',r.track!=null?'Track '+r.track:'',r.duration].filter(Boolean).join(' / '),'songhead'));for(const [role,label]of [['lyricists','作詞'],['composers','作曲'],['arrangers','この参照録音の編曲']])d.append(node('p',label+'：'+((v.credits?.[role]||[]).join('・')||'未確認'),'meta'));d.append(node('p',(v.evidence_label||'販売店の商品本文')+'による録音版限定の情報です。当日のライブ編曲・使用音源は未確認で、ここから転記しません。'+(v.variant_scope_note||'Repriseと原版は別録音として保持します。'),'notice'));if(v.recording_scope_status&&v.recording_scope_status!=='catalog_track_verified')d.append(node('p','この参照録音の品番・トラックは一部未特定です。出典が述べた録音・編曲実績の範囲を保持します。','notice'));if(typeof v.recording_includes_julia==='boolean')d.append(node('p','この参照録音の杏ジュリア参加：'+(v.recording_includes_julia?'あり':'なし')+'（ライブ各回の歌唱とは別）','notice'));if(v.performer_scope_note)d.append(node('p',v.performer_scope_note,'notice'));for(const s of v.sources||[])if(s.url)d.append(sourceLink(s.url));}a.append(d)}
function appendCredits(a,e){let cs=e.recording_credits||[];let d=node('details');d.open=true;d.append(node('summary','作詞・作曲・編曲'));if(!cs.length){for(const label of ['作詞','作曲','編曲'])d.append(node('p',label+'：未確認','meta'));let linked=(e.work_credit_links||[]).some(x=>x.target_song_ids?.length)||(e.reference_work_credits||[]).some(r=>['confirmed_work_link','confirmed_work_link_participation_unconfirmed','work_link_supported_nonofficial'].includes(r.performance_work_link_status));let candidate=(e.work_identity_candidates||[]).some(x=>x.candidate_song_ids?.length)||(e.reference_work_credits||[]).length;if(linked)d.append(node('p','この披露の録音版・ライブ編曲は未確認。作品の作詞・作曲は作品参照欄で確認できます。','meta'));else if(candidate)d.append(node('p','録音版クレジットは未確認。関連作品・原曲の候補は別欄に表示しています。同定と録音の確認を区別します。','meta'));else d.append(node('p','このレコードの録音版クレジットは未収録です。作品資料と録音版の対応を確認してから登録します。','meta'));}for(let c of cs){let r=c.recording||{};d.append(node('p',[({'original_studio_single':'当初スタジオ・シングル録音','original_studio_recording':'当初スタジオ録音','original_download_bonus_recording':'どどどどどりーまー 全曲DL特典楽曲','original_single_M1':'当初シングルM1録音','original_EP_track':'当初EP収録録音','unresolved_2016_song':'録音版未確定','2020_studio_album_version':'2020年スタジオ・アルバム版','2021_cho_studio_version':'2021年超verスタジオ録音'}[r.version]||r.version||'録音版未確認'),r.release_date||r.release_date_as_listed_by_source||r.album_release_date||r.cd_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date||r.album_cd_release_date||r.source_listed_release_date,r.release_title||r.album_title||r.single_title,c.performer_at_release||c.performer,r.edition,r.catalog_number||r.catalog,r.track?'トラック '+r.track:''].filter(Boolean).join(' / '),'meta'));for(let [role,label]of [['lyricists','作詞'],['composers','作曲'],['arrangers','編曲']])d.append(node('p',label+'：'+(c.role_status?.[role]==='conflict'?'資料間不一致・未確定':((c.credits?.[role]||[]).join('・')||'未確認'))+(String(c.role_status?.[role]||'').includes('nonofficial')?'（非公式情報）':''),'meta'));d.append(node('p','表示したクレジットは上記録音版の情報です。再録音・ライブ演奏版の編曲者は別途確認が必要です。','notice'));for(let assertion of c.official_credit_assertions||[]){let roles=assertion.official_raw_credits||{};d.append(node('p','公式資料の原表記（既存資料の表記と別保持）','notice'));for(let [role,label]of [['lyricists','作詞'],['composers','作曲'],['arrangers','編曲']])if(roles[role]?.length)d.append(node('p',label+'：'+roles[role].join('・'),'meta'));d.append(node('p','この資料の未掲載者を理由に、既存の共同作者・共同編曲者を削除していません。','notice'));if(assertion.source?.url)d.append(sourceLink(assertion.source.url));}if((c.lyric_role_details||[]).length)d.append(node('p','作詞関連の役割：'+c.lyric_role_details.map(x=>x.role+'：'+x.name).join(' / '),'meta'));if(c.direct_description_check_bundle45)d.append(node('p','公式YouTubeの作者情報は検索表示のみ。Macロックにより説明欄本文未確認で、作者の確定欄へ未昇格です。','notice'));if((c.evidence_bundle45||[]).some(x=>x.operation==='append_distribution_role_evidence'))d.append(node('p','編曲は当該feat.コレサワ版の正規配信メタデータによる確認です。ブックレット現物は未確認。','notice'));if(c.status==='arranger_conflict_hold')d.append(node('p','作者名の真吾／真悟、編曲者の人数に資料間の不一致があり未解決です。候補を確定値へ昇格していません。','notice'));for(let s of c.sources||[])if(s.url)d.append(sourceLink(s.url));}a.append(d)}
function txt(e,ss=songs(e),isDraft=false){const lines=ss.map((s,i)=>{let n=isDraft?i+1:e.order_unverified?null:s.sequence;return (n===null||n===undefined||n===''?'':String(n)+'\t')+songName(s)});const detail=ss.map((s,i)=>'掲載項目 '+(i+1)+'：'+[!songName(s)?'曲名未確認':'',s.sequence===null||s.sequence===undefined?'曲順未確認':'', '情報区分：'+songSourceTag(s),'照合：'+publicVerification(s),'区分：'+segmentName(s),s.cover_status==='cover'?'カバー（原歌唱者：'+(s.original_artist||'未確認')+'）':'','演奏尺：'+(s.performance_extent||'未確認'),publicEvidence(s)].filter(Boolean).join(' / '));return publicText66([(isDraft?'【作成した下書き】\n':'')+eventText(e),'',...lines,'','詳細','原記録の確認状況：'+((e.completeness==='reported_complete'?'資料掲載範囲の全曲確認済み':e.completeness)||({recorded_published:'事前収録映像の公開確認（収録日未確認）',performed:'開催確認済み（原調査）',scheduled_past_unverified:'過去の開催告知あり・実施は未確認',reported_performed_unverified:'非公式の開催記録・未照合',performed_reported:'開催記録あり',scheduled:'開催予定'}[e.status]||e.status||'未確認')),...detail,'','備考：'+(publicEventNote(e)||'なし'),'','出典：',...sourceUrls(e).map(u=>isNonOfficialSource(u)?'非公式情報':sourceTag(u)+'：'+u),'','注：不明な曲順・演奏尺・区分は推定していません。サブスクへの登録は行っていません。'].join('\n'))}
function songTitleRow(s,order){let row=node('div',undefined,'songhead');row.style.display='flex';row.style.gap='12px';let number=node('span',order===null||order===undefined?'':String(order),'song-number');number.style.minWidth='2em';row.append(number,node('span',songName(s),'song-title'));return row}
function songDetails(s){let detail=node('details',undefined,'song-details');detail.append(node('summary','詳細'));detail.append(node('p',[!songName(s)?'曲名未確認':'',s.sequence===null||s.sequence===undefined?'曲順未確認':'','情報区分：'+songSourceTag(s),'照合：'+publicVerification(s),'区分：'+segmentName(s),s.cover_status==='cover'?'カバー（原歌唱者：'+(s.original_artist||'未確認')+'）':'',str(s.performers),s.arrangement?'演奏形態：'+s.arrangement:'',s.arrangement_note||'',s.instrument_performer?'楽器担当：'+s.instrument_performer:'',s.relative_position?'相対位置：'+s.relative_position:'',s.event_position?'イベント通番：'+s.event_position:'',s.segment_scope?'区分内：'+s.segment_scope:'',s.segment_sequence?'区分内の掲載位置：'+s.segment_sequence:'',s.part?'担当パート：'+s.part:'',s.participation||'',s.performer_scope||'',s.instrument?'楽器：'+s.instrument:'',s.base_song_as_reported?'原曲の記載：'+s.base_song_as_reported:'',s.medley_component_order?'メドレー内順：'+s.medley_component_order:'','演奏尺：'+(s.performance_extent||'未確認'),publicEvidence(s)].filter(Boolean).join(' / '),'songnote'));return detail}
function csv(e,ss=songs(e),isDraft=false){const rows=[['record_type','event_id','event_date','event_time','event_title','session','venue','position','original_sequence','segment','song_title','song_title_raw','performers','cover_status','original_artist','performance_extent','source_url','source_classification','verification_status','evidence_note'],...ss.map((s,i)=>[isDraft?'draft':'source',e.id,e.date,e.time,e.title,e.session,e.venue,isDraft?i+1:(e.order_unverified?'':s.sequence??''),s.sequence??'',s.segment,songName(s),s.song_title_raw,str(s.performers),s.cover_status,s.original_artist,s.performance_extent,(s.source_video?'':publicSourceUrl66(s.source_url||e.source_url)||''),songSourceTag(s),s.verification_status||'',publicText66(publicEvidence(s))])];return '\uFEFF'+rows.map(r=>r.map(v=>{v=str(v);if(/^[=+@\-\t\r]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"'}).join(',')).join('\r\n')}
function save(content,name,type){let a=node('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name.replace(/[\\/:*?"<>|]/g,'_').slice(0,140);document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}function exportName(e,ext){return (e.date||'date_unknown')+'_'+e.title+'.'+ext}async function copy(e){let t=txt(e);try{await navigator.clipboard.writeText(t);$('#stats').textContent='セットリストをコピーしました'}catch{$('#copyText').value=t;$('#copyDialog').showModal();$('#copyText').select()}}

function internalButton(label,records,context){let b=node('button',label);b.type='button';b.onclick=()=>navigateRecords(records.map(r=>r.id),context||label);return b}
function releaseRecords(p){return DB.records.filter(r=>r.kind==='release'&&(r.products||[]).some(x=>x.recording_id===p.recording_id))}
function relatedBlogs(e){let urls=new Set(sourceUrls(e));return DB.records.filter(r=>r.kind==='blog'&&urls.has(r.url))}
function relatedEvents(blog){return DB.records.filter(r=>r.kind==='live'&&sourceUrls(r).includes(blog.url))}
function appendBlogLinks(parent,e){let blogs=relatedBlogs(e);if(blogs.length){let d=node('details');d.append(node('summary','出典に使われているブログ（'+blogs.length+'件）'));for(let b of blogs)d.append(internalButton(b.date+' / '+b.title,[b],'公演のブログ出典'));parent.append(d)}}
function navigateRecords(ids,label){ids=ids.map(id=>DB.record_aliases?.[id]||id);let entries=[...DB.records,...(DB.song_catalog||[])].filter(r=>ids.includes(r.id));if(!entries.length)return;navigationStack.push({kind:$('#kind').value,applied:{...applied},inputs:Object.fromEntries(Object.keys(applied).map(k=>[k,$('#'+k).value])),ids:directIds,label:navigationLabel,limit});directIds=new Set(entries.map(r=>r.id));navigationLabel=label;applied=defaults();$('#kind').value=entries.every(r=>r.kind===entries[0].kind)?entries[0].kind:'';for(let id of Object.keys(applied))$('#'+id).value=applied[id];filter();$('#navigationContext').scrollIntoView?.({block:'start'});$('#backToResults').focus?.()}
function backToResults(){let prev=navigationStack.pop();if(!prev)return;directIds=prev.ids;navigationLabel=prev.label;applied=prev.applied;$('#kind').value=prev.kind;filter();limit=prev.limit;for(let id of Object.keys(applied))$('#'+id).value=prev.inputs[id];render();$('#navigationContext').scrollIntoView?.({block:'start'})}
function clearNavigation(){directIds=null;navigationLabel='';navigationStack=[]}

let candidateEventWorks66;function occurrenceSummary66(e){if(!candidateEventWorks66){candidateEventWorks66=new Set;for(const r of DB.records)for(const s of r.songs||[])if(s.publication_confirmation_v76r2?.state==='candidate')candidateEventWorks66.add(r.id+'|'+resolveSongID(s.song_id));}const rows=e.occurrences||[];const candidates=rows.some(o=>candidateEventWorks66.has(o.event_id+'|'+e.id));return rows.length+'件の'+(candidates?'関連記録（未照合候補を含む）':'披露記録')}
function appendScopedRoleEvidence66(a,e){const rows=(DB.verified_role_evidence||[]).filter(r=>resolveSongID(r.work_id)===e.id);if(!rows.length)return;const d=node('details');d.append(node('summary','追加資料のクレジット（録音範囲別・'+rows.length+'項目）'));d.addEventListener('toggle',()=>{if(!d.open||d.dataset.loaded)return;d.dataset.loaded='true';d.append(node('p','資料に明示された役割と録音範囲を表示します。標準録音との照合前の資料も含み、別録音・ライブへ役割を転記しません。複合の役割名は原表記のままです。','notice'));const groups=new Map;for(const r of rows){const key=JSON.stringify([r.recording_scope,r.role,r.recording_binding,r.complete_role_list_as_published]);if(!groups.has(key))groups.set(key,{...r,people:[]});let g=groups.get(key);if(!g.people.includes(r.person))g.people.push(r.person);}for(const r of groups.values()){let scope=r.recording_scope||{};const box=node('details');box.append(node('summary',[scope.release_title,scope.version,scope.track!=null?'トラック '+scope.track:'',scope.duration].filter(Boolean).join(' / ')||'録音範囲を確認中'));box.append(node('p',({lyricists:'作詞',composers:'作曲',arrangers:'編曲'}[r.role]||r.role+'（資料原表記）')+'：'+r.people.join('・'),'meta'),node('p',r.recording_binding==='source_scoped_pending_canonical_match'?'資料の対象録音を保持・標準録音との対応は確認中':'資料が示す録音範囲に限定','notice'));if(r.complete_role_list_as_published)box.append(node('p','当該資料の役割欄を保持しています。他資料の共同作者の不参加を証明するものではありません。','meta'));d.append(box)}});a.append(d)}
function appendEventAnnotations66(a,e){for(const r of DB.event_level_annotations||[])if(r.event_id===e.id)a.append(node('p',r.note||'催事単位の参考情報。本人歌唱への追加とは別です。','notice'))}
function appendUnconfirmedCandidates66(parent,e){const rows=(e.songs||[]).filter(s=>s.publication_confirmation_v76r2?.state==='candidate');if(!rows.length)return;const d=node('details');d.append(node('summary','未確認の候補（'+rows.length+'件）'),node('p','当日の曲目・位置が未照合の候補です。上の確認済みセットリストへ加算しません。掲載順は曲順ではありません。','notice'));for(const s of rows)d.append(node('p',songName(s)+' / 未照合候補','meta'));parent.append(d)}
function appendBatch40Context(a,e){if(e.bundle40_session_correction){a.append(node('p','資料の部を訂正：非公式資料の著者本人の観劇は8/6夜。昼の直接観劇証拠とは扱いません。資料は文脈として保持し、歌唱曲を昼夜へ複製していません。','notice'));}const r=e.bundle40_unallocated_day_program_reference;if(r){let d=node('details');d.append(node('summary','初日の日単位資料（昼夜未割当・披露行へ未加算）'),node('p',r.note,'notice'));for(const s of r.songs)d.append(node('p',s.title+' / '+s.section+' / '+s.performer,'meta'));d.append(sourceLink(r.source_url));a.append(d)}}
function renderFullCard(e){let a=node('article');a.dataset.id=e.id;if(e.kind==='song'){a.append(node('div',e.title,'title'),node('p','同定基準：'+e.artist_identity,'meta'),node('p',occurrenceSummary66(e)+'（同じ公演の再演も別項目）','meta'));appendNonVocalEventRefs(a,e);appendIndividualRecordings(a,e);appendPrejoinLinks(a,e);appendParticipationReviews(a,e);appendCredits(a,e);appendScopedRoleEvidence66(a,e);appendCreditGapAudit(a,e);appendWorkCreditLinks(a,e);appendReferenceWorks(a,e);appendReferenceRecordings(a,e);if((e.work_identity_candidates||[]).filter(x=>!x.superseded_by).some(x=>x.candidate_song_ids?.some(id=>id!==e.id))){let wd=node('details');wd.append(node('summary','作品同定の候補（録音は未統合）'));for(let x of e.work_identity_candidates||[]){if(x.superseded_by)continue;let candidates=(DB.song_catalog||[]).filter(c=>(x.candidate_song_ids||[]).some(id=>resolveSongID(id)===c.id)&&c.id!==e.id);if(candidates.length)wd.append(internalButton('作品同定候補：'+candidates.map(c=>c.title).join('・')+'（録音・編曲は未統合）',candidates,'作品同定候補・録音未統合'));}wd.append(node('p','表記違い候補・特別演出版の関連候補です。作者や編曲者は転記していません。','notice'));a.append(wd)}let d=node('details');d.append(node('summary','披露した公演を確認'));window.TimeFlightPerformanceOrder.append(d,e,DB.records,{node,str,navigateRecords,sourceLink,internalButton});let eventIds=new Set(e.occurrences.map(o=>o.event_id));let related=DB.records.filter(r=>r.kind==='live'&&eventIds.has(r.id)).flatMap(r=>(r.recording_candidates||[]).flatMap(releaseRecords));let unique=[...new Map(related.map(r=>[r.id,r])).values()];if(unique.length)d.append(internalButton('披露公演の収録商品候補（楽曲の収録は未照合）',unique,'披露公演の収録商品候補・楽曲収録未照合'));d.append(node('p','収録商品・スタジオ／ライブ／再録音源との対応は未確認です。曲名だけでは音源版を確定しません。','notice'));a.append(d);return a}a.dataset.id=e.id;let t=node('time',(e.date_label?e.date_label+'：':'')+(e.date||'日付不明')+(/^\d{2}:\d{2}$/.test(e.time||'')?' '+e.time:''));a.append(t,node('span',e.kind==='blog'?'ブログ':e.kind==='release'?'リリース':'ライブ・イベント','badge '+(e.kind==='blog'?'blog':'')));a.append(node('div',e.title,'title'));if(e.public_date_semantics)a.append(node('p',e.public_date_semantics,'notice'));a.append(node('div',[e.session,e.venue,members(e)].filter(Boolean).join(' / '),'meta'));if(e.kind==='release'){a.append(node('p',[e.release_type,e.release_status,e.edition,e.package_format,e.catalog_number].filter(Boolean).join(' / '),'meta'),node('p','発売日：'+(e.date||'未確認')+' / 予約開始日：'+(e.reservation_start||'未確認'),'meta'));if(e.source_url)a.append(link(e.source_url,'公式リリース情報'));let d=node('details');d.append(node('summary','収録内容・関連公演を見る'));if(!(e.products||[]).length)d.append(node('p','収録曲・関連公演は未確認です。','meta'));if((e.editions||[]).length){d.append(node('h3','商品形態'));for(let ed of e.editions){let row=node('p',[ed.edition,ed.catalog_number,ed.package_format].filter(Boolean).join(' / '),'meta');d.append(row)}}else d.append(node('p','全商品形態は未確認です。','meta'));for(let p of e.products||[]){d.append(node('p',[p.edition,p.catalog_number,p.package_format,p.disc,p.event_date,p.event_title,p.coverage,p.mix_type,p.source_event_dates?'収録元公演日：'+p.source_event_dates.join('・'):'',p.match_policy,p.notes].filter(Boolean).join(' / '),'meta'));for(let u of p.source_urls||[])d.append(sourceLink(u));appendMediaTrackDetails(d,p);let verified=(p.verified_event_ids||[]).length>0;let ev=DB.records.filter(x=>x.kind==='live'&&((p.verified_event_ids||[]).length?p.verified_event_ids.includes(x.id):Array.isArray(p.candidate_event_ids)?p.candidate_event_ids.includes(x.id):x.date===p.event_date));for(let e2 of ev){let b=node('button',(verified?'収録元公演：':'同日の公演候補：')+e2.title+(e2.session?' / '+e2.session:''));b.onclick=()=>navigateRecords([e2.id],verified?'商品資料と公演情報を照合した収録元':'商品の同日公演候補・対応未確定');d.append(b)}}a.append(d);return a}if(e.kind==='blog'){if(e.blog_record_type==='staff_notice')a.append(node('p','公式の運営告知です。個人メンバーの執筆記事とは区別します。','notice'));if(e.authors?.length)a.append(node('p',(e.author_type==='joint'?'共同著者：':'著者：')+e.authors.join('・'),'meta'));if(e.membership_at_publication==='former_member_post_departure')a.append(node('p','元メンバーの退部後の個人記事。当時のグループ活動・現在メンバーの投稿とは区別します。','notice'));if(e.membership_at_publication==='before_group_formation')a.append(node('p','グループ結成前の個人活動の記事です。','notice'));a.append(node('p',e.status||'取得状態不明','meta'),link(e.url,'ブログを開く'));if(e.note)a.append(node('p',e.note,'meta'));let events=relatedEvents(e);if(events.length){let actions=node('div',undefined,'actions');actions.append(internalButton('このブログを出典に持つ公演（'+events.length+'件）',events,'ブログを出典に持つ公演'));a.append(actions)}return a}a.append(node('p','記録状態：'+(({recorded_published:'事前収録映像の公開確認（収録日未確認）',performed:'開催確認済み（原調査）',scheduled_past_unverified:'過去の開催告知あり・実施は未確認',reported_performed_unverified:'非公式の開催記録・未照合',performed_reported:'開催記録あり',scheduled:'開催予定'}[e.status]||e.status||'未確認'))+' / セットリスト：'+(e.setlist_status_label||({reported_complete:'資料掲載範囲の全曲確認済み',complete:'曲順一覧確認（原調査）',partial:'一部のみ確認',reference_only:'参考情報のみ（部の帰属未確認）',held_titles_unverified:'開催確認・曲目未確認',reported_segment_complete:'当該ユニット区分の掲載曲一覧（全催事ではない）',unknown:'未確認'}[e.completeness]||e.completeness||'未確認')),'meta'));if(e.activity_scope==='prejoin_other_unit'){a.append(node('p','加入前の別ユニット活動：KAGAJO☆7。ときめき♡宣伝部本体の出演・歌唱ではありません。','notice'),node('p',e.individual_member_attendance_confirmed?'菅田愛貴の参加根拠は日付単位。各ステージへの参加・曲別歌唱・ソロ歌割りの確認数ではありません。':'KAGAJO出演のみ確認。菅田愛貴個人の当日出演・曲別歌唱は未確認。','notice'));const others=(e.same_day_other_artist_event_ids||[]).map(id=>DB.records.find(r=>r.id===id)).filter(Boolean);if(others.length)a.append(internalButton('同日同会場の別出演者の記録（同じ実演ではありません）',others,'別出演者の同日記録'));} let d=node('details');if(e.setlist_status_label)d.append(node('p',e.setlist_status_label,'notice'));if(e.publication_state_v76r2?.note)d.append(node('p',e.publication_state_v76r2.note,'meta'));d.append(node('summary',songs(e).length?'セットリスト（'+songs(e).length+'項目）':'セットリスト確認中'));let acts=node('div',undefined,'actions');[['コピー',()=>copy(e)],['TXT保存',()=>save(txt(e),exportName(e,'txt'),'text/plain;charset=utf-8')],['CSV保存',()=>save(csv(e),exportName(e,'csv'),'text/csv;charset=utf-8')],['この公演から下書きを作る',()=>openDraft(e)]].forEach(([n,f])=>{let b=node('button',n);b.onclick=f;acts.append(b)});if(e.order_unverified)d.append(node('p','曲順情報が不明確','notice'));let ol=node('ol');ol.style.listStyle='none';ol.style.paddingLeft='0';songs(e).forEach(s=>{let li=node('li');li.append(songTitleRow(s,e.order_unverified?null:s.sequence));let detail=songDetails(s);if(s.appearance_type==='prejoin_other_unit'){detail.append(node('p','歌唱者：'+str(s.performers)+' / '+(s.aki_singing_excluded?'菅田愛貴は歌唱対象外。本人歌唱の逆引きには含めません。':'菅田愛貴の曲別個人歌唱は未確認。'),'notice'));if(s.public_evidence_note)detail.append(node('p',s.public_evidence_note,'meta'));}if(s.official_program_number_bundle40||s.report_number_bundle40){detail.append(node('p',(s.official_program_number_bundle40?'公式番号リスト：'+s.official_program_number_bundle40+' / '+s.official_program_number_scope_bundle40:'非公式視聴記の採番：'+s.report_number_bundle40+' / '+s.report_number_scope_bundle40)+'。メドレー内番号・独立確認した実演通番とは区別します。','notice'));detail.append(sourceLink(s.official_program_number_source_bundle40||s.report_number_source_bundle40));}if(s.participant_role_bundle40)detail.append(node('p',s.participant_role_bundle40.person+'：コーラス（非公式視聴記の根拠）。グループ全員の歌唱には拡張しません。','notice'));if(s.research_bundle38_evidence||s.relative_occurrence_order_bundle38||(s.source_timestamp&&s.video_watched===false)){detail.append(node('p',[s.source_reported_number?'原資料の番号：'+s.source_reported_number:'',s.relative_occurrence_order_bundle38?'関連演目内の相対順：'+s.relative_occurrence_order_bundle38:'',s.performance_section_bundle38?'区分：'+s.performance_section_bundle38:'',s.section_order?'区分内順：'+s.section_order:'',s.source_timestamp?'公開視聴者コメントの時刻：'+s.source_timestamp+'（非公式情報・動画未視聴）':''].filter(Boolean).join(' / '),'meta'));}li.append(detail);if(s.song_id){let b=node('button','楽曲から逆引き');b.setAttribute('aria-label',songName(s)+'の楽曲情報を見る');b.onclick=()=>navigateRecords([s.song_id],'公演で披露された楽曲');li.append(b)}if(s.source_url)detail.append(sourceLink(s.source_url));if(s.corroboration_url)detail.append(sourceLink(s.corroboration_url));if(s.order_source_url){detail.append(node('p','曲順の根拠：'+(s.order_source_classification==='unofficial'?'非公式情報':'公式情報'),'meta'));detail.append(sourceLink(s.order_source_url));}if(s.title_variants)detail.append(node('p','資料間の曲名表記：'+s.title_variants.join(' / '),'songnote'));ol.append(li)});d.append(ol,acts);appendUnconfirmedCandidates66(d,e);appendEventAnnotations66(d,e);if(e.time_display)d.append(node('p','日時の詳細：'+e.time_display,'meta'));for(let variant of e.time_variants||[]){d.append(node('p','別資料の時刻：'+variant.time+(isNonOfficialSource(variant.source_url)?' / 非公式情報':' / '+variant.note),'meta'));if(variant.source_url)d.append(sourceLink(variant.source_url))}if(publicEventNote(e))d.append(node('p',publicEventNote(e),'meta'));sourceUrls(e).forEach(u=>{let p=node('div',undefined,'sources');p.append(sourceLink(u));d.append(p)});a.append(d);let pd=node('details');pd.append(node('summary','DVD・Blu-ray・CD・KiTの収録商品'));if(!(e.recording_candidates||[]).length)pd.append(node('p','収録商品は未確認です。未発売・未収録という意味ではありません。','meta'));else{pd.append(node('p','商品資料と公演情報を照合した関連候補です。日付相違・複数日編集・発売予定は個別の注記を確認してください。','notice'));for(let p of e.recording_candidates){let box=node('div');box.append(node('p',p.product_title+' / '+p.edition,'songhead'),node('p',[p.release_date,p.catalog_number,p.package_format,p.disc,p.recording_type,p.coverage,p.mix_type,p.source_event_dates?'収録元公演日：'+p.source_event_dates.join('・'):'','対象公演：'+p.event_title,p.match_policy,p.notes].filter(Boolean).join(' / '),'meta'));for(let u of p.source_urls||[])box.append(sourceLink(u));let releases=releaseRecords(p);if(releases.length)box.append(internalButton('この商品の発売情報を見る',releases,'公演の収録商品候補'));appendMediaTrackDetails(box,p);pd.append(box)}}a.append(pd);appendBlogLinks(a,e);appendUnallocatedDays(a,e);appendPrejoinLinks(a,e);appendParticipationReviews(a,e);appendMusicalEvidence(a,e);appendBatch40Context(a,e);appendReferenceSetlists(a,e);for(let s of e.non_artist_program_segments||[]){let nd=node('details');nd.append(node('summary','本人歌唱へ加算しない演目'),node('p',s.title,'songhead'),node('p',s.public_note,'notice'));if(s.source_url)nd.append(sourceLink(s.source_url));a.append(nd)}return a}
// List cards intentionally avoid building setlists and source trees until requested.
function renderCard(e){
 const a=node('article');a.dataset.id=e.id;
 if(e.kind!=='song')a.append(node('time',(e.date_label?e.date_label+'：':'')+(e.date||'日付未確認')+(/^\d{2}:\d{2}$/.test(e.time||'')?' '+e.time:'')));
 if(e.kind==='song')a.append(node('p','初リリース日：'+(workReleaseDate66(e)||'不明'),'meta'));
 a.append(node('span',({live:'公演',blog:'ブログ',release:'リリース',song:'楽曲情報'}[e.kind]),'badge '+(e.kind==='blog'?'blog':'')),node('h2',e.title,'title'));
 a.append(node('p',e.kind==='song'?occurrenceSummary66(e):[e.session,e.venue,members(e)].filter(Boolean).join(' / '),'meta'));
 if(e.evidence_type==='fan'||e.songs?.some(s=>s.source_classification==='unofficial'||s.evidence_type==='fan'))a.append(node('span','非公式情報','badge'));
 if(e.kind==='blog'){const original=link(e.url,'元のブログ記事を読む');original.onclick=()=>{window.rememberBlog(e.id)};a.append(original);}
 const d=node('details');d.append(node('summary',e.kind==='live'?'公演詳細・セットリスト（'+songs(e).length+'項目）':e.kind==='song'?'作者・披露公演・関連商品':e.kind==='release'?'商品詳細・収録内容・関連公演':'記事情報・関連公演'));
 d.addEventListener('toggle',async()=>{if(!d.open||d.dataset.loaded)return;d.dataset.loaded='loading';const loading=node('p','詳細を読み込み中…','meta');d.append(loading);try{await window.TimeFlightData.ensureDetails(DB);}catch(error){d.dataset.loaded='';loading.textContent='詳細を読み込めません。通信を確認し、閉じて開き直してください。';return;}loading.remove();if(!d.open){d.dataset.loaded='';return;}d.dataset.loaded='true';const full=renderFullCard(e);full.className='expanded-record';const head=Array.from(full.children);if(e.kind==='song'){head[0]?.remove();head[2]?.remove()}else for(const c of head.slice(0,4))c.remove();if(e.kind==='live'){const set=Array.from(full.children).find(c=>c.tagName==='DETAILS'&&c.querySelector('summary')?.textContent.startsWith('セットリスト'));if(set)set.open=true}d.append(full)});a.append(d);return a;
}
function fillMembers(){let old=$('#member').value;$('#member').replaceChildren(new Option('全て',''));let names=new Set;DB.records.forEach(r=>members(r).split(/[・、,／]/).filter(Boolean).forEach(m=>names.add(m)));[...names].sort().forEach(m=>$('#member').add(new Option(m,m)));$('#member').value=old;$('#readingMember').replaceChildren(new Option('ALL',''));[...names].sort().forEach(m=>$('#readingMember').add(new Option(m,m)));}
window.readerStep=function(delta){const rows=visible.filter(r=>r.kind==='blog'&&publicSourceUrl66(r.url));const at=rows.findIndex(r=>r.id===window.currentBlogId);if(at<0||!rows[at+delta])return null;window.rememberBlog(rows[at+delta].id);return rows[at+delta].url;};
const defaults=()=>({q:'',member:'',from:'',to:'',sort:'desc',withSongs:'',era:'both',year:''});let applied=defaults();function updatePendingIndicator(){syncEraLabel();let changed=Object.keys(applied).some(id=>$('#'+id).value!==applied[id]);$('#searchState').textContent=changed?'未適用の変更があります。「検索する」で反映します。':'表示中の結果は適用済みの検索条件です。'}function applySearch(){clearNavigation();for(let id of Object.keys(applied))applied[id]=$('#'+id).value;filter()}function navigateFilter(kind,values){clearNavigation();applied={...defaults(),...values};$('#kind').value=kind;for(let id of Object.keys(applied))$('#'+id).value=applied[id];filter()}function eraYearMatch(e){const match=r=>(!applied.year||(r.date||'').startsWith(applied.year))&&(applied.era==='both'||r.era===applied.era);if(e.kind==='song'){if(!applied.year&&applied.era==='both')return true;return e.occurrences.some(o=>{let r=DB.records.find(r=>r.id===o.event_id);return r&&match(r)})}return match(e)}function syncEraLabel(){$('#era').textContent=({both:'両方',super:'超ときめき♡宣伝部',original:'ときめき♡宣伝部'}[$('#era').value]||'両方')}function fillYears(){$('#year').replaceChildren(new Option('全ての年',''));[...new Set(DB.records.map(r=>(r.date||'').slice(0,4)).filter(Boolean))].sort().reverse().forEach(y=>$('#year').add(new Option(y+'年',y)))}function searchNorm(v){return str(v).normalize('NFKC').toLocaleLowerCase()}function filter(){limit=50;const q=searchNorm(applied.q.trim()),k=$('#kind').value,m=applied.member,from=applied.from,to=applied.to;visible=(k==='song'?(DB.song_catalog||[]):DB.records).filter(e=>(!directIds||directIds.has(e.id))&&eraYearMatch(e)&&(!k||e.kind===k)&&(!m||members(e).split(/[・、,／]/).includes(m))&&(k==='song'||!from||e.date&&e.date>=from)&&(k==='song'||!to||e.date&&e.date<=to)&&(k==='song'||!applied.withSongs||songs(e).length)&&(!q||searchNorm([e.title,...(e.title_aliases||[]),e.venue,e.session,members(e),e.notes,e.note,...(e.editions||[]).map(x=>[x.edition,x.catalog_number,x.package_format].join(' ')),...(e.products||[]).map(x=>[x.product_title,x.catalog_number,x.edition,x.event_title,...(x.tracks||[])].join(' ')),...(e.reference_setlists||[]).flatMap(r=>(r.rows||[]).map(s=>s.title)),...(e.performance_participation_reviews||[]).map(r=>r.title),...songs(e).map(s=>songName(s)+' '+(s.evidence_note||''))].join(' ')).includes(q)));let direction=applied.sort==='asc'?1:-1;visible.sort((a,b)=>{if(a.kind==='song'&&b.kind==='song')return a.title.localeCompare(b.title,'ja');if(!a.date)return b.date?1:a.id.localeCompare(b.id);if(!b.date)return -1;let d=a.date.localeCompare(b.date)*direction;if(d)return d;if(a.time&&b.time)return a.time.localeCompare(b.time)*direction;if(a.time&&!b.time)return -1;if(!a.time&&b.time)return 1;return a.id.localeCompare(b.id)});render()}
const tileInfo=[['','ALL','all'],['blog','BLOG','blog'],['live','LIVE/EVENTS','live'],['release','RELEASES','release'],['song','TRACK LIBRARY','song']];function updateTiles(){for(let [kind,label,id] of tileInfo){let b=$('#tile-'+id);let count=kind==='song'?(DB.song_catalog||[]).length:DB.records.filter(r=>!kind||r.kind===kind).length;b.replaceChildren(node('strong',label),node('span',count.toLocaleString()+'件'));b.className=$('#kind').value===kind?'active':'';b.setAttribute('aria-pressed',String($('#kind').value===kind));b.onclick=()=>{clearNavigation();$('#kind').value=kind;filter()}}}function updateStats(){$('#blogReading').hidden=$('#kind').value!=='blog';$('#readingMember').value=applied.member;$('#backToResults').hidden=!navigationStack.length;$('#navigationLabel').textContent=navigationLabel?navigationLabel+'（関連先を表示中）':'';updateTiles();updatePendingIndicator();$('#appliedSummary').textContent='適用中：'+[applied.era==='both'?'両方':applied.era==='super'?'超ときめき♡宣伝部':'ときめき♡宣伝部',applied.year?applied.year+'年':'全ての年',applied.q?'キーワード「'+applied.q+'」':'',applied.member,applied.from?'開始 '+applied.from:'',applied.to?'終了 '+applied.to:'',applied.withSongs?'セットリストあり':'',applied.sort==='asc'?'古い日付から':'新しい日付から'].filter(Boolean).join(' / ');$('#stats').textContent=`${visible.length.toLocaleString()}件中 ${Math.min(limit,visible.length)}件表示（総記録 ${DB.records.length.toLocaleString()}件）`;$('#more').hidden=limit>=visible.length}
function render(){let el=$('#list');el.replaceChildren(...timelineNodes64(0,limit));if(!visible.length){const empty=node('div',undefined,'empty-state65');empty.append(node('p','条件に一致する記録がありません。'));const change=node('button','検索条件を変更');change.onclick=()=>$('#openSearch').onclick();empty.append(change);el.append(empty);}updateStats()}
function appendPage(){if(loadInProgress||limit>=visible.length)return;loadInProgress=true;let start=limit;limit=Math.min(limit+50,visible.length);$('#list').append(...visible.slice(start,limit).map(renderCard));updateStats();loadInProgress=false}

function openDraft(e){draftEvent=e?structuredClone(e):{id:'draft-'+Date.now(),title:'新しいセットリスト',date:'',songs:[],status:'ユーザー作成',completeness:'下書き'};draftSongs=structuredClone(songs(draftEvent));$('#draftTitle').value=draftEvent.title;drawDraft();$('#draft').showModal()}function drawDraft(){$('#draftRows').replaceChildren(...draftSongs.map((s,i)=>{let li=node('li');li.append(songTitleRow(s,i+1));[['↑',-1],['↓',1]].forEach(([text,delta])=>{let b=node('button',text);b.setAttribute('aria-label',`${i+1}曲目を${delta<0?'上':'下'}に移動`);b.disabled=i+delta<0||i+delta>=draftSongs.length;b.onclick=()=>{[draftSongs[i],draftSongs[i+delta]]=[draftSongs[i+delta],draftSongs[i]];drawDraft()};li.append(b)});let b=node('button','削除');b.onclick=()=>{draftSongs.splice(i,1);drawDraft()};li.append(b);li.append(songDetails(s));return li}))}
$('#add').onclick=()=>{let v=$('#addSong').value.trim();if(!v)return;draftSongs.push({song_title:v,segment:'unknown',evidence_note:'下書きで追加。実際の披露情報ではありません。'});$('#addSong').value='';drawDraft()};$('#closeDraft').onclick=()=>$('#draft').close();$('#draftTxt').onclick=()=>{let e={...draftEvent,title:$('#draftTitle').value||'下書き'};save(txt(e,draftSongs,true),exportName(e,'txt'),'text/plain;charset=utf-8')};$('#draftCsv').onclick=()=>{let e={...draftEvent,title:$('#draftTitle').value||'下書き'};save(csv(e,draftSongs,true),exportName(e,'csv'),'text/csv;charset=utf-8')};$('#blankDraft').onclick=()=>openDraft();$('#more').onclick=appendPage;$('#era').onclick=()=>{let states=['both','super','original'];$('#era').value=states[(states.indexOf($('#era').value)+1)%3];updatePendingIndicator()};$('#searchForm').addEventListener('input',updatePendingIndicator);$('#searchForm').addEventListener('change',updatePendingIndicator);$('#searchForm').addEventListener('submit',ev=>{ev.preventDefault();applySearch()});$('#backToResults').onclick=backToResults;$('#reset').onclick=()=>{clearNavigation();applied=defaults();for(let id of Object.keys(applied))$('#'+id).value=applied[id];filter()};$('#allJson').onclick=()=>save(JSON.stringify(DB,null,2),'tokisen_timeline.json','application/json');$('#importJson').onchange=async ev=>{try{let d=unpackTimelinePayload(JSON.parse(await ev.target.files[0].text()));validateTimelineData(d);if(!Array.isArray(d.records)||d.records.length>30000||d.records.some(r=>!r||typeof r.id!=='string'||!r.id||typeof r.title!=='string'||!['blog','live','release'].includes(r.kind)||r.songs&&!Array.isArray(r.songs)||r.date&&!/^\d{4}-\d{2}-\d{2}$/.test(r.date))||new Set(d.records.map(r=>r.id)).size!==d.records.length)throw Error('データ形式またはIDが不正です');DB=d;clearNavigation();fillMembers();fillYears();filter();$('#dataNote').textContent=d.description||'読み込んだデータを表示しています。';}catch(e){alert('読み込みできません：'+e.message)}ev.target.value=''};// UI projection only: original research rows and song IDs remain intact.
const originalSongs=DB.song_catalog, eventById=new Map(DB.records.map(r=>[r.id,r]));
const songById=new Map(originalSongs.map(s=>[s.id,s]));
const normalizedTitle=t=>str(t).normalize('NFKC').toLocaleLowerCase().replace(/[\s\u3000]/g,'').replace(/[〜～]/g,'~');
const baseTitle=t=>normalizedTitle(t).replace(/(?:[（(][^）)]*(?:ver\.?|バージョン)[^）)]*[）)]|~[^~]*(?:ver\.?|バージョン)[^~]*~|\s*-\s*超ver\.?|「結束力」スペシャルバージョン)$/i,'');
const ownIdentity=s=>/ときめき|超ときめき/.test(s.artist_identity||'');
const parent=new Map(originalSongs.map(s=>[s.id,s.id]));
function resolveSongID(id){return uiAliases[id]||id}
function rootId(id){let p=parent.get(id);return p&&p!==id?rootId(p):id}
function joinSongs(a,b){if(DB.song_id_redirects_v76)return;if(parent.has(a)&&parent.has(b)){const x=rootId(a),y=rootId(b);if(x!==y)parent.set(x,y)}}
// Only identity-confirmed aliases; speculative candidate relationships are not unions.
for(const s of originalSongs)for(const l of s.work_credit_links||[])if(['clear_orthographic_alias','confirmed_work_alias_by_event_context','confirmed_work_alias_by_event_context'].includes(l.classification))for(const id of l.target_song_ids||[])joinSongs(s.id,id);
const sameWork=new Map;
for(const s of originalSongs){const artist=ownIdentity(s)?'tokisen':s.artist_identity; if(!artist||artist.startsWith('未同定:')||artist.startsWith('カバー原曲未照合:'))continue; const key=artist+'|'+(ownIdentity(s)?baseTitle(s.title):normalizedTitle(s.title));if(sameWork.has(key))joinSongs(s.id,sameWork.get(key));else sameWork.set(key,s.id)}
// User-confirmed correction and symbol omission, backed by the existing work links.
joinSongs('song:ded90449b5e36568e5ec','song:dc4a1c0d12ae77264080');
joinSongs('song:b65fb825ac84ee9c76c4','song:70eed6112181f05eab37');
const grouped=new Map;for(const s of originalSongs){const id=rootId(s.id);if(!grouped.has(id))grouped.set(id,[]);grouped.get(id).push(s)}
const officialTitles={'song:c91c0651491dfa87e192':'Born To Be Smile','song:70eed6112181f05eab37':'100%♡オレンジ','song:dc4a1c0d12ae77264080':'びりーぶ','song:d58e740b86d9af96e97d':'GAMUSHARA'};
const uiAliases={};const catalogView=[];
for(const group of grouped.values()){
 const preferred=group.find(s=>officialTitles[s.id])||[...group].sort((a,b)=>(Number(ownIdentity(b))-Number(ownIdentity(a)))||(Number(Boolean(b.recording_credits?.length))-Number(Boolean(a.recording_credits?.length)))||(baseTitle(a.title)===normalizedTitle(a.title)?-1:1)||(b.occurrences.length-a.occurrences.length))[0];
 const rowFlags=group.flatMap(c=>(c.occurrences||[]).map(o=>eventById.get(o.event_id)?.songs?.[o.position-1]).filter(Boolean));const own=group.some(ownIdentity)&&!(rowFlags.length&&rowFlags.every(s=>s.cover_status==='cover')); const entry={...preferred,title:DB.song_id_redirects_v76?preferred.title:(officialTitles[preferred.id]||preferred.title),ui_versions:DB.song_id_redirects_v76?(preferred.versions||[]).map(version=>({...preferred,...version,id:preferred.id,kind:'song',recording_credits:(version.original_song_ids||[]).flatMap(id=>DB.song_merge_history_v76?.[id]?.recording_credits||[]),occurrences:(preferred.occurrences||[]).filter(o=>eventById.get(o.event_id)?.songs?.[o.position-1]?.performance_variant_id===version.version_id)})):group.flatMap(v=>v.versions?.length?v.versions.map(version=>({...v,...version,id:v.id,kind:'song'})):[v]),ui_own:own,ui_source_ids:DB.song_id_redirects_v76?[preferred.id,...Object.keys(DB.song_id_redirects_v76).filter(id=>DB.song_id_redirects_v76[id]===preferred.id)]:group.map(s=>s.id),title_aliases:[...new Set(group.flatMap(s=>[s.title,...(s.aliases||[]),...(s.title_aliases||[])]))],occurrences:group.flatMap(s=>(s.occurrences||[]).map(o=>({...o,source_song_id:s.id,version_title:s.title}))),recording_credits:group.flatMap(s=>s.recording_credits||[]),day_occurrences:group.flatMap(s=>s.day_occurrences||[])};
 for(const s of group)uiAliases[s.id]=entry.id;catalogView.push(entry);
}
for(const [oldID,currentID]of Object.entries(DB.id_aliases||{}))if(oldID.startsWith('song:'))uiAliases[oldID]=uiAliases[currentID]||currentID;
DB.song_catalog=catalogView;DB.record_aliases={...(DB.record_aliases||{}),...uiAliases};
const sourceRenderFullCard=renderFullCard;
renderFullCard=function(e){const a=sourceRenderFullCard(e);if(e.has_unofficial_source)a.append(node('span','非公式情報','badge'));if(e.kind==='song'&&e.aliases?.length>1)a.append(node('p','別名・原表記：'+e.aliases.join(' / '),'meta'));if(e.kind==='song')appendSharedMedia76(a,e);if(e.kind==='song')a.append(node('p','初リリース日：'+(workReleaseDate66(e)||'不明')+'（正式なCD・配信。ライブ盤・初披露日は代用しません）','meta'));if(e.kind==='song'&&e.ui_versions?.length){let d=node('details');d.append(node('summary','バージョン・原表記（'+e.ui_versions.length+'件）'));d.addEventListener('toggle',()=>{if(!d.open||d.dataset.loaded)return;d.dataset.loaded='true';for(const v of e.ui_versions){let box=node('details');box.append(node('summary',v.title+' / 披露'+v.occurrences.length+'件'));box.addEventListener('toggle',()=>{if(!box.open||box.dataset.loaded)return;box.dataset.loaded='true';box.append(sourceRenderFullCard(v))});d.append(box)}});a.append(d)}return a};
let selectedKinds=new Set, selectedEras=new Set(['original','super']), includeOther=false;
const years=DB.records.map(r=>Number((r.date||'').slice(0,4))).filter(Boolean),minYear=Math.min(...years),maxYear=Math.max(...years);
let yearStart=minYear,yearEnd=maxYear;
for(const id of ['yearStart','yearEnd']){const el=$('#'+id);el.min=minYear;el.max=maxYear;el.value=id==='yearStart'?yearStart:yearEnd}
const fixedMembers=['超ときめき♡宣伝部','ときめき♡宣伝部','辻野かなみ','小泉遥香','坂井仁香','吉川ひより','菅田愛貴','杏ジュリア','藤本ばんび','小高サラ','永坂真心'];
fillMembers=function(){for(const id of ['member','readingMember']){$('#'+id).replaceChildren(new Option(id==='readingMember'?'ALL':'全て',''));for(const m of fixedMembers.filter(m=>id!=='readingMember'||!['ときめき♡宣伝部','超ときめき♡宣伝部'].includes(m)))$('#'+id).add(new Option(m,m))}};
function eraBucket(r){if(r.era==='original'||r.era==='super')return r.era;return (r.date||'')<'2020-04-01'?'original':'super'}
function dateScope(r){const y=Number((r.date||'').slice(0,4));return (y?(y>=yearStart&&y<=yearEnd):(yearStart===minYear&&yearEnd===maxYear))&&selectedEras.has(eraBucket(r))}
function memberScope(r,m){if(!m)return true;if(m==='超ときめき♡宣伝部')return eraBucket(r)==='super';if(m==='ときめき♡宣伝部')return eraBucket(r)==='original';return members(r).split(/[・、,／]/).includes(m)}
function workReleaseDate66(e){return /^\d{4}-\d{2}-\d{2}$/.test(e.first_release_sort_date||'')?e.first_release_sort_date:''}
function compareSongRelease66(a,b,order){const da=workReleaseDate66(a),db=workReleaseDate66(b);if(!da||!db){if(da&&!db)return -1;if(!da&&db)return 1}else{const diff=da.localeCompare(db)*(order==='asc'?1:-1);if(diff)return diff}return a.title.localeCompare(b.title,'ja')||a.id.localeCompare(b.id)}
window.SORT66_TEST={workReleaseDate66,compareSongRelease66};
// BEGIN TimeFlightSongCounts77 — pure helper, also exercised by the data regression tests.
(function(root){
 'use strict';
 function build(catalog,records,resolve=id=>id){
  const events=new Map(records.filter(r=>r.kind==='live').map(r=>[r.id,r]));
  const counts=new Map;
  for(const song of catalog){
   const positions=new Set;
   for(const occurrence of song.occurrences||[]){
    const event=events.get(occurrence.event_id),position=occurrence.position;
    if(!event||!Number.isInteger(position)||position<1)continue;
    const row=event.songs?.[position-1];
    if(!row||row.publication_confirmation_v76r2?.state==='candidate'||!row.song_id||resolve(row.song_id)!==resolve(song.id))continue;
    positions.add(JSON.stringify([event.id,position]));
   }
   // Missing eligible references means unknown, never a claim of zero performances.
   counts.set(song.id,positions.size||null);
  }
  return counts;
 }
 function compare(a,b,order,counts){
  const ac=counts.get(a.id)??null,bc=counts.get(b.id)??null;
  if(ac===null&&bc!==null)return 1;
  if(ac!==null&&bc===null)return -1;
  if(ac!==null&&bc!==null&&ac!==bc)return (ac-bc)*(order==='count-asc'?1:-1);
  return String(a.title||'').localeCompare(String(b.title||''),'ja')||String(a.id).localeCompare(String(b.id));
 }
 root.TimeFlightSongCounts77=Object.freeze({build,compare});
})(typeof window==='undefined'?globalThis:window);
// END TimeFlightSongCounts77
const songCounts77=window.TimeFlightSongCounts77.build(catalogView,DB.records,resolveSongID);
let songOrder77='release';
const songCountSortModes77=new Set(['count-desc','count-asc']);
for(const [value,label]of [['count-desc','披露回数が多い順'],['count-asc','披露回数が少ない順']]){
 const option=new Option(label,value);option.dataset.songOrder='true';option.hidden=true;option.disabled=true;$('#order').add(option);
}
const songCountNote77=node('p','披露回数は全収録期間のセットリスト掲載回数です。同一公演の再演は別に数え、未照合候補・部未確定の参考曲は除外します。絞り込みは表示する曲だけに適用。集計対象の記録がない曲は末尾で、未披露を意味しません。','sub');
songCountNote77.id='songCountNote77';songCountNote77.hidden=true;$('.results-summary65').append(songCountNote77);
function songOrderContext77(){return selectedKinds.has('song')||!!directIds&&visible.some(e=>e.kind==='song')}
function syncSongOrder77(){
 const enabled=songOrderContext77();
 for(const option of $('#order').options)if(option.dataset.songOrder){option.hidden=!enabled;option.disabled=!enabled;}
 $('#order').value=enabled&&songCountSortModes77.has(songOrder77)?songOrder77:applied.sort;
 songCountNote77.hidden=!enabled||!songCountSortModes77.has(songOrder77);
}
function compareSongs77(a,b){return songCountSortModes77.has(songOrder77)?window.TimeFlightSongCounts77.compare(a,b,songOrder77,songCounts77):compareSongRelease66(a,b,applied.sort)}
window.SONG_SORT_TEST={counts:songCounts77,compare:compareSongs77,getOrder:()=>songOrder77,setOrder:value=>{if(['release','count-desc','count-asc'].includes(value)){songOrder77=value;filter()}}};

function sharedSongQueryIDs76(q){const rules=DB.song_normalization_rules_v76;if(!rules)return new Set();let key=str(q).normalize('NFKC').toLocaleLowerCase().replace(/〜/g,'~').replace(new RegExp(rules.whitespace_regex,'g'),'');if(new RegExp(rules.orange_regex).test(key))key='100%オレンジ';else key=key.replace(new RegExp(rules.symbol_regex,'g'),'');return new Set(DB.song_alias_lookup_v76?.[key]||[])}
function songQueryMatch76(e,q){return recordSearchText(e).includes(q)||sharedSongQueryIDs76(q).has(e.id)}
function recordSearchText(e){return searchNorm([e.title,...(e.title_aliases||[]),e.venue,e.session,members(e),e.notes,e.note,...(e.editions||[]).map(x=>[x.edition,x.catalog_number,x.package_format].join(' ')),...(e.products||[]).map(x=>[x.product_title,x.catalog_number,x.edition,x.event_title,...(x.tracks||[])].join(' ')),...songs(e).map(s=>songName(s)+" "+(s.song_title||s.title||"")),...(e.ui_versions||[]).map(s=>s.title)].join(' '))}
filter=function(){limit=50;const q=searchNorm(applied.q.trim());let kinds=selectedKinds.size?selectedKinds:new Set(['blog','live','release']);
 let pool=[...DB.records,...(kinds.has('song')?catalogView:[])];if(directIds)pool=[...DB.records,...catalogView].filter(r=>directIds.has(r.id));
 visible=pool.filter(e=>{if(directIds)return true;if(!kinds.has(e.kind))return false;if(e.kind==='song'){
  if(!e.ui_own&&!includeOther)return false;
  const occurrences=e.occurrences||[];if(!occurrences.length)return !applied.member&&!applied.from&&!applied.to&&yearStart===minYear&&yearEnd===maxYear&&(e.ui_own?selectedEras.size>0:includeOther)&&(!q||songQueryMatch76(e,q));
  return occurrences.some(o=>{const r=eventById.get(o.event_id);return r&&(e.ui_own?dateScope(r):(!r.date||(Number(r.date.slice(0,4))>=yearStart&&Number(r.date.slice(0,4))<=yearEnd)))&&memberScope(r,applied.member)&&(!applied.from||r.date>=applied.from)&&(!applied.to||r.date<=applied.to)})&&(!q||songQueryMatch76(e,q));
 }
 return dateScope(e)&&memberScope(e,applied.member)&&(!applied.from||e.date>=applied.from)&&(!applied.to||e.date<=applied.to)&&(!q||songQueryMatch76(e,q))});
 const direction=applied.sort==='asc'?1:-1;visible.sort((a,b)=>{if(a.kind==='song'&&b.kind==='song')return compareSongs77(a,b);if(a.kind==='song')return 1;if(b.kind==='song')return -1;return ((a.date||'').localeCompare(b.date||'')||((a.time||'').localeCompare(b.time||'')))*direction||a.id.localeCompare(b.id)});render()};
updateTiles=function(){for(const [kind,label,id]of tileInfo){const b=$('#tile-'+id),active=kind?selectedKinds.has(kind):!selectedKinds.size;b.replaceChildren(node('strong',label),node('span',(kind==='song'?catalogView.length:DB.records.filter(r=>!kind||r.kind===kind).length).toLocaleString()+'件','tile-count66'));b.className=active?'active':'';b.setAttribute('aria-pressed',String(active));b.onclick=()=>{clearNavigation();if(!kind)selectedKinds.clear();else{selectedKinds.has(kind)?selectedKinds.delete(kind):selectedKinds.add(kind);if(selectedKinds.size===4)selectedKinds.clear()}$('#kind').value=selectedKinds.size===1?[...selectedKinds][0]:'';filter()}}};
function syncYearRange(){
 $('#yearLabel').textContent='';
 $('#rangeStartValue').textContent='START '+yearStart;$('#rangeEndValue').textContent='END '+yearEnd;
 for(const [id,value] of [['yearStart',yearStart],['yearEnd',yearEnd]]){const el=$('#'+id);el.value=value;el.setAttribute('aria-valuetext',value+'年');el.style.zIndex=id==='yearStart'&&yearStart===maxYear?'3':'2'}
 const span=maxYear-minYear||1;const rail=$('.range-rail');rail.style.background=`linear-gradient(to right,#d9d8dd 0%,#d9d8dd ${(yearStart-minYear)/span*100}%,#c9751d ${(yearStart-minYear)/span*100}%,#c9751d ${(yearEnd-minYear)/span*100}%,#d9d8dd ${(yearEnd-minYear)/span*100}%,#d9d8dd 100%)`;
}

updateStats=function(){updateTiles();updatePaginationStatus();$('#backToResults').hidden=!navigationStack.length;$('#navigationLabel').textContent=publicText66(navigationLabel);$('#appliedSummary').textContent=publicText66([applied.member,applied.q?'「'+applied.q+'」':'',applied.from,applied.to].filter(Boolean).join(' / '));document.body.classList?.toggle('detail-view65',!!directIds);$('#blogReading').hidden=!visible.length||!!directIds||!(selectedKinds.has('blog')||!selectedKinds.size);$('#readingMember').value=applied.member;syncSongOrder77();syncYearRange();$('#appliedSummary').hidden=!$('#appliedSummary').textContent;for(const era of ['original','super']){$('#era-'+era).className=selectedEras.has(era)?'selected':'';$('#era-'+era).setAttribute('aria-pressed',String(selectedEras.has(era)))}$('#eraCycle66').textContent='体制：'+(selectedEras.size!==1?'両方':selectedEras.has('super')?'超ときめき♡宣伝部':'ときめき♡宣伝部');$('#eraCycle66').setAttribute('aria-label',$('#eraCycle66').textContent+'。タップで切り替え');$('#era-other').hidden=!selectedKinds.has('song');$('#era-other').textContent='他作品・未確定も表示';$('#era-other').className=includeOther?'selected':'';$('#era-other').setAttribute('aria-pressed',String(includeOther))};
applySearch=function(){clearNavigation();for(const id of ['q','member','from','to'])applied[id]=$('#'+id).value;$('#searchDialog').close();filter()};
updatePendingIndicator=function(){$('#searchState').textContent='「検索する」で追加条件を適用します。'};
$('#openSearch').onclick=()=>{for(const id of ['q','member','from','to'])$('#'+id).value=applied[id];$('#searchDialog').showModal()};$('#closeSearch').onclick=()=>$('#searchDialog').close();
$('#reset').onclick=()=>{for(const id of ['q','member','from','to']){applied[id]='';$('#'+id).value=''}clearNavigation();$('#searchDialog').close();filter()};
$('#eraCycle66').onclick=()=>{clearNavigation();selectedEras=selectedEras.size!==1?new Set(['super']):selectedEras.has('super')?new Set(['original']):new Set(['original','super']);filter()};
for(const era of ['original','super'])$('#era-'+era).onclick=()=>{clearNavigation();if(selectedEras.has(era)){if(selectedEras.size>1||includeOther)selectedEras.delete(era)}else selectedEras.add(era);filter()};
$('#era-other').onclick=()=>{includeOther=!includeOther;if(!includeOther&&!selectedEras.size)selectedEras=new Set(['original','super']);clearNavigation();filter()};
for(const id of ['yearStart','yearEnd'])$('#'+id).oninput=()=>{clearNavigation();if(id==='yearStart'){yearStart=Number($('#yearStart').value);if(yearStart>yearEnd){yearStart=yearEnd;$('#yearStart').value=yearStart}}else{yearEnd=Number($('#yearEnd').value);if(yearEnd<yearStart){yearEnd=yearStart;$('#yearEnd').value=yearEnd}}filter()};
$('#order').onchange=()=>{const value=$('#order').value;if(songCountSortModes77.has(value))songOrder77=value;else{songOrder77='release';applied.sort=value==='asc'?'asc':'desc'}filter()};
$('#readingApply').onclick=()=>{applied.member=$('#readingMember').value;selectedKinds=new Set(['blog']);$('#kind').value='blog';clearNavigation();filter()};
navigateRecords=function(ids,label){const resolved=ids.map(id=>uiAliases[id]||DB.record_aliases?.[id]||id);const entries=[...DB.records,...catalogView].filter(r=>resolved.includes(r.id));if(!entries.length)return;navigationStack.push({ids:directIds,label:navigationLabel,applied:{...applied},songOrder77,limit,scroll:window.scrollY||0,kinds:[...selectedKinds],eras:[...selectedEras],yearStart,yearEnd,includeOther});directIds=new Set(entries.map(e=>e.id));navigationLabel=label;filter();$('#navigationContext').scrollIntoView?.({block:'start'})};
backToResults=function(){const prev=navigationStack.pop();if(!prev)return;directIds=prev.ids;navigationLabel=prev.label;applied=prev.applied;songOrder77=['release','count-desc','count-asc'].includes(prev.songOrder77)?prev.songOrder77:'release';selectedKinds=new Set(prev.kinds);selectedEras=new Set(prev.eras);yearStart=prev.yearStart;yearEnd=prev.yearEnd;includeOther=prev.includeOther;filter();limit=prev.limit;render();window.scrollTo?.(0,prev.scroll)};
const sourceRenderCard=renderCard;
renderCard=function(e){const a=sourceRenderCard(e);if(e.kind==='song'&&songCountSortModes77.has(songOrder77)){const count=songCounts77.get(e.id);const label=node('p',count==null?'集計対象の披露記録なし（未披露を意味しません）':'披露記録 '+count.toLocaleString()+'回（全収録期間）','meta');label.dataset.songPerformanceCount=count==null?'unknown':String(count);a.insertBefore(label,a.querySelector('details'));}if(e.kind==='blog'){
 // The full tile is the link; local state is kept for native previous/next.
 const tile=node(publicSourceUrl66(e.url)?'a':'div');tile.className='blog-card';if(publicSourceUrl66(e.url))tile.href=publicSourceUrl66(e.url);tile.target='_blank';tile.rel='noopener noreferrer';tile.setAttribute('aria-label',e.date+' '+e.title+'を読む');tile.append(node('time',e.date||''),node('span','ブログ','badge'),node('h2',e.title,'title'),node('p',members(e),'meta'));tile.onclick=()=>{window.rememberBlog(e.id)};a.replaceChildren(tile);
 }return a};
window.UI_TEST={catalogView,originalSongs,uiAliases,normalizedTitle,baseTitle,getState:()=>({kinds:[...selectedKinds],eras:[...selectedEras],yearStart,yearEnd,includeOther,applied:{...applied},visible}),setKinds:ks=>{selectedKinds=new Set(ks);filter()},minYear,maxYear};

window.goHome=function(){selectedKinds.clear();selectedEras=new Set(['original','super']);includeOther=false;yearStart=minYear;yearEnd=maxYear;$('#yearStart').value=minYear;$('#yearEnd').value=maxYear;applied=defaults();clearNavigation();filter();window.scrollTo?.(0,0)};

const projectedById=new Map(catalogView.map(c=>[c.id,c]));
const originalSongName=songName;
songName=function(s){return projectedById.get(uiAliases[s.song_id])?.title||originalSongName(s)};
const originalSongDetails=songDetails;
songDetails=function(s){const d=originalSongDetails(s);const raw=s.song_title_raw||originalSongName(s);if(raw!==songName(s))d.append(node('p','原表記：'+raw,'meta'));if(s.performance_version_title)d.append(node('p','バージョン：'+s.performance_version_title,'meta'));return d};
// Same 50-row cursor and IntersectionObserver as build5; clearer progress reporting.
function updatePaginationStatus(){
 const total=visible.length,shown=Math.min(limit,total),remaining=total-shown;
 $('#stats').textContent=total.toLocaleString()+' Hit!';
 const message=loadInProgress?'続きを読み込み中…':!total?'該当する記録はありません。':remaining?'下へスクロールすると続きを表示します。':'全て表示しました。';
 $('#loadHint').textContent=message;
 $('#loadState').hidden=!total;$('#loadState').textContent=loadInProgress?'続きを読み込み中…':remaining?'下へスクロールすると続きを表示します。':message;
 $('#list').setAttribute('aria-busy',String(loadInProgress));
 $('#more').hidden=remaining===0;$('#more').disabled=loadInProgress;
 $('#more').textContent=loadInProgress?'読み込み中…':'続きを表示';
}
appendPage=function(){
 if(loadInProgress||limit>=visible.length)return;
 loadInProgress=true;updatePaginationStatus();
 try{const end=Math.min(limit+50,visible.length),cards=timelineNodes64(limit,end);$('#list').append(...cards);limit=end}
 finally{loadInProgress=false;updateStats();scheduleContinuationCheck()}
};
$('#more').onclick=()=>appendPage();

// IntersectionObserver need not emit again if the sentinel stays in its margin.
// Re-check the same sentinel after appending, and coalesce passive scroll events.
let paginationCheckQueued=false;
function scheduleContinuationCheck(){
 if(paginationCheckQueued||typeof window.requestAnimationFrame!=='function')return;
 paginationCheckQueued=true;
 window.requestAnimationFrame(()=>{paginationCheckQueued=false;const sentinel=$('#more');if(sentinel.hidden||loadInProgress||typeof sentinel.getBoundingClientRect!=='function')return;const rect=sentinel.getBoundingClientRect();if(rect.top<=window.innerHeight+600&&rect.bottom>=-600)appendPage()});
}
const renderBeforePaging58=render;
render=function(){renderBeforePaging58();scheduleContinuationCheck()};
window.addEventListener?.('scroll',scheduleContinuationCheck,{passive:true});
window.addEventListener?.('resize',scheduleContinuationCheck,{passive:true});

const readingMemoryKey='timeline.reading.v1';
let readingMemory=null;let readingHistory64=[];
function normalizedBlogURL(value){try{const u=new URL(value);return /^https?:$/.test(u.protocol)?u.origin+u.pathname.replace(/\/$/,'')+u.search:''}catch{return ''}}
function resolveReadingBlog(saved){if(!saved)return null;let id=DB.record_aliases?.[saved.articleId]||saved.articleId;const byID=DB.records.find(r=>r.kind==='blog'&&r.id===id);if(byID)return byID;const matches=DB.records.filter(r=>r.kind==='blog'&&normalizedBlogURL(r.url)&&normalizedBlogURL(r.url)===normalizedBlogURL(saved.url));return matches.length===1?matches[0]:null}
function validReadingMemory(raw){if(!raw||raw.version!==1||!raw.articleId||!raw.conditions||!Array.isArray(raw.conditions.kinds)||!Array.isArray(raw.conditions.eras))return null;const c=raw.conditions;if(!['asc','desc'].includes(c.applied?.sort)||!Number.isInteger(c.yearStart)||!Number.isInteger(c.yearEnd)||c.yearStart>c.yearEnd)return null;return raw}
function saveReadingMemory(){try{window.localStorage?.setItem(readingMemoryKey,JSON.stringify(readingMemory))}catch{}try{window.webkit?.messageHandlers?.readingMemory?.postMessage(readingMemory)}catch{}updateResumeReading()}
function readingPair64(value){return {version:1,articleId:value.articleId,url:value.url,conditions:structuredClone(value.conditions),savedAt:value.savedAt||Date.now()}}
function conditionKey64(c){return JSON.stringify({kinds:[...c.kinds].sort(),eras:[...c.eras].sort(),yearStart:c.yearStart,yearEnd:c.yearEnd,includeOther:c.includeOther,applied:c.applied})}
window.rememberBlog=function(id){const r=DB.records.find(e=>e.kind==='blog'&&e.id===id);if(!r||!publicSourceUrl66(r.url))return;window.currentBlogId=r.id;const pair={version:1,articleId:r.id,url:r.url,savedAt:Date.now(),conditions:{kinds:[...selectedKinds],eras:[...selectedEras],includeOther,yearStart,yearEnd,applied:{...applied}}};if(readingHistory64.length&&conditionKey64(readingHistory64[0].conditions)===conditionKey64(pair.conditions))readingHistory64[0]=pair;else readingHistory64.unshift(pair);readingHistory64=readingHistory64.slice(0,5);readingMemory={...pair,history:readingHistory64.map(readingPair64)};saveReadingMemory()};
window.rememberBlogURL=function(url){const r=DB.records.find(e=>e.kind==='blog'&&normalizedBlogURL(e.url)===normalizedBlogURL(url));if(r&&visible.some(e=>e.id===r.id)&&r.id!==window.currentBlogId)window.rememberBlog(r.id)};
function applyReadingConditions(saved){const c=saved.conditions;selectedKinds=new Set(c.kinds.filter(k=>['blog','live','release','song'].includes(k)));selectedEras=new Set(c.eras.filter(e=>['original','super'].includes(e)));includeOther=!!c.includeOther;yearStart=Math.max(minYear,Math.min(maxYear,c.yearStart));yearEnd=Math.max(yearStart,Math.min(maxYear,c.yearEnd));applied={...defaults()};for(const key of ['q','member','from','to'])if(typeof c.applied[key]==='string')applied[key]=c.applied[key];applied.sort=c.applied.sort;clearNavigation();for(const id of ['q','member','from','to'])$('#'+id).value=applied[id];$('#kind').value=selectedKinds.size===1?[...selectedKinds][0]:'';filter()}
function updateResumeReading(){const box=$('#resumeReading');box.replaceChildren();box.hidden=!readingMemory;$('#readingPrevious').disabled=!readingHistory64.length;if(!readingMemory)return;const r=resolveReadingBlog(readingMemory);box.append(node('p',r?'前回：'+(r.date||'')+' '+r.title:'前回の記事は現在のデータにありません。','sub'))}
window.resumeReadingURL=function(){const r=resolveReadingBlog(readingMemory);if(!r||!publicSourceUrl66(r.url))return null;applyReadingConditions(readingMemory);if(!visible.some(e=>e.id===r.id)){updateResumeReading();return null}window.currentBlogId=r.id;readingMemory.articleId=r.id;readingMemory.url=r.url;saveReadingMemory();return publicSourceUrl66(r.url)};
function restoreReadingMemory(){let raw=window.__TIMELINE_READING_MEMORY__;if(!raw)try{raw=JSON.parse(window.localStorage?.getItem(readingMemoryKey)||'null')}catch{}readingMemory=validReadingMemory(raw);readingHistory64=readingMemory?(Array.isArray(readingMemory.history)?readingMemory.history.filter(validReadingMemory).map(readingPair64):[readingPair64(readingMemory)]).slice(0,5):[];if(readingMemory){applyReadingConditions(readingMemory);const r=resolveReadingBlog(readingMemory);if(r&&visible.some(e=>e.id===r.id))window.currentBlogId=r.id}updateResumeReading()}
window.READING_TEST={get:()=>readingMemory,restore:restoreReadingMemory,resolve:resolveReadingBlog};
function openReadingURL64(url){if(!url)return false;window.open?.(url,'_blank','noopener');return true}
function startReading64(){const r=visible.find(e=>e.kind==='blog'&&safeUrl(e.url));if(!r){$('#readingHint').textContent='この条件の記事はありません。';return null}window.rememberBlog(r.id);return publicSourceUrl66(r.url)}
function resumeHistory64(index){const chosen=readingHistory64[index];if(!chosen)return null;const r=resolveReadingBlog(chosen);if(!r||!publicSourceUrl66(r.url)){$('#readingHint').textContent='この記事は現在のデータにありません。条件と記事の履歴は残しています。';return null}applyReadingConditions(chosen);if(!visible.some(e=>e.id===r.id)){$('#readingHint').textContent='保存した条件ではこの記事を現在のデータに見つけられません。';return null}window.rememberBlog(r.id);return publicSourceUrl66(r.url)}
function showReadingHistory64(){const list=$('#readingHistoryList');list.replaceChildren();readingHistory64.forEach((entry,index)=>{const r=resolveReadingBlog(entry),c=entry.conditions;const b=node('button');b.append(node('strong',(index+1)+'. '+(c.applied.member||'全て')+' / '+(c.applied.sort==='asc'?'古い順':'新しい順')),node('span',c.yearStart+'–'+c.yearEnd+' / '+c.eras.map(x=>x==='original'?'ときめき♡宣伝部':x==='super'?'超ときめき♡宣伝部':x).join('・')+(c.applied.q?' / '+c.applied.q:'')+(c.applied.from?' / 開始日 '+c.applied.from:'')+(c.applied.to?' / 終了日 '+c.applied.to:''),'meta'),node('span',r?(r.date||'')+' '+r.title:'記事が現在のデータにありません','meta'));b.disabled=!r;b.onclick=()=>{const url=resumeHistory64(index);if(url){$('#readingHistoryDialog').close();openReadingURL64(url)}};list.append(b)});const d=$('#readingHistoryDialog');d.showModal();if(typeof d.getBoundingClientRect==='function'){const trigger=$('#readingPrevious').getBoundingClientRect(),rect=d.getBoundingClientRect(),margin=12;d.style.left=Math.max(margin,Math.min(trigger.left,window.innerWidth-rect.width-margin))+'px';d.style.top=Math.max(margin,Math.min(trigger.bottom+8,window.innerHeight-rect.height-margin))+'px'}}
$('#closeReadingHistory').onclick=()=>{cancelPress64();pressFired64=false;pressCancelled64=false;$('#readingHistoryDialog').close()};
$('#readingStart').onclick=()=>openReadingURL64(startReading64());
let pressTimer64=null,pressFired64=false,pressCancelled64=false,pressPoint64=null;
const previous64=$('#readingPrevious');
function cancelPress64(){if(pressTimer64!==null)clearTimeout(pressTimer64);pressTimer64=null}
previous64.onpointerdown=e=>{if(e.button!==undefined&&e.button!==0)return;cancelPress64();pressFired64=false;pressCancelled64=false;pressPoint64={x:e.clientX,y:e.clientY};previous64.setPointerCapture?.(e.pointerId);pressTimer64=setTimeout(()=>{pressTimer64=null;pressFired64=true;showReadingHistory64()},500)};
previous64.onpointermove=e=>{if(pressPoint64&&Math.hypot(e.clientX-pressPoint64.x,e.clientY-pressPoint64.y)>10){cancelPress64();pressCancelled64=true}};
previous64.onpointerup=()=>{cancelPress64();pressPoint64=null};previous64.onpointercancel=()=>{cancelPress64();pressCancelled64=true;pressPoint64=null};
previous64.onclick=e=>{cancelPress64();if(pressFired64||pressCancelled64){pressFired64=false;pressCancelled64=false;e?.preventDefault?.();return false}return openReadingURL64(resumeHistory64(0))};
previous64.oncontextmenu=e=>{e.preventDefault();cancelPress64();pressFired64=true;showReadingHistory64()};
previous64.onkeydown=e=>{if(e.key==='ContextMenu'||e.key==='F10'&&e.shiftKey||e.key==='ArrowDown'&&e.altKey){e.preventDefault();cancelPress64();showReadingHistory64()}};
window.addEventListener?.('blur',()=>{cancelPress64();pressCancelled64=true});document.addEventListener?.('visibilitychange',()=>{if(document.hidden){cancelPress64();pressCancelled64=true}});
window.READING64_TEST={getHistory:()=>readingHistory64,start:startReading64,resume:resumeHistory64,show:showReadingHistory64};
$('#openDataInfo65').onclick=()=>{$('#dataVersion65').textContent='Time Flight 0.1.0 (14) / データ '+DB.data_version+'：'+DB.records.length.toLocaleString()+'記録・'+UI_TEST.originalSongs.length+'曲目レコード（未同定を含む）。一部判明の記録も掲載し、未知の曲順・全曲性は補完しません。非公式出所の識別情報は配布データへ含めません。';$('#dataInfo65').showModal()};$('#closeDataInfo65').onclick=()=>$('#dataInfo65').close();
// Native iOS uses UIKit's context menu recognizer, equivalent to SwiftUI .contextMenu.
function historyToken65(e){return JSON.stringify({id:e.articleId,url:e.url,condition:conditionKey64(e.conditions)})}
window.resumeHistoryToken65=token=>{const i=readingHistory64.findIndex(e=>historyToken65(e)===token);return i<0?null:resumeHistory64(i)};
function syncNativeMenu65(){if(!window.webkit?.messageHandlers?.readingPrevious65)return;const b=$('#readingPrevious'),r=b.getBoundingClientRect(),v=window.visualViewport;const items=readingHistory64.map((e,i)=>{const r=resolveReadingBlog(e),c=e.conditions;return {token:historyToken65(e),title:(i+1)+'. '+(c.applied.member||'全て')+'・'+(c.applied.sort==='asc'?'古い順':'新しい順'),subtitle:c.yearStart+'–'+c.yearEnd+(c.applied.q?' / '+c.applied.q:'')+(c.applied.from?' / '+c.applied.from:'')+(c.applied.to?'–'+c.applied.to:'')+' / '+(r?(r.date||''):'記事が現在のデータにありません'),enabled:!!r}});window.webkit.messageHandlers.readingPrevious65.postMessage({visible:!$('#blogReading').hidden&&!document.documentElement.classList.contains('native-reader')&&r.width>0,rect:{x:(r.left+window.scrollX)*(v?.scale||1),y:(r.top+window.scrollY)*(v?.scale||1),width:r.width*(v?.scale||1),height:r.height*(v?.scale||1)},fontSize:parseFloat(getComputedStyle(b).fontSize),items});b.setAttribute('aria-hidden','true');b.tabIndex=-1;b.style.visibility='hidden'}
if(window.webkit?.messageHandlers?.readingPrevious65){for(const key of ['onpointerdown','onpointermove','onpointerup','onpointercancel','oncontextmenu','onkeydown'])previous64[key]=null;const render65=render;render=function(){render65();requestAnimationFrame(syncNativeMenu65)};const resume65=updateResumeReading;updateResumeReading=function(){resume65();requestAnimationFrame(syncNativeMenu65)};for(const event of ['scroll','resize'])window.addEventListener(event,syncNativeMenu65,{passive:true});window.visualViewport?.addEventListener('resize',syncNativeMenu65);window.visualViewport?.addEventListener('scroll',syncNativeMenu65);requestAnimationFrame(syncNativeMenu65)}




const studioAudioItems=DB.official_audio_inventory?.items||[];
const liveAudioItems=DB.live_audio_product_tracks?.items||[];
const liveAudioProducts=DB.live_audio_product_tracks?.products||[];
function audioSongIDs(e){return new Set(e.ui_source_ids||[e.id])}
function linkedAudioItems(e,rows){const ids=audioSongIDs(e);return rows.filter(t=>t.existing_database_song_id&&ids.has(t.existing_database_song_id))}
function audioRelatedEvents(rows){const ids=new Set(rows.flatMap(t=>t.existing_media_relation_candidate_ids||[]));return DB.records.filter(r=>r.kind==='live'&&(r.recording_candidates||[]).some(p=>ids.has(p.recording_id)))}
function audioRelatedReleases(rows){const ids=new Set(rows.flatMap(t=>t.existing_media_relation_candidate_ids||[]));return DB.records.filter(r=>r.kind==='release'&&(r.products||[]).some(p=>ids.has(p.recording_id)))}
function appendAudioNavigation(box,rows){const events=audioRelatedEvents(rows),releases=audioRelatedReleases(rows);if(releases.length)box.append(internalButton('商品の発売情報',releases,'ライブ音源商品の発売情報'));if(events.length)box.append(internalButton('商品に関連する公演候補',events,'商品資料の関連公演候補（曲別収録先は未確定）'))}
function showAudioProduct(id){const product=liveAudioProducts.find(p=>p.audio_product_id===id);if(!product)return;const rows=liveAudioItems.filter(t=>t.audio_product_id===id).sort((a,b)=>Number(a.disc)-Number(b.disc)||Number(a.track)-Number(b.track));$('#audioProductTitle').textContent=publicText66(product.release_title);const body=$('#audioProductBody');body.replaceChildren(node('p',[product.release_date,product.edition,'DISC '+product.disc].filter(Boolean).join(' / '),'meta'),node('p','公式商品内のライブ音源トラック。録音IDの確定・曲別の収録公演照合とは区別します。','notice'));const nav=node('div',undefined,'actions');appendAudioNavigation(nav,rows);body.append(nav);for(const b of nav.children||[]){const fn=b.onclick;b.onclick=()=>{$('#audioProductDialog').close();fn()}}const list=node('ol',undefined,'audio-product-list');for(const t of rows){const li=node('li');li.append(node('strong',t.track+'. '+t.song_title));if(t.existing_database_song_id){const b=node('button','楽曲を見る');b.setAttribute('aria-label',t.song_title+'の楽曲情報を見る');b.onclick=()=>{$('#audioProductDialog').close();navigateRecords([t.existing_database_song_id],'商品に収録された楽曲')};li.append(b)}else li.append(node('p','楽曲照合保留（候補を自動統合していません）','audio-status'));const info=node('details');info.append(node('summary','収録情報'),node('p',[t.performance_name,t.performance_date||((t.possible_performance_dates||[]).join(' / ')),t.date_note].filter(Boolean).join(' / '),'meta'));li.append(info);list.append(li)}body.append(list);for(const u of product.source_urls||[])body.append(sourceLink(u));$('#audioProductDialog').showModal()}
$('#closeAudioProduct').onclick=()=>$('#audioProductDialog').close();
function appendAudioVersions(a,e){const studio=linkedAudioItems(e,studioAudioItems),live=linkedAudioItems(e,liveAudioItems);if(!studio.length&&!live.length)return;const section=node('details');section.append(node('summary','公式発売音源・ライブ音源バージョン（'+studio.length+' / '+live.length+'商品トラック）'));section.addEventListener('toggle',()=>{if(!section.open||section.dataset.loaded)return;section.dataset.loaded='true';section.append(node('p','同じ楽曲に関連付けた発売タイトルと商品内トラックです。同じ録音かどうか、曲別の収録公演、ライブ編曲者は未確定のまま保持します。','notice'));for(const t of studio){const box=node('details',undefined,'audio-version');box.append(node('summary',t.title+' / 公式発売確認'),node('p','発売確認はオリジナル／カバー判定とは別です。','audio-status'));box.addEventListener('toggle',()=>{if(!box.open||box.dataset.loaded)return;box.dataset.loaded='true';for(const v of t.evidence||[]){box.append(node('p',[v.release_title,v.release_date,v.edition,v.source_track_text].filter(Boolean).join(' / '),'meta'));if(v.source_url)box.append(sourceLink(v.source_url))}});section.append(box)}for(const t of live){const box=node('details',undefined,'audio-version');box.dataset.productTrackId=t.product_track_id;box.append(node('summary','ライブ音源：'+t.release_title+' / DISC '+t.disc+'・'+t.track+' '+t.song_title));box.addEventListener('toggle',()=>{if(!box.open||box.dataset.loaded)return;box.dataset.loaded='true';box.append(node('p',[t.performance_name,t.performance_date||((t.possible_performance_dates||[]).join(' / ')),t.venue,t.edition,t.date_note].filter(Boolean).join(' / '),'meta'));const b=node('button','この商品のトラック一覧');b.onclick=()=>showAudioProduct(t.audio_product_id);box.append(b);appendAudioNavigation(box,[t]);box.append(node('p','商品トラックとして保持。独立録音ID・曲別公演帰属は未確定。','audio-status'));for(const u of t.source_urls||[])box.append(sourceLink(u))});section.append(box)}});a.append(section)}
const detailsBeforeAudio63=songDetails;
songDetails=function(s){const d=detailsBeforeAudio63(s);if(s.version_label_review)d.append(node('p','バージョン照合保留：一次資料は「'+s.version_label_review.primary_title+'」、別資料は「'+s.version_label_review.image_title+'」。録音・編曲の同一性は未確認です。','notice'));return d};
const renderBeforeAudio63=renderFullCard;
renderFullCard=function(e){const a=renderBeforeAudio63(e);if(e.kind==='song'){a.append(node('p',e.ui_own?'所属名義で登録された楽曲（オリジナル確定の判定ではありません）':'他アーティスト作品・区分未確定を含む登録','audio-status'));appendAudioVersions(a,e)}return a};
$('#audioInventoryReview').addEventListener('toggle',async()=>{if(!$('#audioInventoryReview').open||$('#audioInventoryReview').dataset.loaded)return;try{await window.TimeFlightData.ensureDetails(DB);}catch(e){$('#audioInventoryReviewBody').textContent='読込に失敗しました。閉じて開くと再試行します。';return;}$('#audioInventoryReviewBody').textContent='';const d=$('#audioInventoryReview');if(!d.open||d.dataset.loaded)return;d.dataset.loaded='true';const b=$('#audioInventoryReviewBody');b.append(node('p','公式発売タイトル'+studioAudioItems.length+'行中'+studioAudioItems.filter(t=>t.existing_database_song_id).length+'行、ライブ商品トラック'+liveAudioItems.length+'行中'+liveAudioItems.filter(t=>t.existing_database_song_id).length+'行を既存IDへ照合。独立作品数・録音数ではありません。','notice'),node('p','公式発売の有無だけではカバー／オリジナルを判定しません。通常一覧の所属名義登録にも原曲区分未確定が残ります。確認例のトリセツは他アーティスト作品側ですが、2024年の公式例を過去公演へ転用していません。','meta'));for(const t of [...studioAudioItems,...liveAudioItems].filter(t=>!t.existing_database_song_id))b.append(node('p',(t.title||t.song_title)+' / '+(t.release_title||'発売タイトル')+' / 照合保留・候補'+(t.candidate_database_song_ids||[]).length+'件','meta'));for(const p of DB.live_audio_product_tracks?.pending_album_level_records||[])b.append(node('p',p.release_title+' / ライブCD確認済・曲目未列挙','meta'))});
window.AUDIO_TEST={studioAudioItems,liveAudioItems,liveAudioProducts,linkedAudioItems,audioRelatedEvents,showAudioProduct};


let timelineDecorations64=new Map;
function timelineMilestones64(){return (DB.member_timeline_milestones||[]).map(m=>({...m,date:m.effective_date||m.date,official_term:m.member==='永坂真心'?'退部':m.official_term})).filter(m=>['membership_change','graduation'].includes(m.type)&&['effective','actual_membership_change','actual_graduation','last_member_day'].includes(m.date_kind)&&m.source_classification==='official'&&m.date_confirmed===true&&/^\d{4}-\d{2}-\d{2}$/.test(m.date)&&m.member&&m.official_term&&safeUrl(m.source_url))}
function rebuildTimelineDecorations64(){timelineDecorations64=new Map;if(!visible.some(r=>r.kind!=='song'))return;const dated=visible.filter(r=>r.kind!=='song'&&/^\d{4}-\d{2}-\d{2}$/.test(r.date||''));if(!dated.length)return;const dates=dated.map(r=>r.date).sort(),low=dates[0],high=dates.at(-1),asc=applied.sort==='asc';const at=new Map;for(const m of timelineMilestones64()){if(m.date<low||m.date>high||applied.from&&m.date<applied.from||applied.to&&m.date>applied.to||Number(m.date.slice(0,4))<yearStart||Number(m.date.slice(0,4))>yearEnd||applied.member&&applied.member!==m.member)continue;const index=visible.findIndex(r=>r.kind!=='song'&&r.date&&(asc?r.date>=m.date:r.date<=m.date));if(index<0)continue;if(!at.has(index))at.set(index,[]);at.get(index).push(m)}let lastYear='';for(let i=0;i<visible.length;i++){const r=visible[i],before=[];for(const m of (at.get(i)||[]).sort((a,b)=>a.date.localeCompare(b.date)*(asc?1:-1))){const y=m.date.slice(0,4);if(y!==lastYear){before.push({type:'year',year:y});lastYear=y}before.push({...m,type:'membership'})}if(r.kind!=='song'&&r.date){const y=r.date.slice(0,4);if(/^\d{4}$/.test(y)&&y!==lastYear){before.push({type:'year',year:y});lastYear=y}}if(before.length)timelineDecorations64.set(i,before)}}
function timelineNodes64(start,end){const nodes=[];for(let i=start;i<Math.min(end,visible.length);i++){for(const item of timelineDecorations64.get(i)||[]){const d=node(item.type==='year'?'h2':'div',item.type==='year'?item.year+'年':undefined,item.type==='year'?'timeline-year64':'timeline-graduation64');d.dataset.timelineDecoration=item.type;d.dataset.decorationKey=item.type==='year'?'year:'+item.year:'membership:'+item.member+':'+item.date;if(item.type!=='year'){d.dataset.member=item.member;d.dataset.term=item.official_term;d.dataset.date=item.date;d.append(node('strong',item.member+' '+item.official_term),node('time',item.date));const detail=node('details');detail.append(node('summary','日付の根拠'),node('p',item.date_basis_note||'公式本文で確認した発効日です。','meta'));if(item.announcement_date)detail.append(node('p','発表日：'+item.announcement_date,'meta'));if(item.source_publication_date)detail.append(node('p','出典掲載日：'+item.source_publication_date,'meta'));for(const source of item.sources||[{url:item.source_url}]){const sourceRow=node('p',undefined,'sources');sourceRow.append(link(source.url,'公式情報：'+source.url));detail.append(sourceRow)}d.append(detail)}nodes.push(d)}nodes.push(renderCard(visible[i]))}return nodes}

const renderBeforeTimeline64=render;render=function(){rebuildTimelineDecorations64();renderBeforeTimeline64()};
window.TIMELINE64_TEST={milestones:timelineMilestones64,plan:()=>timelineDecorations64};

$('#dataNote').textContent=publicText66(DB.description);fillMembers();fillYears();for(let id of Object.keys(applied))$('#'+id).value=applied[id];filter();restoreReadingMemory();if(typeof IntersectionObserver!=='undefined'){const scrollObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))appendPage()},{rootMargin:'600px 0px'});scrollObserver.observe($('#more'))}if(DB.app_information){const links=node('p',undefined,'actions');for(const [key,label] of [['privacy_url','プライバシーポリシー'],['support_url','サポート']]){const a=link(DB.app_information[key],label);a.onclick=()=>$('#dataInfo65').close();links.append(a)}$('#dataInfo65').append(links)}
$('#openDataInfo65').addEventListener('click',()=>{window.TimeFlightData.ensureDetails(DB).catch(()=>{});});
window.STATIC_DATA_TEST={ensure:()=>window.TimeFlightData.ensureDetails(DB)};

window.TEST={sharedSongQueryIDs76,sharedMedia76,sharedTrackWorks76,sourceClassification66,publicSourceUrl66,publicText66,isNonOfficialSource,sourceLink,link,renderCard,renderFullCard,validateTimelineData,navigateRecords,backToResults,applySearch,appendPage,txt,csv,safeUrl,songs,songTitleRow,songDetails,getDB:()=>DB};
/* Offline quiz. Only adopted, officially sourced performance rows enter the pool. */
(function (root) {
  'use strict';
  const normalize = text => String(text || '').normalize('NFKC').toLocaleLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
  const title = row => row.song_title || row.title || '';
  function confirmed(event, row) {
    const state = row.publication_confirmation_v76r2?.state;
    return Boolean(row.song_id && title(row) && row.source_classification === 'official' &&
      (state === 'confirmed_partial' || state === 'confirmed_reported' ||
       (state === 'recorded' && ['全曲名確認済み', '曲目部分確認', '役割等のみ未解決'].includes(event.publication_state_v76r2?.category))));
  }
  const name = event => event.event_name || event.title || '';
  const leaks = (text, answer) => !normalize(answer) || normalize(text).includes(normalize(answer));
  const sameEvent = (a, b) => a.id === b.id || (a.event_id && a.event_id === b.event_id) ||
    (a.date === b.date && name(a) === name(b) && (a.session || '') === (b.session || ''));
  function makePool(records) {
    const events = records.filter(e => e.kind === 'live' && name(e) && !['scheduled', 'cancelled', 'canceled'].includes(e.status))
      .map(event => ({event, rows: (event.songs || []).filter(row => confirmed(event, row))}));
    const bySong = new Map();
    for (const entry of events) for (const row of entry.rows) {
      if (!bySong.has(row.song_id)) bySong.set(row.song_id, []);
      bySong.get(row.song_id).push(entry.event);
    }
    const pool = [];
    for (const {event, rows} of events) {
      if (rows.length < 2) continue;
      for (const row of rows) {
        const answer = title(row);
        if (leaks([name(event), event.session, event.venue].join(' '), answer) || rows.filter(s => s.song_id === row.song_id || normalize(title(s)) === normalize(answer)).length !== 1) continue;
        const hints = [...new Map((bySong.get(row.song_id) || [])
          .filter(e => !sameEvent(event, e) && !leaks(name(e), answer))
          .map(e => [e.id, e])).values()];
        if (hints.length) pool.push({event, rows, missing: row, hints,
          partial: !(event.publication_state_v76r3 || event.publication_state_v76r2)?.reported_titles_complete || rows.length !== (event.songs || []).length});
      }
    }
    return pool;
  }
  function position(row) {
    return row.publication_confirmation_v76r2?.confirmed_song_and_position === true && Number.isInteger(row.sequence) && row.sequence > 0
      ? row.sequence + '曲目' : '曲順未確認';
  }
  function pick(pool, previous, random = Math.random) {
    const alternatives = pool.filter(q => !previous || q.event.id !== previous.event.id);
    const choices = alternatives.length ? alternatives : pool.filter(q => q !== previous);
    return (choices.length ? choices : pool)[Math.min(Math.floor(random() * (choices.length || pool.length)), (choices.length || pool.length) - 1)] || null;
  }
  // Inclusive calendar years of the question's concert; hints retain all years.
  const concertYear = question => Number(/^(\d{4})-\d{2}-\d{2}(?:$|T)/.exec(String(question.event.date || ''))?.[1]) || null;
  const availableYears = pool => [...new Set(pool.map(concertYear).filter(year => year !== null))].sort((a, b) => a - b);
  const filterPool = (pool, start, end) => pool.filter(question => { const year = concertYear(question); return year !== null && year >= start && year <= end; });
  function normalizeRange(start, end, min, max, changed) {
    start = Math.max(min, Math.min(max, Number(start))); end = Math.max(min, Math.min(max, Number(end)));
    if (!Number.isFinite(start)) start = min;
    if (!Number.isFinite(end)) end = max;
    if (start > end) { if (changed === 'start') start = end; else end = start; }
    return {start, end};
  }
  // Remove arrangement/version labels only when comparing choice titles.
  const choiceKey = text => normalize(String(text || '').replace(/[（(][^）)]*[）)]/g, '').replace(/[〜~～\-－—]\s*(?:超|new|20\d{2}).*?(?:ver(?:sion)?\.?|バージョン).*$/i, ''));
  function makeChoices(question, bank, random = Math.random) {
    const answer = question.missing;
    const seenIds = new Set([answer.song_id]);
    const seenTitles = new Set([choiceKey(title(answer))]);
    const candidates = [];
    for (const item of bank) {
      const row = item.missing, key = choiceKey(title(row));
      if (!key || seenIds.has(row.song_id) || seenTitles.has(key)) continue;
      seenIds.add(row.song_id); seenTitles.add(key); candidates.push(row);
    }
    function shuffle(rows) { for (let i = rows.length - 1; i > 0; i--) { const j = Math.min(i, Math.floor(random() * (i + 1))); [rows[i], rows[j]] = [rows[j], rows[i]]; } return rows; }
    return shuffle([answer, ...shuffle(candidates).slice(0, 4)]);
  }
  const api = {makeChoices, choiceKey, makePool, confirmed, position, pick, normalize, sameEvent, concertYear, availableYears, filterPool, normalizeRange};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.TimeFlightQuiz = api;
  if (typeof document === 'undefined') return;
  const allQuestions = makePool(DB.records);
  const years = availableYears(allQuestions);
  const minYear = years[0] || 0, maxYear = years[years.length - 1] || minYear;
  let range = {start: minYear, end: maxYear};
  let pool = filterPool(allQuestions, range.start, range.end);
  const dialog = document.createElement('dialog');
  dialog.id = 'setlistQuiz';
  dialog.setAttribute('aria-labelledby', 'quizTitle');
  dialog.innerHTML = '<div class="quiz-head"><h2 id="quizTitle">セトリ穴埋めクイズ</h2><button id="quizClose" autofocus>閉じる</button></div><section id="quizSetup" aria-label="出題年度を選択"><p class="quiz-note">公演の開催年で、出題範囲を選んでください。</p><div class="year-range"><div class="range-values"><span id="quizStartValue"></span><span id="quizEndValue"></span></div><div class="dual-range" role="group" aria-label="出題する公演の年の範囲"><div class="range-rail" id="quizRail"></div><input id="quizYearStart" type="range" step="1" aria-label="出題開始年 START"><input id="quizYearEnd" type="range" step="1" aria-label="出題終了年 END"></div></div><p id="quizPoolStatus" class="meta" role="status" aria-live="polite"></p><div class="quiz-controls"><button id="quizAllYears">全年</button><button id="quizStart">この範囲で出題する</button></div></section><p id="quizScope" class="meta" hidden></p><div id="quizQuestion" hidden></div><div id="quizChoices" class="quiz-choices" role="group" aria-label="回答の選択肢" hidden></div><div id="quizPlayControls" class="quiz-controls" hidden><button id="quizHint">ヒント</button><button id="quizAnswer">答えを見る</button><button id="quizNext">次の問題</button><button id="quizChangeRange">年度を変更</button></div><div id="quizFeedback" aria-live="polite" aria-atomic="true"></div>';
  document.body.append(dialog);
  const find = id => dialog.querySelector('#' + id);
  let current = null;
  let number = 0;
  function element(tag, text, cls) {
    const el = document.createElement(tag); el.textContent = text;
    if (cls) el.className = cls; return el;
  }
  function updateRange(changed) {
    range = normalizeRange(find('quizYearStart').value, find('quizYearEnd').value, minYear, maxYear, changed);
    for (const [id, value] of [['quizYearStart', range.start], ['quizYearEnd', range.end]]) {
      const el = find(id); el.value = value; el.setAttribute('aria-valuetext', value + '年');
      el.style.zIndex = id === 'quizYearStart' && range.start === maxYear ? '3' : '2';
    }
    find('quizStartValue').textContent = 'START ' + range.start;
    find('quizEndValue').textContent = 'END ' + range.end;
    const span = maxYear - minYear || 1, left = (range.start - minYear) / span * 100, right = (range.end - minYear) / span * 100;
    find('quizRail').style.background = `linear-gradient(to right,#d9d8dd 0%,#d9d8dd ${left}%,#c9751d ${left}%,#c9751d ${right}%,#d9d8dd ${right}%,#d9d8dd 100%)`;
    pool = filterPool(allQuestions, range.start, range.end);
    find('quizPoolStatus').textContent = pool.length ? 'この範囲から ' + pool.length + '問を出題できます。' : 'この範囲には出題できる確認済みデータがありません。別の年度を選んでください。';
    find('quizStart').disabled = !pool.length;
  }
  function showSetup() {
    current = null; number = 0;
    find('quizSetup').hidden = false;
    for (const id of ['quizScope', 'quizQuestion', 'quizChoices', 'quizPlayControls']) find(id).hidden = true;
    find('quizQuestion').replaceChildren(); find('quizChoices').replaceChildren(); find('quizFeedback').replaceChildren();
    updateRange(); dialog.scrollTop = 0;
  }
  for (const [id, side] of [['quizYearStart', 'start'], ['quizYearEnd', 'end']]) {
    const el = find(id); el.min = minYear; el.max = maxYear; el.value = range[side]; el.disabled = years.length < 2;
    el.oninput = () => updateRange(side);
  }
  find('quizAllYears').onclick = () => { find('quizYearStart').value = minYear; find('quizYearEnd').value = maxYear; updateRange(); };
  find('quizStart').onclick = () => {
    if (!pool.length) return;
    find('quizSetup').hidden = true;
    for (const id of ['quizScope', 'quizQuestion', 'quizChoices', 'quizPlayControls']) find(id).hidden = false;
    find('quizScope').textContent = '出題範囲：' + (range.start === range.end ? range.start + '年' : range.start + '年〜' + range.end + '年');
    current = null; number = 0; next();
    find('quizChangeRange').focus();
  };
  find('quizChangeRange').onclick = () => { showSetup(); find('quizYearStart').focus(); };
  updateRange();
  function next() {
    current = pick(pool, current); number++;
    find('quizChoices').replaceChildren();
    const area = find('quizQuestion'); area.replaceChildren();
    find('quizFeedback').replaceChildren();
    find('quizHint').disabled = !current; find('quizAnswer').disabled = !current;
    find('quizNext').disabled = pool.length < 2;
    if (!current) { area.append(element('p', '出題できる確認済みデータがありません。')); return; }
    const {event, rows, missing, partial} = current;
    area.append(element('p', '第' + number + '問 · 空欄の曲は？', 'quiz-eyebrow'), element('h3', name(event)),
      element('p', [event.date, event.session, event.venue].filter(Boolean).join(' · '), 'meta'),
      element('p', partial ? '確認できた曲の一部を掲載しています。未確認の曲は出題しません。' : '確認できたセットリストから、1曲を空欄にしました。', 'quiz-note'),
      element('p', '「曲順未確認」の行の並びは、実際の披露順を表しません。', 'meta'));
    const list = document.createElement('ul'); list.className = 'quiz-setlist';
    // Keep the stored order, but never turn an array index into a performance position.
    for (const row of rows) {
      const li = document.createElement('li');
      li.append(element('span', position(row), 'quiz-position'), element('span', row === missing ? '？？？' : title(row), row === missing ? 'quiz-blank' : ''));
      if (row === missing) li.setAttribute('aria-label', position(row) + '：空欄');
      list.append(li);
    }
    area.append(list);
    for (const row of makeChoices(current, allQuestions)) {
      const button = element('button', title(row)); button.type = 'button';
      button.onclick = () => {
        if (row.song_id === current.missing.song_id) revealAnswer('正解！ ');
        else {
          button.disabled = true;
          const old = find('quizResult'); if (old) old.remove();
          const result = element('p', '不正解：' + title(row) + ' ではありません。もう一度選べます。'); result.id = 'quizResult';
          find('quizFeedback').append(result);
        }
      };
      find('quizChoices').append(button);
    }
    dialog.scrollTop = 0;
  }
  find('quizHint').onclick = () => {
    if (!current) return;
    const hint = current.hints[0];
    const feedback = find('quizFeedback');
    const previousHint = find('quizHintText'); if (previousHint) previousHint.remove();
    const block = element('p', 'この曲は、こちらの公演でも披露されました。'); block.id = 'quizHintText';
    block.append(element('strong', name(hint)), element('span', [hint.date, hint.session].filter(Boolean).join(' · '), 'meta'));
    feedback.prepend(block); find('quizHint').disabled = true;
    block.scrollIntoView({block:'nearest'});
  };
  function revealAnswer(prefix) {
    if (!current) return;
    const old = find('quizResult'); if (old) old.remove();
    const answer = element('p', prefix + title(current.missing), 'quiz-revealed'); answer.id = 'quizResult';
    find('quizFeedback').append(answer); find('quizAnswer').disabled = true;
    for (const button of find('quizChoices').querySelectorAll('button')) button.disabled = true;
    const blank = dialog.querySelector('.quiz-blank');
    blank.textContent = title(current.missing);
    blank.parentElement.setAttribute('aria-label', position(current.missing) + '：' + title(current.missing));
    answer.scrollIntoView({block:'nearest'});
  }
  find('quizAnswer').onclick = () => revealAnswer('正答：');
  find('quizNext').onclick = next;
  find('quizClose').onclick = () => dialog.close();
  dialog.addEventListener('close', () => document.querySelector('#openSetlistQuiz').focus());
  const trigger = document.createElement('button'); trigger.id = 'openSetlistQuiz'; trigger.textContent = 'セトリクイズ';
  trigger.onclick = () => { showSetup(); dialog.showModal(); };
  document.querySelector('#openDataInfo65').before(trigger);
})(typeof window === 'undefined' ? globalThis : window);
/* Same-screen Web reader. Original pages stay cross-origin, without copying. */
(function(root){
'use strict';
function normalize(value){try{const u=new URL(value);return u.protocol==='https:'?u.origin+u.pathname.replace(/\/$/,'')+u.search:null}catch{return null}}
function isMemberArticle(value){try{const u=new URL(value);return u.protocol==='https:'&&['toki-sen.com','www.toki-sen.com'].includes(u.hostname)&&/^\/contents\/\d+\/?$/.test(u.pathname)}catch{return false}}
function rowsFor(rows,allowed){return rows.filter(r=>r.kind==='blog'&&allowed(r.url));}
function stepIndex(index,delta,length){const next=index+delta;return next>=0&&next<length?next:index;}
function normalizeRange(start,end,min,max,changed){let first=Math.max(min,Math.min(max,Math.round(Number(start)))),last=Math.max(min,Math.min(max,Math.round(Number(end))));if(!Number.isFinite(first))first=min;if(!Number.isFinite(last))last=max;if(first>last){if(changed==='start')first=last;else last=first;}return {start:first,end:last};}
function monthIndex(value){const m=/^(\d{4})-(\d{2})(?:-|$)/.exec(String(value||''));return m&&Number(m[2])>=1&&Number(m[2])<=12?Number(m[1])*12+Number(m[2])-1:null}
function monthLabel(value){return Math.floor(value/12)+'-'+String(value%12+1).padStart(2,'0')}
function monthRange(start,end,min,max,changed){const r=normalizeRange(start,end,min,max,changed);const y=Math.floor(r.end/12),m=r.end%12+1,last=new Date(Date.UTC(y,m,0)).getUTCDate();return {...r,from:monthLabel(r.start)+'-01',to:monthLabel(r.end)+'-'+String(last).padStart(2,'0')}}
function installSheet(handle,extra,content){
 let expanded=false,animation=null,pointer=null,suppressClick=false;
 const maximum=()=>Math.min(content.scrollHeight||120,Math.max(80,(root.visualViewport?.height||root.innerHeight||800)*.45));
 const current=()=>extra.getBoundingClientRect?.().height??(parseFloat(extra.style.height)||0);
 function paint(height){extra.style.height=height+'px';extra.inert=height<1;extra.setAttribute('aria-hidden',String(height<1));}
 function cancel(){if(animation){animation.cancel();animation=null;}}
 function settle(value,instant=false){const from=current();cancel();expanded=value;const to=value?maximum():0;handle.setAttribute('aria-expanded',String(value));handle.setAttribute('aria-label',value?'ブログ絞り込みを折りたたむ':'ブログ絞り込みを展開');paint(from);
  const reduced=root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if(instant||reduced||!extra.animate||Math.abs(from-to)<1){paint(to);return;}
  extra.inert=false;extra.setAttribute('aria-hidden','false');animation=extra.animate([{height:from+'px'},{height:to+'px'}],{duration:180,easing:'ease-in-out',fill:'forwards'});
  const active=animation;active.onfinish=()=>{if(animation!==active)return;animation=null;paint(to);active.cancel();};
 }
 handle.onpointerdown=event=>{if(event.button!==undefined&&event.button!==0)return;const height=current();cancel();paint(height);pointer={id:event.pointerId,y:event.clientY,lastY:event.clientY,time:event.timeStamp||Date.now(),height,target:expanded,moved:false,velocity:0};handle.setPointerCapture?.(event.pointerId);};
 handle.onpointermove=event=>{if(!pointer||pointer.id!==event.pointerId)return;const time=event.timeStamp||Date.now(),delta=pointer.y-event.clientY;if(Math.abs(delta)>7)pointer.moved=true;pointer.velocity=(pointer.lastY-event.clientY)/Math.max(1,time-pointer.time);pointer.lastY=event.clientY;pointer.time=time;paint(Math.max(0,Math.min(maximum(),pointer.height+delta)));};
 handle.onpointerup=event=>{if(!pointer||pointer.id!==event.pointerId)return;const p=pointer;pointer=null;suppressClick=true;handle.releasePointerCapture?.(event.pointerId);settle(p.moved?current()+p.velocity*120>maximum()/2:!p.target);};
 handle.onpointercancel=()=>{if(!pointer)return;const target=pointer.target;pointer=null;suppressClick=false;settle(target);};
 handle.onclick=event=>{if(suppressClick&&event?.detail!==0){suppressClick=false;return;}suppressClick=false;settle(!expanded);};
 const resizeSheet=()=>{if(!pointer)settle(expanded,true);};root.addEventListener('resize',resizeSheet);root.visualViewport?.addEventListener('resize',resizeSheet);settle(false,true);
 return {setExpanded:settle,getState:()=>({expanded,height:current(),maximum:maximum(),dragging:!!pointer}),handle,extra};
}
function installListToggle(shell,sidebar,button){
 let visible=true,animation=null;const maximum=()=>Math.max(72,Math.min(240,(root.innerWidth||400)*.22));
 const current=()=>sidebar.getBoundingClientRect?.().width??(parseFloat(shell.style.gridTemplateColumns)||maximum());
 function paint(width){shell.style.gridTemplateColumns=width+'px minmax(0,1fr)';sidebar.inert=width<1;sidebar.setAttribute('aria-hidden',String(width<1));}
 function settle(value,instant=false){const from=current();if(animation){animation.cancel();animation=null;}visible=value;const to=value?maximum():0;button.setAttribute('aria-pressed',String(value));button.title=value?'一覧を隠す':'一覧を表示';paint(from);
  if(instant||root.matchMedia?.('(prefers-reduced-motion: reduce)').matches||!shell.animate){paint(to);return;}
  sidebar.inert=false;sidebar.setAttribute('aria-hidden','false');const active=shell.animate([{gridTemplateColumns:from+'px minmax(0,1fr)'},{gridTemplateColumns:to+'px minmax(0,1fr)'}],{duration:240,easing:'ease-in-out',fill:'forwards'});animation=active;
  active.onfinish=()=>{if(animation!==active)return;animation=null;paint(to);active.cancel();};
 }
 button.onclick=()=>settle(!visible);root.addEventListener('resize',()=>settle(visible,true));settle(true,true);return{setVisible:settle,getState:()=>({visible,width:current()})};
}
function install(api){
 const doc=root.document,create=(tag,text,cls)=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
 const shell=create('section',undefined,'tf-reader');shell.hidden=true;shell.setAttribute('aria-label','ブログ読書');shell.setAttribute('tabindex','-1');
 const list=create('nav',undefined,'tf-reader-list');list.setAttribute('aria-label','条件に一致するブログ一覧');
 const sidebar=create('div',undefined,'tf-reader-sidebar'),main=create('div',undefined,'tf-reader-main'),caption=create('p',undefined,'tf-reader-caption'),viewport=create('div',undefined,'tf-reader-viewport'),frame=create('iframe');frame.title='元サイトの記事';frame.referrerPolicy='strict-origin-when-cross-origin';
 const externalNotice=create('div',undefined,'tf-reader-external');externalNotice.hidden=true;viewport.append(frame,externalNotice);main.append(caption,viewport);const footer=create('div',undefined,'tf-reader-footer'),actions=create('div',undefined,'tf-reader-actions');
 const listToggle=create('button'),share=create('button'),prev=create('button'),next=create('button'),home=create('button');
 const icon=(button,label,paths)=>{button.type='button';button.setAttribute('aria-label',label);button.title=label;button.innerHTML='<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths+'</svg>';};
 icon(listToggle,'一覧切替','<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>');icon(share,'記事を共有','<path d="M8 5l4-4 4 4M12 1v13M7 8H4v13h16V8h-3"/>');icon(prev,'前の記事','<path d="M15 4l-8 8 8 8"/>');icon(next,'次の記事','<path d="M9 4l8 8-8 8"/>');icon(home,'ホーム','<path d="M2 11l10-9 10 9M5 9v12h5v-7h4v7h5V9"/>');actions.setAttribute('role','toolbar');actions.setAttribute('aria-label','記事の操作');actions.append(listToggle,share,prev,next,home);
 const settings=create('div',undefined,'tf-reader-settings'),memberLabel=create('label','メンバー'),member=create('select'),orderLabel=create('label','並び順'),order=create('select');member.setAttribute('aria-label','読書するメンバー');order.setAttribute('aria-label','記事の並び順');
 for(const o of doc.querySelector('#readingMember').options)member.append(new Option(o.text,o.value));for(const o of doc.querySelector('#order').options)if(['asc','desc'].includes(o.value))order.append(new Option(o.text,o.value));memberLabel.append(member);orderLabel.append(order);settings.append(memberLabel,orderLabel);
 const years=create('div',undefined,'tf-reader-years'),startLabel=create('label'),endLabel=create('label'),startText=create('span'),endText=create('span'),start=create('input'),end=create('input');
 for(const [input,source]of [[start,doc.querySelector('#yearStart')],[end,doc.querySelector('#yearEnd')]]){input.type='range';input.min=source.min;input.max=source.max;input.step='1';}start.setAttribute('aria-label','開始月');end.setAttribute('aria-label','終了月');start.setAttribute('data-bound','start');end.setAttribute('data-bound','end');startLabel.append(create('span','START'),startText);endLabel.append(create('span','END'),endText);const rangeRail=create('div',undefined,'tf-reader-range'),rangeTrack=create('span',undefined,'tf-reader-range-track'),rangeSelection=create('span',undefined,'tf-reader-range-selection');rangeRail.append(rangeTrack,rangeSelection,start,end);years.append(startLabel,endLabel,rangeRail);
 const status=create('p',undefined,'tf-reader-status');status.setAttribute('role','status');const handle=create('button',undefined,'tf-reader-sheet-handle'),grip=create('span',undefined,'tf-reader-grip'),extra=create('div',undefined,'tf-reader-sheet-extra'),content=create('div',undefined,'tf-reader-sheet-content');handle.type='button';handle.append(grip,create('span','ブログ絞り込み','tf-reader-filter-label'));extra.id='tf-reader-sheet-extra';handle.setAttribute('aria-controls',extra.id);content.append(settings,years);extra.append(content);footer.append(handle,extra,actions,status);const sheet=installSheet(handle,extra,content);sidebar.append(list);shell.append(sidebar,main,footer);const listControl=installListToggle(shell,sidebar,listToggle);doc.body.append(shell);
 // iOS browser chrome changes the visual viewport independently of layout vh.
 function fitViewport(){const v=root.visualViewport,height=v?.height||root.innerHeight;if(!height||v?.scale&&Math.abs(v.scale-1)>.01)return;shell.style.height=height+'px';shell.style.top=(v?.offsetTop||0)+'px';shell.style.bottom='auto';shell.style.setProperty?.('--tf-visible-height',height+'px');}
 root.visualViewport?.addEventListener('resize',fitViewport);root.visualViewport?.addEventListener('scroll',fitViewport);root.addEventListener('resize',fitViewport);fitViewport();
 let rows=[],index=-1,page=0,oldOverflow='',returnFocus,pendingHome=false;
 const selected=()=>rows[index];
 function syncSettings(){member.value=doc.querySelector('#readingMember').value;order.value=doc.querySelector('#order').value;start.value=doc.querySelector('#yearStart').value;end.value=doc.querySelector('#yearEnd').value;drawRange();}
 function drawRange(){rangeRail.setAttribute('data-coincident',String(start.value===end.value));startText.textContent=monthLabel(Number(start.value));endText.textContent=monthLabel(Number(end.value));const span=Number(start.max)-Number(start.min)||1,low=(Number(start.value)-Number(start.min))/span*100,high=(Number(end.value)-Number(start.min))/span*100;rangeSelection.style.left=low+'%';rangeSelection.style.width=Math.max(0,high-low)+'%';start.setAttribute('aria-valuetext',monthLabel(Number(start.value)));end.setAttribute('aria-valuetext',monthLabel(Number(end.value)));}
 start.oninput=end.oninput=event=>{const value=normalizeRange(start.value,end.value,Number(start.min),Number(start.max),event.target===start?'start':'end');start.value=String(value.start);end.value=String(value.end);drawRange();};
 function renderList(){list.replaceChildren();if(page>0){const b=create('button','前の50件');b.onclick=()=>{page=Math.max(0,page-50);renderList();list.scrollTop=0};list.append(b)}
  for(let i=page;i<Math.min(rows.length,page+50);i++){const row=rows[i],external=isMemberArticle(row.url),b=create(external?'a':'button');if(external){b.href=row.url;b.target='_blank';b.rel='noopener noreferrer';b.setAttribute('aria-label',(row.title||'会員記事')+'（元サイトを別タブで開く）');}b.setAttribute('aria-current',String(i===index));b.append(create('time',row.date||'日付不明'),create('strong',row.title),create('small',Array.isArray(row.members)?row.members.join('・'):row.members||row.member||''));b.onclick=()=>{const top=list.scrollTop;show(i);if(external)list.scrollTop=top;};list.append(b)}
  if(page+50<rows.length){const b=create('button','次の50件');b.onclick=()=>{page+=50;renderList();list.scrollTop=0};list.append(b)}
  if(Math.floor(index/50)*50===page)list.querySelector('[aria-current="true"]')?.scrollIntoView?.({block:'nearest'});
 }
 function show(i,options={}){if(i<0||i>=rows.length)return false;index=i;page=Math.floor(i/50)*50;const row=selected();if(!options.restore)api.remember(row.id);const external=isMemberArticle(row.url),needsLoad=!external&&frame.src!==row.url;frame.hidden=external;externalNotice.hidden=!external;if(external){if(frame.src!=='about:blank')frame.src='about:blank';externalNotice.replaceChildren(create('p','公式会員記事は元サイトの別タブでお読みください。'),create('p','Time Flight の条件・一覧・選択位置はこのタブに残ります。元サイトで必要に応じてログインしてください。'));const externalLink=create('a','元サイトで記事を開く');externalLink.href=row.url;externalLink.target='_blank';externalLink.rel='noopener noreferrer';externalNotice.append(externalLink);}else if(needsLoad)frame.src=row.url;caption.textContent=[row.date,row.title].filter(Boolean).join(' / ');const sourceLink=create('a','元サイトで開く','tf-reader-source-link');sourceLink.href=row.url;sourceLink.target='_blank';sourceLink.rel='noopener noreferrer';caption.append(sourceLink);status.textContent=(i+1)+' / '+rows.length+'件 · '+(external?'会員記事は元サイトの別タブで表示':needsLoad?'元サイトのページを読込中':'共有で元記事リンクを取得できます');prev.disabled=i===0;next.disabled=i===rows.length-1;share.disabled=false;renderList();return true;}
 function openURL(url,options={}){const key=normalize(url),row=api.getDB().records.find(r=>r.kind==='blog'&&normalize(r.url)===key&&api.allowed(r.url));if(!key||!row)return false;
  rows=rowsFor(api.getRows(),api.allowed);if(!rows.some(r=>r.id===row.id))rows=[row];if(shell.hidden){returnFocus=doc.activeElement;oldOverflow=doc.body.style.overflow;doc.body.style.overflow='hidden';shell.hidden=false;if(!options.restore&&!root.history?.state?.timeFlightReader)root.history?.pushState({timeFlightReader:true},'',root.location.href);shell.focus();}
  syncSettings();return show(rows.findIndex(r=>r.id===row.id),options);
 }
 function hide(){sheet.setExpanded(false,true);listControl.setVisible(true,true);shell.hidden=true;frame.src='about:blank';doc.body.style.overflow=oldOverflow;returnFocus?.focus?.();}
 function close(){hide();if(root.history?.state?.timeFlightReader)root.history.back();}
 function apply(event){
  // Snapshot all desired values BEFORE touching main-screen state. Its render()
  // synchronizes controls and used to overwrite the just-selected member.
  const current=selected()?.id,requested={member:member.value,order:order.value,start:Number(start.value),end:Number(end.value),changed:event?.target===start?'start':event?.target===end?'end':null};
  api.applySettings(requested);
  rows=rowsFor(api.getRows(),api.allowed);syncSettings();const at=event?.target===order?0:rows.findIndex(r=>r.id===current);
  if(rows.length)show(at<0?0:at);else{index=-1;list.replaceChildren();frame.src='about:blank';frame.hidden=false;externalNotice.hidden=true;caption.textContent='この条件の記事はありません';status.textContent='条件を変更してください';prev.disabled=next.disabled=share.disabled=true;}
 }

 prev.onclick=()=>{if(index>0)show(index-1)};next.onclick=()=>{if(index>=0&&index<rows.length-1)show(index+1)};share.onclick=async()=>{const row=selected();if(!row)return;const data={title:row.title,url:row.url};try{if(root.navigator?.share){await root.navigator.share(data);}else if(root.navigator?.clipboard?.writeText){await root.navigator.clipboard.writeText(row.url);status.textContent='元記事リンクをコピーしました';}else{const text=doc.querySelector('#copyText'),dialog=doc.querySelector('#copyDialog');if(text&&dialog){text.value=row.url;dialog.showModal();}else status.textContent=row.url;}}catch(error){if(error.name!=='AbortError')status.textContent='共有できませんでした。もう一度お試しください';}};home.onclick=()=>{pendingHome=true;close();api.goHome?.();};member.onchange=order.onchange=start.onchange=end.onchange=apply;
 frame.addEventListener('load',()=>{if(!shell.hidden&&selected()&&!isMemberArticle(selected().url))status.textContent=(index+1)+' / '+rows.length+'件 · 共有で元記事リンクを取得できます';});
 root.addEventListener('popstate',()=>{if(!shell.hidden)hide();if(pendingHome){pendingHome=false;api.goHome?.();root.requestAnimationFrame?.(()=>root.scrollTo?.(0,0));}});
 root.addEventListener('keydown',event=>{if(shell.hidden||/^(INPUT|SELECT|TEXTAREA)$/.test(event.target?.tagName||'')||event.metaKey||event.ctrlKey||event.altKey)return;if(event.key==='ArrowRight'){event.preventDefault();next.click();}else if(event.key==='ArrowLeft'){event.preventDefault();prev.click();}else if(event.key==='Escape'){event.preventDefault();close();}});
 doc.addEventListener('click',event=>{const anchor=event.target.closest?.('a');if(!anchor||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||shell.contains(anchor))return;const key=normalize(anchor.href);if(key&&api.getDB().records.some(r=>r.kind==='blog'&&normalize(r.url)===key&&api.allowed(r.url))){if(isMemberArticle(anchor.href)){anchor.target='_blank';anchor.rel='noopener noreferrer';openURL(anchor.href);}else{event.preventDefault();event.stopPropagation();openURL(anchor.href);}}},true);
 function captureUpdateState(){return {open:!shell.hidden,id:selected()?.id,page,listScroll:list.scrollTop,listVisible:listControl.getState().visible,sheetExpanded:sheet.getState().expanded};}
 function restoreUpdateState(state){if(!state?.open)return;const row=api.getDB().records.find(r=>r.kind==='blog'&&r.id===state.id&&api.allowed(r.url));if(!row||!openURL(row.url,{restore:true}))return;page=Math.max(0,Math.min(Math.floor((rows.length-1)/50)*50,Math.floor(Number(state.page||0)/50)*50));renderList();listControl.setVisible(state.listVisible!==false,true);sheet.setExpanded(!!state.sheetExpanded,true);list.scrollTop=Math.max(0,Number(state.listScroll)||0);}
 return {openURL,close,captureUpdateState,restoreUpdateState,getState:()=>({open:!shell.hidden,index,count:rows.length,id:selected()?.id,url:selected()?.url}),getElements:()=>({shell,list,frame,externalNotice,prev,next,member,order,start,end,sidebar,viewport,footer,home,listToggle,share,sheet,listControl,actions})};
}
root.TimeFlightReader={install,normalize,isMemberArticle,rowsFor,stepIndex,normalizeRange,monthIndex,monthLabel,monthRange,installSheet,installListToggle};if(typeof module!=='undefined'&&module.exports)module.exports=root.TimeFlightReader;
})(typeof window==='undefined'?globalThis:window);

// Month sliders adapt to existing year-based era/history state and date filters.
const monthTools=window.TimeFlightReader;
function commitMonthRange(values){
 const range=monthTools.monthRange(values.start,values.end,minYear*12,maxYear*12+11,values.changed);
 yearStart=Math.floor(range.start/12);yearEnd=Math.floor(range.end/12);
 applied.from=range.from;applied.to=range.to;
 $('#from').value=applied.from;$('#to').value=applied.to;
 return range;
}
syncYearRange=function(){
 const first=monthTools.monthIndex(applied.from)??yearStart*12,last=monthTools.monthIndex(applied.to)??yearEnd*12+11;
 $('#yearLabel').textContent='';$('#rangeStartValue').textContent='START '+monthTools.monthLabel(first);$('#rangeEndValue').textContent='END '+monthTools.monthLabel(last);
 for(const [id,value]of [['yearStart',first],['yearEnd',last]]){const el=$('#'+id);el.min=minYear*12;el.max=maxYear*12+11;el.step=1;el.value=value;el.setAttribute('aria-label',id==='yearStart'?'開始月':'終了月');el.setAttribute('aria-valuetext',monthTools.monthLabel(value));el.style.zIndex=id==='yearStart'&&first===maxYear*12+11?'3':'2';}
 const span=maxYear*12+11-minYear*12||1,low=(first-minYear*12)/span*100,high=(last-minYear*12)/span*100;$('.range-rail').style.background=`linear-gradient(to right,#d9d8dd 0%,#d9d8dd ${low}%,#c9751d ${low}%,#c9751d ${high}%,#d9d8dd ${high}%,#d9d8dd 100%)`;
};
for(const id of ['yearStart','yearEnd'])$('#'+id).oninput=()=>{commitMonthRange({start:Number($('#yearStart').value),end:Number($('#yearEnd').value),changed:id==='yearStart'?'start':'end'});clearNavigation();filter();};
syncYearRange();

const webReader=window.TimeFlightReader.install({getDB:()=>DB,getRows:()=>visible,allowed:publicSourceUrl66,remember:id=>window.rememberBlog(id),goHome:()=>window.goHome(),applySettings:values=>{const range=window.TimeFlightReader.monthRange(values.start,values.end,minYear*12,maxYear*12+11,values.changed);yearStart=Math.floor(range.start/12);yearEnd=Math.floor(range.end/12);applied.from=range.from;applied.to=range.to;$('#from').value=range.from;$('#to').value=range.to;const first=range.start,last=range.end;applied.member=values.member;applied.sort=values.order==='asc'?'asc':'desc';selectedKinds=new Set(['blog']);$('#yearStart').value=first;$('#yearEnd').value=last;$('#readingMember').value=applied.member;$('#order').value=applied.sort;clearNavigation();filter();}});openReadingURL64=url=>webReader.openURL(url);window.WEB_READER_TEST=webReader;const linkedArticle=new URL(window.location.href).searchParams.get('article');if(linkedArticle){const entry=DB.records.find(r=>r.kind==='blog'&&r.id===linkedArticle);if(entry)webReader.openURL(entry.url);}


// Consent-only, tab-local update recovery. This never reads or scrolls external article bodies.
const updateSnapshotKey='timeflight.update.snapshot.v1';
function captureUpdateState(){
 const serializeNavigation=n=>({...n,ids:n.ids?[...n.ids]:null});
 const anchor=(window.scrollY||0)>0?[...$('#list').children].find(el=>el.dataset?.id&&el.getBoundingClientRect().bottom>0):null;
 const listAnchor=anchor?{id:anchor.dataset.id,offset:anchor.getBoundingClientRect().top}:null;
 return {version:1,kinds:[...selectedKinds],eras:[...selectedEras],includeOther,yearStart,yearEnd,songOrder:songOrder77,applied:{...applied},directIds:directIds?[...directIds]:null,navigationLabel,navigationStack:navigationStack.map(serializeNavigation),limit,scroll:window.scrollY||0,listAnchor,currentBlogId:window.currentBlogId||null,readingMemory,readingHistory:readingHistory64,reader:webReader.captureUpdateState(),search:{open:$('#searchDialog').open,q:$('#q').value,member:$('#member').value,from:$('#from').value,to:$('#to').value}};
}
function restoreUpdateState(state){
 if(!state||state.version!==1||!Array.isArray(state.kinds)||!Array.isArray(state.eras)||!state.applied)throw Error('保存した閲覧状態の形式を確認できません');
 const normalizeConditions=c=>({kinds:(c.kinds||[]).filter(k=>['blog','live','release','song'].includes(k)),eras:(c.eras||[]).filter(k=>['original','super'].includes(k)),includeOther:!!c.includeOther,yearStart:Math.max(minYear,Math.min(maxYear,Number(c.yearStart)||minYear)),yearEnd:Math.max(minYear,Math.min(maxYear,Number(c.yearEnd)||maxYear)),applied:{...defaults(),...Object.fromEntries(['q','member','from','to'].map(k=>[k,typeof c.applied?.[k]==='string'?c.applied[k]:''])),sort:['asc','desc'].includes(c.applied?.sort)?c.applied.sort:'desc'}});
 const c=normalizeConditions(state);selectedKinds=new Set(c.kinds);selectedEras=new Set(c.eras);includeOther=c.includeOther;yearStart=c.yearStart;yearEnd=Math.max(yearStart,c.yearEnd);applied=c.applied;songOrder77=['release','count-desc','count-asc'].includes(state.songOrder)?state.songOrder:'release';
 const known=new Set([...DB.records,...catalogView].map(r=>r.id)),ids=value=>Array.isArray(value)?new Set(value.filter(id=>known.has(id))):null;
 directIds=ids(state.directIds);if(directIds&&!directIds.size)directIds=null;navigationLabel=typeof state.navigationLabel==='string'?state.navigationLabel:'';
 navigationStack=(Array.isArray(state.navigationStack)?state.navigationStack:[]).slice(-100).map(n=>({...normalizeConditions(n),songOrder77:['release','count-desc','count-asc'].includes(n.songOrder77)?n.songOrder77:'release',ids:ids(n.ids),label:typeof n.label==='string'?n.label:'',limit:Math.max(50,Math.min(30000,Number(n.limit)||50)),scroll:Math.max(0,Number(n.scroll)||0)}));
 readingMemory=state.readingMemory===null?null:validReadingMemory(state.readingMemory)||readingMemory;
 readingHistory64=(Array.isArray(state.readingHistory)?state.readingHistory:readingHistory64).filter(validReadingMemory).slice(0,5).map(readingPair64);
 window.currentBlogId=known.has(state.currentBlogId)?state.currentBlogId:null;
 filter();limit=Math.max(50,Math.min(visible.length,Number(state.limit)||50));render();updateResumeReading();
 for(const id of ['q','member','from','to'])$('#'+id).value=typeof state.search?.[id]==='string'?state.search[id]:applied[id];
 webReader.restoreUpdateState(state.reader);
 if(state.search?.open&&!state.reader?.open)$('#searchDialog').showModal();
 const restoreScroll=()=>{let y=Math.max(0,Number(state.scroll)||0);if(state.listAnchor){const anchor=[...$('#list').children].find(el=>el.dataset?.id===state.listAnchor.id);if(anchor){const rect=anchor.getBoundingClientRect(),offset=Math.max(44-rect.height,Number(state.listAnchor.offset)||0);y=Math.max(0,(window.scrollY||0)+rect.top-offset);}}window.scrollTo?.(0,y);};restoreScroll();requestAnimationFrame(restoreScroll);
 return true;
}
window.TimeFlightUpdateState=Object.freeze({capture:captureUpdateState,restore:restoreUpdateState,key:updateSnapshotKey});
try{const raw=sessionStorage.getItem(updateSnapshotKey);if(raw){const saved=JSON.parse(raw);if(saved.schema===1&&saved.state&&restoreUpdateState(saved.state)){sessionStorage.removeItem(updateSnapshotKey);window.dispatchEvent(new CustomEvent('timeflight:state-restored'));}}}catch(error){window.dispatchEvent(new CustomEvent('timeflight:state-restore-error',{detail:error.message}));}
window.dispatchEvent(new CustomEvent('timeflight:ready'));

})().catch(e=>{document.body.prepend(Object.assign(document.createElement('p'),{textContent:'データを読み込めません: '+e.message}));});
