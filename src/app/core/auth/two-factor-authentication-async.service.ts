import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BACKEND_API_URL } from '../api-url-injection-token';
import { UserRecoveryCodes } from '../models/account/security/user-recovery-codes.model';
import { TwoFactorAuthenticationSetup } from '../models/account/security/two-factor-authentication-setup.model';
import { TwoFactorAuthenticationVerificationCode } from '../models/account/security/two-factor-authentication-verification-code.model';
import { TwoFactorAuthenticationSetupResult } from '../models/account/security/two-factor-authentication-setup-result.model';
import { AccessToken } from '../models/auth/access-token.model';
import { TwoFactorRecoveryCode } from '../models/auth/two-factor-recovery-code.model';

/**
 * Two factor authentication async service.
 */
@Injectable({
	providedIn: 'root'
})
export class TwoFactorAuthenticationAsyncService {
	/**
	 * Headers of users service.
	 */
	private readonly _headers = new HttpHeaders({
		'Content-Type': 'application/json'
	});

	/**
	 * Creates an instance of two factor authentication async service.
	 * @param _apiUrl
	 * @param _http
	 */
	constructor(@Inject(BACKEND_API_URL) private _apiUrl: string, private _http: HttpClient) {}

	/**
	 * Gets authenticator setup information.
	 * @returns authenticator
	 */
	setupAuthenticator$(): Observable<TwoFactorAuthenticationSetup> {
		return this._http.get<TwoFactorAuthenticationSetup>(`${this._apiUrl}/2fa/setup-authenticator`, { headers: this._headers });
	}

	/**
	 * Verifys authenticator verification code is valid.
	 * @param model
	 * @returns TwoFactorAuthenticationSetupResult
	 */
	verifyAuthenticator$(model: TwoFactorAuthenticationVerificationCode): Observable<TwoFactorAuthenticationSetupResult> {
		return this._http.post<TwoFactorAuthenticationSetupResult>(`${this._apiUrl}/2fa/verify-authenticator`, JSON.stringify(model), {
			headers: this._headers
		});
	}

	/**
	 * Verifys two step verification code. This is used once user has already set-up two factor authentication.
	 * @param model
	 * @returns AccessToken
	 */
	verifyTwoStepVerificationCode$(model: TwoFactorAuthenticationVerificationCode): Observable<AccessToken> {
		return this._http.post<AccessToken>(`${this._apiUrl}/2fa/verify-two-step-verification-code`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Redeems user's recovery code.
	 * @param model
	 * @returns AccessToken
	 */
	redeemRecoveryCode$(model: TwoFactorRecoveryCode): Observable<AccessToken> {
		return this._http.post<AccessToken>(`${this._apiUrl}/2fa/redeem-recovery-code`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Generates two factor authentication recovery codes.
	 * @returns UserRecoveryCodes
	 */
	generate2FaRecoveryCodes$(): Observable<UserRecoveryCodes> {
		return this._http.post<UserRecoveryCodes>(`${this._apiUrl}/2fa/generate-recovery-codes`, '', { headers: this._headers });
	}

	/**
	 * Disables two factor authentication for the given user.
	 * @returns Disable2FaResult.
	 */
	disable2Fa$(): Observable<void> {
		return this._http.post<void>(`${this._apiUrl}/2fa/disable`, '', { headers: this._headers });
	}
}
