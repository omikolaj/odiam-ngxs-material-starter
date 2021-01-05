import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountRoutingModule } from './account-routing.module';
import { TwoFactorAuthenticationComponent } from './two-factor-authentication/two-factor-authentication.component';
import { SharedModule } from 'app/shared/shared.module';
import { AccountFacadeService } from './account-facade.service';
import { NgxsModule } from '@ngxs/store';
import { QRCodeModule } from 'angularx-qrcode';
import { AccountComponent } from './account/account.component';
import { DashboardState } from './account/account.store.state';
import { TwoFactorAuthenticationState } from './two-factor-authentication/two-factor-authentication.store.state';
import { TwoFactorAuthenticationSetupComponent } from './two-factor-authentication-setup/two-factor-authentication-setup.component';
import { GeneralComponent } from './general/general.component';
import { AccountSecurityContainerComponent } from './account-security/account-security-container.component';
import { TwoFactorAuthenticationDetailsComponent } from './two-factor-authentication-details/two-factor-authentication-details.component';
import { TwoFactorAuthenticationCodesComponent } from './two-factor-authentication-codes/two-factor-authentication-codes.component';
import { TwoFactorAuthentication2Component } from './two-factor-authentication2/two-factor-authentication2.component';
import { AccountSecurityState } from './account-security/account-security.store.state';
import { TwoFactorAuthenticationSetupWizardComponent } from './two-factor-authentication-setup-wizard/two-factor-authentication-setup-wizard.component';
import { TwoFactorAuthentication2State } from './two-factor-authentication2/two-factor-authentication2.store.state';

/**
 * User account module.
 */
@NgModule({
	declarations: [
		AccountComponent,
		TwoFactorAuthenticationComponent,
		TwoFactorAuthenticationSetupComponent,
		GeneralComponent,
		AccountSecurityContainerComponent,
		TwoFactorAuthenticationDetailsComponent,
		TwoFactorAuthenticationCodesComponent,
		TwoFactorAuthentication2Component,
		TwoFactorAuthenticationSetupWizardComponent
	],
	imports: [
		CommonModule,
		AccountRoutingModule,
		QRCodeModule,
		SharedModule,
		NgxsModule.forFeature([TwoFactorAuthenticationState, DashboardState, AccountSecurityState, TwoFactorAuthentication2State])
	],
	providers: [AccountFacadeService]
})
export class AccountModule {}
