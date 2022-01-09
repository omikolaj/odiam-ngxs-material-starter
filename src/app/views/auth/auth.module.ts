import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { AuthContainerComponent } from './auth-container/auth-container.component';
import { AuthDialogComponent } from './auth-dialog/auth-dialog.component';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthSandboxService } from './auth-sandbox.service';
import { ChangeEmailTokenContainerComponent } from './change-email-token-container/change-email-token-container.component';
import { ChangeEmailTokenComponent } from './change-email-token/change-email-token.component';
import { EmailConfirmationContainerComponent } from './email-confirmation-container/email-confirmation-container.component';
import { EmailConfirmationComponent } from './email-confirmation/email-confirmation.component';
import { ForgotPasswordContainerComponent } from './forgot-password-container/forgot-password-container.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RedeemRecoveryCodeComponent } from './redeem-recovery-code/redeem-recovery-code.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SignInContainerComponent } from './sign-in-container/sign-in-container.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpContainerComponent } from './sign-up-container/sign-up-container.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SuccessfulRegistrationComponent } from './successful-registration/successful-registration.component';
import { TwoStepVerificationComponent } from './two-step-verification/two-step-verification.component';

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
		ForgotPasswordContainerComponent,
		AuthDialogComponent,
		TwoStepVerificationComponent,
		RedeemRecoveryCodeComponent,
		EmailConfirmationComponent,
		SuccessfulRegistrationComponent,
		EmailConfirmationContainerComponent,
		ChangeEmailTokenContainerComponent,
		ChangeEmailTokenComponent
	],
	imports: [CommonModule, AuthRoutingModule, SharedModule],
	providers: [AuthSandboxService]
})
export class AuthModule {}
