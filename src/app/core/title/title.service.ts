import { Title } from '@angular/platform-browser';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';

import { environment as env } from '../../../environments/environment';

/**
 * Title service used to set the web app title.
 */
@Injectable({
	providedIn: 'root'
})
export class TitleService {
	/**
	 * Creates an instance of title service.
	 * @param translateService
	 * @param title
	 */
	constructor(private translateService: TranslateService, private title: Title) {}

	/**
	 * Sets web page title.
	 * @param snapshot
	 * @param [lazyTranslateService]
	 */
	setTitle(snapshot: ActivatedRouteSnapshot, lazyTranslateService?: TranslateService): void {
		let lastChild = snapshot;
		while (lastChild.children.length) {
			lastChild = lastChild.children[0];
		}
		const { title } = lastChild.data;
		const translate = lazyTranslateService || this.translateService;
		if (title) {
			translate
				.get(title)
				.pipe(filter((translatedTitle: string) => translatedTitle !== title))
				.subscribe((translatedTitle) => this.title.setTitle(`${translatedTitle} - ${env.appName}`));
		} else {
			this.title.setTitle(env.appName);
		}
	}
}
