import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountRoutingModule } from './account-routing.module';

import { NgxsModule } from '@ngxs/store';
import { AccountComponent } from './account/account.component';
import { AccountSecurityState } from './security-container/security-container.store.state';
import { SharedModule } from 'app/shared/shared.module';

/**
 * User account module.
 */
@NgModule({
	declarations: [
		AccountComponent
		// GeneralContainerComponent,
		// SecurityContainerComponent,
		// TwoFactorAuthenticationComponent,
		// TwoFactorAuthenticationCodesComponent,
		// TwoFactorAuthenticationSetupWizardComponent,
		// PersonalEmailComponent
		// ChangePasswordContainerComponent,
		// ChangePasswordComponent
	],
	imports: [
		CommonModule,
		AccountRoutingModule,
		// QRCodeModule,
		SharedModule,
		NgxsModule.forFeature([AccountSecurityState])
	]
	// providers: [AccountSandboxService]
})
export class AccountModule {}
