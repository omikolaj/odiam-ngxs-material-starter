import { NgModule } from '@angular/core';
import { SecurityContainerComponent } from './security-container.component';

import { Routes, RouterModule } from '@angular/router';

import { ChangePasswordComponent } from './change-password/change-password.component';
import { TwoFactorAuthenticationSetupWizardComponent } from './two-factor-authentication-setup-wizard/two-factor-authentication-setup-wizard.component';

const routes: Routes = [
	{
		path: '',
		component: SecurityContainerComponent,
		children: [
			{
				path: 'two-factor-authentication-setup',
				component: TwoFactorAuthenticationSetupWizardComponent
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
