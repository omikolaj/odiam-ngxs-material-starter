import { Injectable } from '@angular/core';

/** Prefix for all local storage values for this application. */
const APP_PREFIX = 'odm-';

/**
 * Handles setting, removing and loading state from local storage.
 */
@Injectable({
	providedIn: 'root'
})
export class LocalStorageService {
	constructor() {}

	/**
	 * Loads initial state from local storage.
	 * @returns initial state
	 */
	static loadInitialState(): any {
		return Object.keys(localStorage).reduce((state: any, storageKey) => {
			if (storageKey.includes(APP_PREFIX)) {
				const stateKeys = storageKey
					.replace(APP_PREFIX, '')
					.toLowerCase()
					.split('.')
					.map((key) =>
						key
							.split('-')
							.map((token, index) => (index === 0 ? token : token.charAt(0).toUpperCase() + token.slice(1)))
							.join('')
					);
				let currentStateRef = state;
				stateKeys.forEach((key, index) => {
					if (index === stateKeys.length - 1) {
						currentStateRef[key] = JSON.parse(localStorage.getItem(storageKey));
						return;
					}
					currentStateRef[key] = currentStateRef[key] || {};
					currentStateRef = currentStateRef[key];
				});
			}
			return state;
		}, {});
	}

	/**
	 * Sets an item in local storage.
	 * @param key
	 * @param value
	 */
	setItem(key: string, value: any): void {
		localStorage.setItem(`${APP_PREFIX}${key}`, JSON.stringify(value));
	}

	/**
	 * Gets an item from local storage.
	 * @param key
	 * @returns item
	 */
	getItem(key: string): any {
		return JSON.parse(localStorage.getItem(`${APP_PREFIX}${key}`));
	}

	/**
	 * Removes item from local storage by the given key.
	 * @param key by which to remove the item.
	 */
	removeItem(key: string): void {
		localStorage.removeItem(`${APP_PREFIX}${key}`);
	}

	/**
	 * Tests that localStorage exists, can be written to, and read from.
	 */
	testLocalStorage(): void {
		const testValue = 'testValue';
		const testKey = 'testKey';
		const errorMessage = 'localStorage did not return expected value';

		this.setItem(testKey, testValue);
		const retrievedValue = this.getItem(testKey) as string;
		this.removeItem(testKey);

		if (retrievedValue !== testValue) {
			throw new Error(errorMessage);
		}
	}
}
