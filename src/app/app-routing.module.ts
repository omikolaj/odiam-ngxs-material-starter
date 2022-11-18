import { NgModule } from '@angular/core';
import { NoPreloading, RouterModule, Routes } from '@angular/router';

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
	imports: [
		RouterModule.forRoot(routes, {
			useHash: false,
			scrollPositionRestoration: 'enabled',
			preloadingStrategy: NoPreloading,
			enableTracing: false
		})
	],
	exports: [RouterModule]
})
export default class AppRoutingModule {}
