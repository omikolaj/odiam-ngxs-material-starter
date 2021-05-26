import { NgModule } from '@angular/core';
import { SecurityContainerComponent } from './security-container.component';
import { Routes, RouterModule } from '@angular/router';
import { TwoFactorAuthenticationSetupWizardContainerComponent } from './two-factor-authentication-setup-wizard-container/two-factor-authentication-setup-wizard-container.component';
import { ChangePasswordContainerComponent } from './change-password-container/change-password-container.component';

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
				component: ChangePasswordContainerComponent
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SecurityContainerRoutingModule {}
