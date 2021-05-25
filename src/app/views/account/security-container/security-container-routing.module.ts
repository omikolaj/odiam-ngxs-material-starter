import { NgModule } from '@angular/core';
import { SecurityContainerComponent } from './security-container.component';

import { Routes, RouterModule } from '@angular/router';

import { ChangePasswordComponent } from './change-password/change-password.component';
import { TwoFactorAuthenticationSetupWizardContainerComponent } from './two-factor-authentication-setup-wizard-container/two-factor-authentication-setup-wizard-container.component';

const routes: Routes = [
	{
		path: '',
		component: SecurityContainerComponent,
		children: [
			{
				path: 'two-factor-authentication-setup',
				component: TwoFactorAuthenticationSetupWizardContainerComponent
			},
			{
				path: 'change-password',
				component: ChangePasswordComponent
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SecurityContainerRoutingModule {}
