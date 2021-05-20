import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountRoutingModule } from './account-routing.module';

import { AccountSandboxService } from './account-sandbox.service';
import { NgxsModule } from '@ngxs/store';

import { AccountComponent } from './account/account.component';
import { GeneralContainerComponent } from './general-container/general-container.component';

import { AccountSecurityState } from './security-container/security-container.store.state';

import { PersonalEmailComponent } from './general-container/personal-email/personal-email.component';
import { SharedModule } from 'app/shared/shared.module';

/**
 * User account module.
 */
@NgModule({
	declarations: [
		AccountComponent,
		GeneralContainerComponent,
		// SecurityContainerComponent,
		// TwoFactorAuthenticationComponent,
		// TwoFactorAuthenticationCodesComponent,
		// TwoFactorAuthenticationSetupWizardComponent,
		PersonalEmailComponent
		// ChangePasswordContainerComponent,
		// ChangePasswordComponent
	],
	imports: [
		CommonModule,
		AccountRoutingModule,
		// QRCodeModule,
		SharedModule,
		NgxsModule.forFeature([AccountSecurityState])
	],
	providers: [AccountSandboxService]
})
export class AccountModule {}
