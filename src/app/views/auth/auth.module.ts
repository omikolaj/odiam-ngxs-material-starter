import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { AuthFacadeService } from './auth-facade.service';
import { SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignInContainerComponent } from './sign-in-container/sign-in-container.component';
import { SignUpContainerComponent } from './sign-up-container/sign-up-container.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { AuthContainerComponent } from './auth-container/auth-container.component';
import { ForgotPasswordContainerComponent } from './forgot-password-container/forgot-password-container.component';

/**
 * Auth module.
 */
@NgModule({
	declarations: [
		ForgotPasswordComponent,
		ResetPasswordComponent,
		SignInComponent,
		SignUpComponent,
		AuthContainerComponent,
		SignInContainerComponent,
		SignUpContainerComponent,
		ForgotPasswordContainerComponent
	],
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
					},
					{
						id: FacebookLoginProvider.PROVIDER_ID,
						provider: new FacebookLoginProvider('1732458220252838')
					}
				]
			} as SocialAuthServiceConfig
		}
	]
})
export class AuthModule {}
