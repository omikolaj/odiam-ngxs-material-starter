import { Injectable, Inject } from '@angular/core';
import { BACKEND_API_URL } from '../api-url-injection-token';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SocialUser } from 'angularx-social-login';
import { SignupUser } from '../models/auth/signup-user.model';
import { AccessToken } from '../models/auth/access-token.model';
import { SigninUser } from '../models/auth/signin-user.model';
import { AuthResponse } from '../models/auth/auth-response.model';
import { TwoFactorAuthenticationVerificationCode } from '../models/account/security/two-factor-authentication-verification-code.model';
import { TwoFactorRecoveryCode } from '../models/auth/two-factor-recovery-code.model';
import { RenewAccessTokenResult } from '../models/auth/renew-access-token-result.model';

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
	 * @param _apiUrl
	 * @param _http
	 */
	constructor(@Inject(BACKEND_API_URL) private _apiUrl: string, private _http: HttpClient) {}

	/**
	 * Signs new users up.
	 * @param model
	 * @returns access token
	 */
	signup$(model: SignupUser): Observable<AccessToken> {
		return this._http.post<AccessToken>(`${this._apiUrl}/auth/signup`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Signs users in.
	 * @param model
	 * @returns access token
	 */
	signin$(model: SigninUser): Observable<AuthResponse> {
		return this._http.post<AuthResponse>(`${this._apiUrl}/auth/signin`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Verifys two step verification code. This is used once user has already set-up two factor authentication.
	 * @param model
	 * @returns AccessToken
	 */
	verifyTwoStepVerificationCode$(model: TwoFactorAuthenticationVerificationCode): Observable<AccessToken> {
		return this._http.post<AccessToken>(`${this._apiUrl}/auth/verify-two-step-verification-code`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Redeems user's recovery code.
	 * @param model
	 * @returns AccessToken
	 */
	redeemRecoveryCode$(model: TwoFactorRecoveryCode): Observable<AccessToken> {
		return this._http.post<AccessToken>(`${this._apiUrl}/auth/redeem-recovery-code`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Signs users out.
	 * @returns void
	 */
	signout$(): Observable<void> {
		return this._http.delete<void>(`${this._apiUrl}/auth/signout`, { headers: this._headers });
	}

	/**
	 * Signs user in with google.
	 * @param model
	 * @returns access token
	 */
	signinWithGoogle$(model: SocialUser): Observable<AccessToken> {
		return this._http.post<AccessToken>(`${this._apiUrl}/auth/external-signin-google`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Signs user in with facebook.
	 * @param model
	 * @returns access token
	 */
	signinWithFacebook$(model: SocialUser): Observable<AccessToken> {
		return this._http.post<AccessToken>(`${this._apiUrl}/auth/external-signin-facebook`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Trys to renew access token.
	 * @returns renew access token
	 */
	tryRenewAccessToken$(): Observable<RenewAccessTokenResult> {
		return this._http.post<RenewAccessTokenResult>(`${this._apiUrl}/auth/refresh-token`, { headers: this._headers });
	}
}
