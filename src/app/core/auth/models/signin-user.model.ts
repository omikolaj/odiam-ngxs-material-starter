/**
 * Signin user model.
 */
export interface SigninUser {
	email: string;
	password: string;
	rememberMe: boolean;
	staySignedIn: boolean;
}
