import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LazyElementsModule } from '@angular-extensions/elements';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { SharedModule } from '../../shared/shared.module';
import { environment } from '../../../environments/environment';
import { ExamplesRoutingModule } from './examples-routing.module';
import { ExamplesComponent } from './examples/examples.component';

export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, `${environment.i18nPrefix}/assets/i18n/examples/`, '.json');
}

@NgModule({
	imports: [
		LazyElementsModule,
		SharedModule,
		ExamplesRoutingModule,
		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient]
			},
			isolate: true
		})
	],
	declarations: [ExamplesComponent]
})
export class ExamplesModule {
	constructor() {}
}
