import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountRoutingModule } from './account-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { AccountSandboxService } from './account-sandbox.service';
import { NgxsModule } from '@ngxs/store';
import { QRCodeModule } from 'angularx-qrcode';
import { AccountComponent } from './account/account.component';
import { GeneralContainerComponent } from './general-container/general-container.component';
import { SecurityContainerComponent } from './security-container/security-container.component';
import { TwoFactorAuthenticationCodesComponent } from './security-container/two-factor-authentication-codes/two-factor-authentication-codes.component';
import { AccountSecurityState } from './security-container/security-container.store.state';
import { TwoFactorAuthenticationSetupWizardComponent } from './security-container/two-factor-authentication-setup-wizard/two-factor-authentication-setup-wizard.component';
import { TwoFactorAuthenticationComponent } from './security-container/two-factor-authentication/two-factor-authentication.component';
import { TwoFactorAuthenticationState } from './security-container/two-factor-authentication/two-factor-authentication.store.state';
import { PersonalEmailComponent } from './general-container/personal-email/personal-email.component';
import { AccountGeneralState } from './general-container/general-container.store.state';
import { ChangePasswordContainerComponent } from './security-container/change-password-container/change-password-container.component';
import { ChangePasswordComponent } from './security-container/change-password/change-password.component';

/**
 * User account module.
 */
@NgModule({
	declarations: [
		AccountComponent,
		GeneralContainerComponent,
		SecurityContainerComponent,
		TwoFactorAuthenticationComponent,
		TwoFactorAuthenticationCodesComponent,
		TwoFactorAuthenticationSetupWizardComponent,
		PersonalEmailComponent,
		ChangePasswordContainerComponent,
		ChangePasswordComponent
	],
	imports: [
		CommonModule,
		AccountRoutingModule,
		QRCodeModule,
		SharedModule,
		NgxsModule.forFeature([AccountSecurityState, AccountGeneralState, TwoFactorAuthenticationState])
	],
	providers: [AccountSandboxService]
})
export class AccountModule {}
