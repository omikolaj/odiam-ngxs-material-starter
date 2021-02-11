import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, Injector } from '@angular/core';
import { CoreModule } from '../app/core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app/app.component';
import { setRootInjector } from './root-injector';
import { MatDialogModule } from '@angular/material/dialog';

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
	bootstrap: [AppComponent]
})
export class AppModule {
	constructor(injector: Injector) {
		setRootInjector(injector);
	}
}
