import { Inject, Injectable, Optional } from '@angular/core';
import { getActionTypeFromInstance, NgxsNextPluginFn, NgxsPlugin } from '@ngxs/store';
import { LocalStorage } from './local-storage';

/** Prefix for all local storage values for this application. */
const APP_PREFIX = 'odm-';

/**
 * Handles setting, removing and loading state from local storage.
 */
@Injectable({
	providedIn: 'root'
})
export class LocalStorageService implements NgxsPlugin {
	/**
	 * Represents the initial action dispatched by NGXS when first initialized.
	 * NGXS dispatches this event when store is being initialized, before all the ngxsOnInit Life-cycle events.
	 */
	private readonly INIT = '@@INIT';

	/**
	 * Dispatched by NGXS when a new lazy-loaded state being added to the store.
	 * NOTE: when UPDATE was used in the if([INIT, <UPDATE>].includes(...) it was causing issues where it would override valid state, with state from local storage.
	 */
	private readonly UPDATE = '@@UPDATE_STATE';

	/**
	 * Creates an instance of local storage service.
	 * @param _localStorage
	 */
	constructor(@Inject(LocalStorage) private _localStorage) {}

	/**
	 * Handles NgxsPlugin.
	 * @param state
	 * @param action
	 * @param next
	 * @returns
	 */
	handle(state: any, action: any, next: NgxsNextPluginFn) {
		if ([this.INIT].includes(getActionTypeFromInstance(action))) {
			state = { ...state, ...this.loadInitialState() };
		}
		return next(state, action);
	}

	/**
	 * Loads initial state from local storage.
	 * @returns state restored from local storage.
	 */
	// static loadInitialState(): any {
	// 	return Object.keys(localStorage).reduce((state: any, storageKey) => {
	// 		if (storageKey.includes(APP_PREFIX)) {
	// 			const stateKeys = storageKey
	// 				.replace(APP_PREFIX, '')
	// 				.toLowerCase()
	// 				.split('.')
	// 				.map((key) =>
	// 					key
	// 						.split('-')
	// 						.map((token, index) => (index === 0 ? token : token.charAt(0).toUpperCase() + token.slice(1)))
	// 						.join('')
	// 				);
	// 			let currentStateRef = state;
	// 			stateKeys.forEach((key, index) => {
	// 				if (index === stateKeys.length - 1) {
	// 					currentStateRef[key] = JSON.parse(localStorage.getItem(storageKey));
	// 					return;
	// 				}
	// 				currentStateRef[key] = currentStateRef[key] || {};
	// 				currentStateRef = currentStateRef[key];
	// 			});
	// 		}
	// 		return state;
	// 	}, {});
	// }

	/**
	 * Loads initial state from local storage.
	 * @returns state restored from local storage.
	 */
	loadInitialState(): any {
		return Object.keys(this._localStorage).reduce((state: any, storageKey) => {
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
		this._localStorage.setItem(`${APP_PREFIX}${key}`, JSON.stringify(value));
	}

	/**
	 * Gets an item from local storage.
	 * @param key
	 * @returns item
	 */
	getItem(key: string): any {
		return JSON.parse(this._localStorage.getItem(`${APP_PREFIX}${key}`));
	}

	/**
	 * Removes item from local storage by the given key.
	 * @param key by which to remove the item.
	 */
	removeItem(key: string): void {
		this._localStorage.removeItem(`${APP_PREFIX}${key}`);
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
