/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable, Inject, PLATFORM_ID, Optional } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

const ACTIVE_GHOST = 'odm-ghost-active';

/**
 * GhostAnimationService injectable.
 */
@Injectable()
export class OdmGhostAnimationService {
	/**
	 * Body HTML of the entire app.
	 */
	private _body: HTMLBodyElement;

	/**
	 * Creates an instance of ghost animation service.
	 * @param _platformId
	 * @param _document
	 */
	constructor(@Inject(PLATFORM_ID) private _platformId: any, @Optional() @Inject(DOCUMENT) _document: any) {
		if (isPlatformBrowser(_platformId)) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this._body = _document.body as HTMLBodyElement;
		}
	}

	/**
	 * Syncs animation.
	 */
	syncAnimation(): void {
		if (this._body) {
			this._body.classList.remove(ACTIVE_GHOST);

			void this._body.offsetWidth;
			this._body.classList.add(ACTIVE_GHOST);
		}
	}
}
