import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { AuthGuardService } from 'app/core/core.module';

const routes: Routes = [
	{
		path: '',
		component: AccountComponent,
		canActivate: [AuthGuardService],
		data: { title: 'odm.account' },
		children: [
			{
				path: '',
				redirectTo: 'general',
				pathMatch: 'full'
			},
			{
				path: 'general',
				loadChildren: () => import('./general-container/general-container.module').then((m) => m.GeneralContainerModule)
			},
			{
				path: 'security',
				loadChildren: () => import('./security-container/security-container.module').then((m) => m.SecurityContainerModule)
			}
		]
	}
];

/**
 * User account routing module.
 */
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AccountRoutingModule {}
