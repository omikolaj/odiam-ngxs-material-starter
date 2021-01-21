import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountRoutingModule } from './account-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { AccountFacadeService } from './account-facade.service';
import { NgxsModule } from '@ngxs/store';
import { QRCodeModule } from 'angularx-qrcode';
import { AccountComponent } from './account/account.component';
import { DashboardState } from './account/account.store.state';
import { GeneralComponent } from './general/general.component';
import { SecurityContainerComponent } from './security-container/security-container.component';
import { TwoFactorAuthenticationCodesComponent } from './security-container/two-factor-authentication-codes/two-factor-authentication-codes.component';
import { AccountSecurityState } from './security-container/security-container.store.state';
import { TwoFactorAuthenticationSetupWizardComponent } from './security-container/two-factor-authentication-setup-wizard/two-factor-authentication-setup-wizard.component';
import { TwoFactorAuthenticationComponent } from './security-container/two-factor-authentication/two-factor-authentication.component';
import { TwoFactorAuthenticationState } from './security-container/two-factor-authentication/two-factor-authentication.store.state';

/**
 * User account module.
 */
@NgModule({
	declarations: [
		AccountComponent,
		GeneralComponent,
		SecurityContainerComponent,
		TwoFactorAuthenticationComponent,
		TwoFactorAuthenticationCodesComponent,
		TwoFactorAuthenticationSetupWizardComponent
	],
	imports: [
		CommonModule,
		AccountRoutingModule,
		QRCodeModule,
		SharedModule,
		NgxsModule.forFeature([DashboardState, AccountSecurityState, TwoFactorAuthenticationState])
	],
	providers: [AccountFacadeService]
})
export class AccountModule {}
