import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthContainerComponent } from './auth-container/auth-container.component';
import { SharedModule } from 'app/shared/shared.module';
import { AuthComponent } from './auth/auth.component';
import { AuthFacadeService } from './auth-facade.service';
import { SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider } from 'angularx-social-login';

/**
 * Auth module.
 */
@NgModule({
	declarations: [AuthContainerComponent, AuthComponent],
	imports: [CommonModule, AuthRoutingModule, SharedModule, SocialLoginModule],
	providers: [
		AuthFacadeService,
		{
			provide: 'SocialAuthServiceConfig',
			useValue: {
				autoLogin: false,
				providers: [
					{
						id: GoogleLoginProvider.PROVIDER_ID,
						provider: new GoogleLoginProvider('1017420985910-q2v7dnvoa9vscu2fup6dmuvo2sm2p1s6.apps.googleusercontent.com')
					}
				]
			} as SocialAuthServiceConfig
		}
	]
})
export class AuthModule {}
