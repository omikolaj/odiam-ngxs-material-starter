import { Injector } from '@angular/core';

export let rootInjector: Injector;

/**
 * Sets root injector.
 * @param injector
 */
export function setRootInjector(injector: Injector): void {
	rootInjector = injector;
}
