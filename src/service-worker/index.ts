import { version } from '$app/env';
import { assets, immutable } from '$app/manifest';
import { asset } from '$app/paths';
import { self } from '$app/service-worker';

const cacheName = `segoya-${version}`;
const cachedAssets = [
	...immutable.map(({ path }) => path),
	...assets.map(({ path }) => asset(path))
];
const assetPaths = new Set(
	cachedAssets.map((cachedAsset) => new URL(cachedAsset, self.location.origin).pathname)
);

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(cacheName)
			.then((cache) => cache.addAll(cachedAssets))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key)))
			)
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);
	if (url.origin !== self.location.origin) return;

	if (assetPaths.has(url.pathname)) {
		event.respondWith(caches.match(event.request).then((cached) => cached ?? fetch(event.request)));
		return;
	}

	if (event.request.mode === 'navigate') {
		event.respondWith(
			fetch(event.request).catch(async () => {
				const offlinePage = await caches.match(new URL('offline.html', self.registration.scope));
				return offlinePage ?? Response.error();
			})
		);
	}
});
