import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LazyElementsModule } from '@angular-extensions/elements';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SharedModule } from '../../shared/shared.module';
import { environment } from '../../../environments/environment';
import { ExamplesRoutingModule } from './examples-routing.module';
import { ExamplesComponent } from './examples/examples.component';
import { ExamplesSandboxService } from './examples-sandbox.service';

/**
 * Loads specific translations file.
 * @param http
 * @returns translation loader factory.
 */
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
	return new TranslateHttpLoader(http, `${environment.i18nPrefix}/assets/i18n/examples/`, '.json');
}

/**
 * Examples module.
 */
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
	declarations: [ExamplesComponent],
	providers: [ExamplesSandboxService]
})
export class ExamplesModule {
	constructor() {}
}
