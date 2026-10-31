/* Generated release header: scripts/build-release.cjs replaces only this line. */
const RELEASE = {"id":"tf-c8d2ce0bacd5975b1102","shell":"./shell.c69345cb21c1.html","files":[{"url":"./data-manifest.0a8650351714.json","sha256":"0a8650351714e568a6d9fbfba325bf7e8d2ddfedfe41b1cbd3d201aeab798ab4"},{"url":"./app.bfba2bd52337.js","sha256":"bfba2bd5233742f25044881a510b78b891275bd2cc84be49989d2b3e43f0dc03"},{"url":"./pwa-register.7afca98e36d2.js","sha256":"7afca98e36d25186060398a8f340c1fc8dab17230fb5b87544fcbe52aa8364f5"},{"url":"./shell.c69345cb21c1.html","sha256":"c69345cb21c14ca5f0da2267af5146159171d1010add18a287137160ff43a947"},{"url":"./data/core.67d604f4d1ba.json","sha256":"67d604f4d1babb4024b3c0890ff59a9c485e4b1f617e80e5ee4355e48c19b2ef"},{"url":"./data/details.4efe6b738798.json","sha256":"4efe6b7387988921691bf6673495826ade564fc534351625b661aa7b53ee6fc6"},{"url":"./data/live.040e1bf5c056.json","sha256":"040e1bf5c0567cc6c4ec29e82e96e0c79afe4704f05eee1b9cb0b5f5190d071e"},{"url":"./manifest.webmanifest","sha256":"650b22659012506a6f841a0415e826359d6074b13f2f17e56861a5a85b2bcbc4"},{"url":"./assets/loader.f2f1bd06ad7c.js","sha256":"f2f1bd06ad7c0edf6fcd1ad1a666c9aa5803f8853fa483bc6893ef75ae1d6e2e"},{"url":"./assets/image.b882a72aff23.png","sha256":"b882a72aff234099822157d672f335f9a975c45be29d144631dfa25ad787de7d"},{"url":"./icons/apple-touch-icon.feb7b9084a14.png","sha256":"feb7b9084a1482452c8f58582708fc93fd137ec7fb30588c1ae384ec041ee8cd"},{"url":"./icons/apple-touch-icon.png","sha256":"9940a29f298e8d620968fe8e4bebbb844ccb8bbce5ff6a5c3168d20a43c73fcc"},{"url":"./icons/icon-192.97e070d7f51f.png","sha256":"97e070d7f51fa4a128ba421d0ca6efffdc68b9178298c0714a068ddf29ab4345"},{"url":"./icons/icon-192.png","sha256":"fbe148053b656945a601bdcf18736f785d6f682d5540586110979d43e3747b42"},{"url":"./icons/icon-512.c5198fd7e703.png","sha256":"c5198fd7e7034384f14f8148a8ae3f2978af6652cf7b0d4796782076779f6ce5"},{"url":"./icons/icon-512.png","sha256":"614f2a2623ceb8010414031abb4db666dc561119a23ad80457439dfaa2bfe264"},{"url":"./data/blog-2013.46b71da9dd00.json","sha256":"46b71da9dd0004902761bd14fa0a6932135c1895692d04802840ae1f55cab2d2"},{"url":"./data/blog-2014.8f941a12f1d9.json","sha256":"8f941a12f1d961bc9ce1ef7da819e5dbb1796c266ff4815fd5019bafacc7dc4f"},{"url":"./data/blog-2015.4d35244110d7.json","sha256":"4d35244110d71ae1cabf2725f49e78cddee78a7a723fbae20da21661a86c52ae"},{"url":"./data/blog-2016.7b444ce4b352.json","sha256":"7b444ce4b352e952ca766aebfc251c04314aba253bac50ee0b1cf1e3beafab43"},{"url":"./data/blog-2017.9e70240fa309.json","sha256":"9e70240fa3092a17e02664ef794198aba774210152eaae89e2a99c8591d8171a"},{"url":"./data/blog-2018.f37ab64d1eac.json","sha256":"f37ab64d1eacfdc77c0cafd5173ac3f0a8a5d3eb434583a0de5efd997ec81ddd"},{"url":"./data/blog-2019.43562e9158bf.json","sha256":"43562e9158bf4e8c3a663e8d356a2bbcc4d4ddd1316d7219bc0a5303cdc4ad98"},{"url":"./data/blog-2020.d7ec4ff83af7.json","sha256":"d7ec4ff83af7a1cec64dfae124276697950102c0aad3a43ebc2abef53076bf58"},{"url":"./data/blog-2021.a9c7fc02a9cf.json","sha256":"a9c7fc02a9cf8e8a7823f6d0bbe390184f7945a487ee5548e348017a5655d64c"},{"url":"./data/blog-2022.9b756f4ca604.json","sha256":"9b756f4ca60413a1589955b9a1d176f70d0dc1cd59129719c68ee7f682e41785"},{"url":"./data/blog-2023.40456d280217.json","sha256":"40456d280217d218597091cd7ba9d9d680c0c43923d50e9b510cc2ee1563fcb3"},{"url":"./data/blog-2024.b62da9361398.json","sha256":"b62da9361398b2ebf2929ef611081abe2f0cc1e58424165beb4002f0b6ed469a"},{"url":"./data/blog-2025.b3b2abceaa70.json","sha256":"b3b2abceaa700b7d623cfa901d9cd2ea722aba62526d034afbe7e26af408e9b9"},{"url":"./data/blog-2026.f825b5c183b4.json","sha256":"f825b5c183b4a6897ff197868fec219759b90caf02f8a66246898f6a05af01fe"},{"url":"./data/release.ead375bf241a.json","sha256":"ead375bf241a3459131628468a2259b15569c4ad54ec5a23339e02a9261b30c4"}]};
/*
 * Each installed worker owns a complete, integrity-checked release. Immutable
 * document/app/data URLs keep already-open tabs on their existing generation.
 * Never delete another release's cache: it can still belong to an open tab.
 */
