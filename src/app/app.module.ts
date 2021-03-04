import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, Injector, APP_INITIALIZER } from '@angular/core';
import { CoreModule } from '../app/core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app/app.component';
import { setRootInjector } from './root-injector';
import { MatDialogModule } from '@angular/material/dialog';
import { AuthService } from './core/auth/auth.service';
import { Store } from '@ngxs/store';
import { AuthState } from './core/auth/auth.store.state';
import { filter, tap } from 'rxjs/operators';
import { InitSessionResult } from './core/auth/models/init-session-result.model';

/**
 * Apps initializer factory for setting up user session.
 * @param store
 * @param authService
 * @returns
 */
export function appInitializerFactory(store: Store, authService: AuthService) {
	return (): Promise<InitSessionResult> => {
		const isAuthenticated = store.selectSnapshot(AuthState.selectIsAuthenticated);
		const staySignedIn = store.selectSnapshot(AuthState.selectStaySignedIn);
		const explicitlySignedOut = store.selectSnapshot(AuthState.selectDidUserExplicitlySignout);
		return authService
			.renewExpiredSessionOrSignUserOut(isAuthenticated, staySignedIn, explicitlySignedOut)
			.pipe(
				filter((result) => result.succeeded),
				tap((result) => authService.authenticate(result.accessToken, staySignedIn))
			)
			.toPromise();
	};
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
			deps: [Store, AuthService]
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
