import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthContainerComponent } from './auth-container/auth-container.component';
import { SignInContainerComponent } from './sign-in-container/sign-in-container.component';
import { SignUpContainerComponent } from './sign-up-container/sign-up-container.component';
import { ForgotPasswordContainerComponent } from './forgot-password-container/forgot-password-container.component';
import { TwoStepVerificationComponent } from './two-step-verification/two-step-verification.component';
import { RedeemRecoveryCodeComponent } from './redeem-recovery-code/redeem-recovery-code.component';

const routes: Routes = [
	{
		path: '',
		component: AuthContainerComponent,
		children: [
			{
				path: 'sign-in',
				component: SignInContainerComponent
			},
			{
				path: 'sign-up',
				component: SignUpContainerComponent
			},
			{
				path: 'forgot-password',
				component: ForgotPasswordContainerComponent
			},
			{
				path: 'reset-password',
				component: ResetPasswordComponent
			},
			{
				path: 'two-step-verification',
				component: TwoStepVerificationComponent
			},
			{
				path: 'redeem-recovery-code',
				component: RedeemRecoveryCodeComponent
			},
			{
				path: '**',
				redirectTo: 'sign-in'
			}
		]
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
