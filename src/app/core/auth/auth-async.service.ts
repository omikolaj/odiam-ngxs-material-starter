import { Injectable, Inject } from '@angular/core';
import { BACKEND_API_URL } from '../api-url-injection-token';
import { AccessToken } from './models/access-token.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SignupUser } from './models/signup-user.model';
import { Observable } from 'rxjs';
import { SigninUser } from './models/signin-user.model';
import { RenewAccessTokenResult } from './models/renew-access-token-result.model';
import { SocialUser } from 'angularx-social-login';
import { AuthResponse } from './models/auth-response.model';
import { TwoFactorAuthenticationVerificationCode } from 'app/views/account/security-container/two-factor-authentication/models/two-factor-authentication-verification-code.model';
import { TwoFactorRecoveryCode } from './models/two-factor-recovery-code.model';

/**
 * Async authentication service.
 */
@Injectable({
	providedIn: 'root'
})
export class AuthAsyncService {
	private readonly _headers = new HttpHeaders({
		'Content-Type': 'application/json'
	});

	/**
	 * Creates an instance of auth service.
	 * @param apiUrl
	 */
	constructor(@Inject(BACKEND_API_URL) private apiUrl: string, private http: HttpClient) {}

	/**
	 * Signs new users up.
	 * @param model
	 * @returns access token
	 */
	signup$(model: SignupUser): Observable<AccessToken> {
		return this.http.post<AccessToken>(`${this.apiUrl}/auth/signup`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Signs users in.
	 * @param model
	 * @returns access token
	 */
	signin$(model: SigninUser): Observable<AuthResponse> {
		return this.http.post<AuthResponse>(`${this.apiUrl}/auth/signin`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Verifys two step verification code. This is used once user has already set-up two factor authentication.
	 * @param model
	 * @returns AccessToken
	 */
	verifyTwoStepVerificationCode$(model: TwoFactorAuthenticationVerificationCode): Observable<AccessToken> {
		return this.http.post<AccessToken>(`${this.apiUrl}/auth/verify-two-step-verification-code`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Redeems user's recovery code.
	 * @param model
	 * @returns AccessToken
	 */
	redeemRecoveryCode$(model: TwoFactorRecoveryCode): Observable<AccessToken> {
		return this.http.post<AccessToken>(`${this.apiUrl}/auth/redeem-recovery-code`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Signs users out.
	 * @returns void
	 */
	signout$(): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/auth/signout`, { headers: this._headers });
	}

	/**
	 * Signs user in with google.
	 * @param model
	 * @returns access token
	 */
	signinWithGoogle$(model: SocialUser): Observable<AccessToken> {
		return this.http.post<AccessToken>(`${this.apiUrl}/auth/external-signin-google`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Signs user in with facebook.
	 * @param model
	 * @returns access token
	 */
	signinWithFacebook$(model: SocialUser): Observable<AccessToken> {
		return this.http.post<AccessToken>(`${this.apiUrl}/auth/external-signin-facebook`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Trys to renew access token.
	 * @returns renew access token
	 */
	tryRenewAccessToken$(): Observable<RenewAccessTokenResult> {
		return this.http.post<RenewAccessTokenResult>(`${this.apiUrl}/auth/refresh-token`, { headers: this._headers });
	}
}
