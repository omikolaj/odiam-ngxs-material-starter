import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandler, NgModule, Optional, SkipSelf } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithub, faInstagram, faMediumM, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';
import {
	faBars,
	faCheck,
	faCog,
	faExclamationTriangle,
	faPaperPlane,
	faPlayCircle,
	faPowerOff,
	faRocket,
	faTachometerAlt,
	faUserCircle
} from '@fortawesome/free-solid-svg-icons';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsRouterPluginModule, RouterStateSerializer } from '@ngxs/router-plugin';
import { NgxsModule, NGXS_PLUGINS } from '@ngxs/store';
import {
	downUpFadeInAnimation,
	fadeInAnimation,
	leftRightFadeInAnimation,
	rightLeftFadeInAnimation,
	upDownFadeInAnimation
} from 'app/core/animations/element.animations';
import { I18nModule } from 'app/i18n/i18n.module';
import { environment } from '../../environments/environment';
import { AnimationsService } from './animations/animations.service';
import { routeAnimations, ROUTE_ANIMATIONS_ELEMENTS } from './animations/route.animations';
import { BACKEND_API_URL } from './api-url-injection-token';
import { AuthGuardService } from './auth/auth-guard.service';
import { AuthState } from './auth/auth.store.state';
import { AppErrorHandler } from './error-handler/app-error-handler.service';
import { ServerErrorService } from './error-handler/server-error.service';
import { HttpAccessTokenInterceptor } from './http-interceptors/http-access-token.interceptor';
import { HttpErrorInterceptor } from './http-interceptors/http-error.interceptor';
import { HttpStatusInterceptor } from './http-interceptors/http-status.interceptor';
import { LocalStorageService } from './local-storage/local-storage.service';
import { LogService } from './logger/log.service';
import { InitNgxsState } from './meta-reducers/init-ngxs-state';
import { NotificationService } from './notifications/notification.service';
import { CustomSerializer } from './router/custom-serializer';
import { SettingsState } from './settings/settings.store.state';
import { TitleService } from './title/title.service';

export {
	TitleService,
	routeAnimations,
	LocalStorageService,
	ROUTE_ANIMATIONS_ELEMENTS,
	rightLeftFadeInAnimation,
	leftRightFadeInAnimation,
	upDownFadeInAnimation,
	downUpFadeInAnimation,
	fadeInAnimation,
	AnimationsService,
	AuthGuardService,
	NotificationService
};

/**
 * Core module.
 */
@NgModule({
	imports: [
		// angular
		CommonModule,
		HttpClientModule,
		FormsModule,

		// material
		MatSidenavModule,
		MatToolbarModule,
		MatListModule,
		MatMenuModule,
		MatIconModule,
		MatSelectModule,
		MatTooltipModule,
		MatSnackBarModule,
		MatButtonModule,

		// Translations
		I18nModule,

		// ngxs
		NgxsModule.forRoot([SettingsState, AuthState], {
			developmentMode: !environment.production,
			selectorOptions: {
				suppressErrors: false,
				injectContainerState: true
			},
			compatibility: {
				strictContentSecurityPolicy: true
			}
		}),
		NgxsRouterPluginModule.forRoot(),
		NgxsLoggerPluginModule.forRoot({
			collapsed: true,
			disabled: environment.production
		}),

		// 3rd party
		FontAwesomeModule
	],
	providers: [
		{ provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: HttpStatusInterceptor, multi: true, deps: [LogService, ServerErrorService] },
		{ provide: HTTP_INTERCEPTORS, useClass: HttpAccessTokenInterceptor, multi: true },
		{ provide: ErrorHandler, useClass: AppErrorHandler },
		{ provide: RouterStateSerializer, useClass: CustomSerializer },
		// { provide: NGXS_PLUGINS, useValue: initStateFromLocalStorage, multi: true },
		{ provide: NGXS_PLUGINS, useClass: InitNgxsState, multi: true },
		{ provide: BACKEND_API_URL, useValue: environment.backend.apiUrl }
	],
	exports: [
		// angular
		FormsModule,

		// material
		MatSidenavModule,
		MatToolbarModule,
		MatListModule,
		MatMenuModule,
		MatIconModule,
		MatSelectModule,
		MatTooltipModule,
		MatSnackBarModule,
		MatButtonModule,

		// 3rd party
		FontAwesomeModule,

		// Translations
		I18nModule
	]
})
export class CoreModule {
	/**
	 * Creates an instance of core module.
	 * @param parentModule
	 * @param faIconLibrary
	 */
	constructor(
		@Optional()
		@SkipSelf()
		parentModule: CoreModule,
		faIconLibrary: FaIconLibrary
	) {
		if (parentModule) {
			throw new Error('CoreModule is already loaded. Import only in AppModule');
		}
		faIconLibrary.addIcons(
			faCog,
			faBars,
			faRocket,
			faPowerOff,
			faUserCircle,
			faTachometerAlt,
			faPlayCircle,
			faGithub,
			faMediumM,
			faTwitter,
			faInstagram,
			faYoutube,
			faCheck,
			faExclamationTriangle,
			faPaperPlane
		);
	}
}
