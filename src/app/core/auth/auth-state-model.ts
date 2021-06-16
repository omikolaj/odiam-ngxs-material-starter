import { ActiveAuthType } from '../models/auth/active-auth-type.model';

/**
 * Key used as a key for user auth object when persisting to local storage.
 */
export const AUTH_KEY = 'AUTH';

/**
 * Auth state model.
 */
export interface AuthStateModel {
	/**
	 * Determines if user is authenticated.
	 */
	isAuthenticated: boolean;

	/**
	 * Currently logged in user id.
	 */
	userId: string;

	/**
	 *  Determines if remember me option is selected.
	 */
	rememberMe: boolean;

	/**
	 * If remember me is set to true this is user's username used to sign in.
	 */
	username: string;

	/**
	 * Encode json web token.
	 */
	access_token: string;

	/**
	 * Time when the access token will expire.
	 */
	expires_at: number;

	/**
	 * Whether sign-in or sign-up component should be displayed or forgot-password styles should be applied.
	 */
	activeAuthType: ActiveAuthType;

	/**
	 * Whether the two step verification code user entered has been successfully verified by the server.
	 */
	is2StepVerificationSuccessful: boolean;

	/**
	 * Whether two step verification protocol is required to sign user in.
	 */
	is2StepVerificationRequired: boolean;

	/**
	 * Whether recovery code was successfully redeemed.
	 */
	isRedeemRecoveryCodeSuccessful: boolean;

	/**
	 * Whether user's password reset requested completed without errors.
	 */
	passwordResetCompleted: boolean;

	/**
	 * Whether user's registration completed without errors.
	 */
	registrationCompleted: boolean;

	/**
	 * Whether there is an outgoing request to verify user's change email token and update to new email.
	 */
	changeEmailConfirmationInProgress: boolean;

	/**
	 * Whether there is an outgoing request to confirm user's email.
	 */
	emailConfirmationInProgress: boolean;

	/**
	 * Two step verification provider. Currently only supporting authenticator. (authenticator, email, sms etc.)
	 */
	twoStepVerificationProvider: string;

	/**
	 * User's email.
	 */
	twoStepVerificationEmail: string;

	/**
	 * Whether user is currently in the process of signing in.
	 */
	signingInUserInProgress: boolean;

	/**
	 * Whether forgot password form was successfully submitted.
	 */
	forgotPasswordRequestSubmittedSuccessfully: boolean;

	/**
	 * Whether there is an outgoing request to send forgot password instructions.
	 */
	forgotPasswordRequestSubmitting: boolean;
}
