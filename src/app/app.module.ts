import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, Injector, APP_INITIALIZER } from '@angular/core';
import { CoreModule } from '../app/core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app/app.component';
import { setRootInjector } from './root-injector';
import { MatDialogModule } from '@angular/material/dialog';
import { AppInitializerService } from './core/services/app-initializer.service';

/**
 * Apps initializer factory for setting up user session.
 * @param store
 * @param authService
 * @returns
 */
export function appInitializerFactory(appInitializerService: AppInitializerService) {
	return (): Promise<void> => appInitializerService.initUserSession();
}

/**
 * App module.
 */
@NgModule({
	imports: [
		// angular
		BrowserAnimationsModule,
		BrowserModule,
		// Has to be added here, injector error if its added in SharedModule.
		MatDialogModule,

		// core
		CoreModule,

		// app
		AppRoutingModule
	],
	declarations: [AppComponent],
	providers: [
		{
			provide: APP_INITIALIZER,
			useFactory: appInitializerFactory,
			multi: true,
			deps: [AppInitializerService]
		}
	],
	bootstrap: [AppComponent]
})
export class AppModule {
	/**
	 * Creates an instance of app module.
	 * @param injector
	 */
	constructor(injector: Injector) {
		setRootInjector(injector);
	}
}
