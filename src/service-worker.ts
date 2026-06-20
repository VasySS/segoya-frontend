/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const worker = globalThis as unknown as ServiceWorkerGlobalScope;
const cacheName = `segoya-${version}`;
const assets = [...build, ...files];
// eslint-disable-next-line unicorn/no-unreadable-new-expression
const assetPaths = new Set(assets.map((asset) => new URL(asset, worker.location.origin).pathname));

worker.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(cacheName)
			.then((cache) => cache.addAll(assets))
			.then(() => worker.skipWaiting())
	);
});

worker.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key)))
			)
			.then(() => worker.clients.claim())
	);
});

worker.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);
	if (url.origin !== worker.location.origin) return;

	if (assetPaths.has(url.pathname)) {
		event.respondWith(caches.match(event.request).then((cached) => cached ?? fetch(event.request)));
		return;
	}

	if (event.request.mode === 'navigate') {
		event.respondWith(
			fetch(event.request).catch(async () => {
				const offlinePage = await caches.match(new URL('offline.html', worker.registration.scope));
				return offlinePage ?? Response.error();
			})
		);
	}
});