'use strict';
const BASE = new URL('./', self.location.href);
const PREFIX = 'timeflight-release-';
const CACHE = PREFIX + RELEASE.id;
const MARKER = new URL('./__timeflight_release__/' + RELEASE.id, BASE).href;
const FILES = new Map();
let validation;

function releaseURL(path) {
  const url = new URL(path, BASE);
  if (url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname) || url.search || url.hash) {
    throw new Error('Invalid release path');
  }
  return url.href;
}
function configure() {
  if (!/^[a-zA-Z0-9_-]{8,80}$/.test(RELEASE.id) || RELEASE.id === 'BUILD_REQUIRED' || !Array.isArray(RELEASE.files) || !RELEASE.files.length) {
    throw new Error('Release must be built before publication');
  }
  for (const file of RELEASE.files) {
    const url = releaseURL(file.url);
    if (!/^[a-f0-9]{64}$/.test(file.sha256) || FILES.has(url)) throw new Error('Invalid release manifest');
    FILES.set(url, file.sha256);
  }
  if (!FILES.has(releaseURL(RELEASE.shell))) throw new Error('Missing release shell');
}
configure();

async function digest(response) {
  const bytes = await response.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), value => value.toString(16).padStart(2, '0')).join('');
}
async function checked(response, expected) {
  if (!response || !response.ok || ['opaque', 'opaqueredirect'].includes(response.type) || await digest(response.clone()) !== expected) {
    throw new Error('Release asset integrity check failed');
  }
  return response;
}
async function complete() {
  const cache = await caches.open(CACHE), marker = await cache.match(MARKER);
  if (!marker || await marker.text() !== JSON.stringify(RELEASE)) return false;
  try {
    for (const [url, hash] of FILES) await checked(await cache.match(url), hash);
    return true;
  } catch { return false; }
}
function ready() {
  if (!validation) validation = complete().finally(() => { validation = undefined; });
  return validation;
}
async function installRelease() {
  if (await complete()) return;
  // Never overwrite a completed generation if a faulty build reused its ID.
  const existingMarker = await (await caches.open(CACHE)).match(MARKER);
  if (existingMarker && await existingMarker.text() !== JSON.stringify(RELEASE)) throw new Error('Release ID was reused');
  // Only this not-yet-installed generation can be replaced. Prior releases stay.
  await caches.delete(CACHE);
  const cache = await caches.open(CACHE), entries = [...FILES];
  let next = 0, failure;
  await Promise.all(Array.from({length:Math.min(4, entries.length)}, async () => {
    while (!failure && next < entries.length) {
      const [url, hash] = entries[next++];
      try {
        const response = await fetch(new Request(url, {cache:'no-store', credentials:'omit', redirect:'error'}));
        await checked(response, hash);
        await cache.put(url, response);
      } catch (error) { failure = error; }
    }
  }));
  if (failure) { await caches.delete(CACHE); throw failure; }
  // A ready marker is written last, only after all response bodies were checked.
  await cache.put(MARKER, new Response(JSON.stringify(RELEASE), {headers:{'Content-Type':'application/json'}}));
  validation = undefined;
}
self.addEventListener('install', event => event.waitUntil(installRelease()));
self.addEventListener('activate', event => event.waitUntil(ready().then(value => {
  if (!value) throw new Error('Incomplete release cache');
  // No claim, cache eviction, broadcast reload or automatic skipWaiting.
})));
self.addEventListener('message', event => {
  const message = event.data || {}, reply = value => event.ports?.[0]?.postMessage(value);
  if (message.type === 'TIME_FLIGHT_STATUS') {
    event.waitUntil(ready().then(value => reply({type:'TIME_FLIGHT_STATUS', release:RELEASE.id, ready:value})));
  } else if (message.type === 'TIME_FLIGHT_ACTIVATE' && message.release === RELEASE.id) {
    event.waitUntil((async () => {
      if (!await ready()) { reply({type:'TIME_FLIGHT_ERROR', release:RELEASE.id}); return; }
      await self.skipWaiting();
      reply({type:'TIME_FLIGHT_ACTIVATING', release:RELEASE.id});
    })());
  }
});

