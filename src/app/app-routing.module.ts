import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'about',
		pathMatch: 'full'
	},
	{
		path: 'auth',
		loadChildren: () => import('./views/auth/auth.module').then((m) => m.AuthModule)
	},
	{
		path: 'account',
		loadChildren: () => import('./views/account/account.module').then((m) => m.AccountModule)
	},
	{
		path: 'about',
		loadChildren: () => import('./views/about/about.module').then((m) => m.AboutModule)
	},
	{
		path: 'feature-list',
		loadChildren: () => import('./views/feature-list/feature-list.module').then((m) => m.FeatureListModule)
	},
	{
		path: 'settings',
		loadChildren: () => import('./views/settings/settings.module').then((m) => m.SettingsModule)
	},
	{
		path: 'examples',
		loadChildren: () => import('./views/examples/examples.module').then((m) => m.ExamplesModule)
	},
	{
		path: '**',
		redirectTo: 'about'
	}
];

/**
 * App routing module.
 */
@NgModule({
	// useHash supports github.io demo page, remove in your app
	imports: [
		RouterModule.forRoot(routes, {
			useHash: false,
			scrollPositionRestoration: 'enabled',
			preloadingStrategy: PreloadAllModules,
			enableTracing: false
		})
	],
	exports: [RouterModule]
})
export class AppRoutingModule {}
