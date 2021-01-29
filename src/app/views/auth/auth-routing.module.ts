import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthContainerComponent } from './auth-container/auth-container.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
	{
		path: '',
		component: AuthContainerComponent,
		data: { title: 'odm.auth' }
	},
	{
		path: 'forgot-password',
		component: ForgotPasswordComponent,
		data: { title: 'odm.auth' }
	},
	{
		path: 'reset-password',
		component: ResetPasswordComponent,
		data: { title: 'odm.auth' }
	}
];

/**
 * Auth routing module.
 */
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AuthRoutingModule {}
