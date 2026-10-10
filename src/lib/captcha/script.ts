type ReadyCallback = 'segoyaTurnstileOnLoad' | 'segoyaSmartCaptchaOnLoad';

const scripts = new Map<string, Promise<void>>();

export function loadCaptchaScript(
	src: string,
	callback: ReadyCallback,
	isReady: () => boolean
): Promise<void> {
	const pending = scripts.get(src);
	if (pending) return pending;
	if (isReady()) return Promise.resolve();

	const loadedScript = new Promise<void>((resolve, reject) => {
		const script = document.createElement('script');
		script.src = src;
		script.async = true;

		function cleanup() {
			clearTimeout(timeout);
			script.removeEventListener('error', failed);
			Reflect.deleteProperty(globalThis, callback);
		}

		function failed() {
			cleanup();
			script.remove();
			reject(new Error('CAPTCHA SDK failed to load'));
		}

		function loaded() {
			if (!isReady()) return;
			cleanup();
			resolve();
		}

		const timeout = setTimeout(failed, 15_000);
		window[callback] = loaded;
		script.addEventListener('error', failed);
		document.head.append(script);
	});
	const promise = loadedScript.catch((error: unknown) => {
		scripts.delete(src);
		throw error;
	});

	scripts.set(src, promise);
	return promise;
}
