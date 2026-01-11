import { browser } from '$app/environment';
import { defaultProvider } from '$lib/constants/minimapProviders';
import type { UserSettings } from '$lib/types/user';
import { writable, type Writable } from 'svelte/store';

class LocalStore<T> {
	private store: Writable<T>;
	#key: string;

	constructor(key: string, initial: T) {
		this.#key = key;

		let value = initial;

		if (browser) {
			const item = localStorage.getItem(key);
			if (item) {
				const stored = JSON.parse(item) as T;
				value = Object.assign({}, initial, stored);
			}
			localStorage.setItem(key, JSON.stringify(value));
		}

		this.store = writable(value);

		// Persist on every change
		this.store.subscribe((v) => {
			if (browser) {
				localStorage.setItem(this.#key, JSON.stringify(v));
			}
		});
	}

	subscribe(run: (value: T) => void) {
		return this.store.subscribe(run);
	}

	set value(value: T) {
		this.store.set(value);
	}

	update(fn: (value: T) => T) {
		this.store.update(fn);
	}
}

export const userSettingsKey = 'userSettings';

export const UserSettingsStore = new LocalStore<UserSettings>(userSettingsKey, {
	// default provider
	minimapProvider: defaultProvider.value,
	compassEnabled: true,
	sounds: {
		enabled: true,
		volume: 0.3
	}
});
