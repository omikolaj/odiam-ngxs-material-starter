import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { AuthGuardService } from 'app/core/core.module';
import { SecurityContainerComponent } from './security-container/security-container.component';
import { ChangePasswordContainerComponent } from './security-container/change-password-container/change-password-container.component';
import { GeneralContainerComponent } from './general-container/general-container.component';
import { TwoFactorAuthenticationSetupWizardContainerComponent } from './security-container/two-factor-authentication-setup-wizard-container/two-factor-authentication-setup-wizard-container.component';
import { ChangeEmailContainerComponent } from './general-container/change-email-container/change-email-container.component';

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
				component: GeneralContainerComponent
			},
			{
				path: 'general/change-email',
				component: ChangeEmailContainerComponent
			},
			{
				path: 'security',
				component: SecurityContainerComponent
			},
			{
				path: 'security/change-password',
				component: ChangePasswordContainerComponent
			},
			{
				path: 'security/two-factor-authentication-setup',
				component: TwoFactorAuthenticationSetupWizardContainerComponent
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
