import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthContainerComponent } from './auth-container/auth-container.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
	{
		path: '',
		component: AuthContainerComponent
	},
	{
		path: 'forgot-password',
		component: ForgotPasswordComponent
	},
	{
		path: 'reset-password',
		component: ResetPasswordComponent
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
