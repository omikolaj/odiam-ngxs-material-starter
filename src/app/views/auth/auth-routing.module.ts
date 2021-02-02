import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { AuthContainerOneComponent } from './auth-container-one/auth-container-one.component';
import { AuthContainerComponent } from './auth-container/auth-container.component';
import { SignInContainerComponent } from './sign-in-container/sign-in-container.component';
import { SignUpContainerComponent } from './sign-up-container/sign-up-container.component';

const routes: Routes = [
	{
		path: '',
		component: AuthContainerOneComponent,
		children: [
			{
				path: 'sign-in',
				component: SignInContainerComponent
			},
			{
				path: 'sign-up',
				component: SignUpContainerComponent
			}
		]
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
