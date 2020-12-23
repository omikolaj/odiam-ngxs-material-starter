import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { TwoFactorAuthenticationComponent } from './two-factor-authentication/two-factor-authentication.component';
import { SharedModule } from 'app/shared/shared.module';
import { DashboardFacadeService } from './dashboard-facade.service';
import { NgxsModule } from '@ngxs/store';
import { QRCodeModule } from 'angularx-qrcode';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardState } from './dashboard/dashboard.store.state';
import { ProfileDetailsComponent } from './profile-details/profile-details.component';
import { TwoFactorAuthenticationState } from './two-factor-authentication/two-factor-authentication.store.state';
import { TwoFactorAuthenticationSetupComponent } from './two-factor-authentication-setup/two-factor-authentication-setup.component';

/**
 * User dashboard module.
 */
@NgModule({
	declarations: [DashboardComponent, TwoFactorAuthenticationComponent, ProfileDetailsComponent, TwoFactorAuthenticationSetupComponent],
	imports: [CommonModule, DashboardRoutingModule, QRCodeModule, SharedModule, NgxsModule.forFeature([TwoFactorAuthenticationState, DashboardState])],
	providers: [DashboardFacadeService]
})
export class DashboardModule {}