function immutableURL(url) {
  return /\.[a-f0-9]{12,64}\.(?:js|json|html|png|webp|svg|css)$/.test(url.pathname);
}
async function knownAsset(url) {
  const own = await caches.open(CACHE), expected = FILES.get(url.href);
  if (expected) {
    const cached = await own.match(url.href);
    if (cached) return checked(cached, expected);
    // Evicted files may be repaired online, but never substituted with new bytes.
    const fresh = await checked(await fetch(new Request(url, {cache:'no-store', credentials:'omit', redirect:'error'})), expected);
    await own.put(url.href, fresh.clone());
    return fresh;
  }
  if (immutableURL(url)) {
    for (const name of await caches.keys()) {
      if (!name.startsWith(PREFIX) || name === CACHE) continue;
      const previous = await caches.open(name), cached = await previous.match(url.href);
      if (!cached) continue;
      // The previous release's complete manifest authenticates an old-tab asset.
      const id = name.slice(PREFIX.length), marker = await previous.match(new URL('./__timeflight_release__/' + id, BASE).href);
      if (!marker) continue;
      try {
        const manifest = await marker.json(), entry = manifest.files?.find(file => releaseURL(file.url) === url.href);
        if (manifest.id === id && entry && /^[a-f0-9]{64}$/.test(entry.sha256)) return await checked(cached, entry.sha256);
      } catch { /* An incomplete/corrupt release is not a fallback. */ }
    }
    // Legacy worker caches lack manifests; content-hashed file names still allow
    // a bounded integrity check of the first 12+ SHA-256 characters.
    const shortHash = url.pathname.match(/\.([a-f0-9]{12,64})\.[^.]+$/)?.[1];
    for (const name of await caches.keys()) {
      if (!name.startsWith('timeflight-') || name.startsWith(PREFIX)) continue;
      const cached = await (await caches.open(name)).match(url.href);
      if (cached && (await digest(cached.clone())).startsWith(shortHash)) return cached;
    }
    const fresh = await fetch(new Request(url, {cache:'no-store', credentials:'omit', redirect:'error'}));
    if (!fresh.ok || !(await digest(fresh.clone())).startsWith(shortHash)) throw new Error('Unknown asset integrity check failed');
    return fresh;
  }
  return fetch(url.href);
}
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return;
  if (request.mode === 'navigate') {
    event.respondWith(knownAsset(new URL(RELEASE.shell, BASE)));
    return;
  }
  // Queries cannot bypass verification of a known release asset.
  const canonical = new URL(url); canonical.search = ''; canonical.hash = '';
  if (FILES.has(canonical.href) || immutableURL(canonical)) event.respondWith(knownAsset(canonical));
});
