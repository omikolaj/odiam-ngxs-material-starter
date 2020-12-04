import { Injectable, Inject, PLATFORM_ID, Optional } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export const ACTIVE_GHOST = 'odm-ghost-active';

@Injectable()
export class GhostAnimationService {
	private _body: HTMLBodyElement;

	constructor(@Inject(PLATFORM_ID) private _platformId: any, @Optional() @Inject(DOCUMENT) private _document: any) {
		if (isPlatformBrowser(_platformId)) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this._body = _document.body as HTMLBodyElement;
		}
	}

	syncAnimation(): void {
		if (this._body) {
			this._body.classList.remove(ACTIVE_GHOST);

			void this._body.offsetWidth;
			this._body.classList.add(ACTIVE_GHOST);
		}
	}
}
