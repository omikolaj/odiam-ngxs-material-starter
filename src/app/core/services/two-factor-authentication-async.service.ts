import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TwoFactorAuthenticationSetup } from '../../views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup.model';
import { BACKEND_API_URL } from '../api-url-injection-token';
import { TwoFactorAuthenticationVerificationCode } from '../../views/account/security-container/two-factor-authentication/models/two-factor-authentication-verification-code.model';
import { TwoFactorAuthenticationSetupResult } from '../../views/account/security-container/two-factor-authentication/models/two-factor-authentication-setup-result.model';
import { UserRecoveryCodes } from '../../views/account/security-container/models/user-recovery-codes.model';

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
	 * @param apiUrl
	 * @param http
	 */
	constructor(@Inject(BACKEND_API_URL) private apiUrl: string, private http: HttpClient) {}

	/**
	 * Gets authenticator setup information.
	 * @returns authenticator
	 */
	setupAuthenticator$(): Observable<TwoFactorAuthenticationSetup> {
		return this.http.get<TwoFactorAuthenticationSetup>(`${this.apiUrl}/2fa/setup-authenticator`, { headers: this._headers });
	}

	/**
	 * Verifys authenticator verification code is valid.
	 * @param model
	 * @returns TwoFactorAuthenticationSetupResult
	 */
	verifyAuthenticator$(model: TwoFactorAuthenticationVerificationCode): Observable<TwoFactorAuthenticationSetupResult> {
		return this.http.post<TwoFactorAuthenticationSetupResult>(`${this.apiUrl}/2fa/verify-authenticator`, JSON.stringify(model.verificationCode), {
			headers: this._headers
		});
	}

	/**
	 * Generates two factor authentication recovery codes.
	 * @returns UserRecoveryCodes
	 */
	generate2FaRecoveryCodes$(): Observable<UserRecoveryCodes> {
		return this.http.post<UserRecoveryCodes>(`${this.apiUrl}/2fa/generate-recovery-codes`, '', { headers: this._headers });
	}

	/**
	 * Disables two factor authentication for the given user.
	 * @returns Disable2FaResult.
	 */
	disable2Fa$(): Observable<void> {
		return this.http.post<void>(`${this.apiUrl}/2fa/disable`, '', { headers: this._headers });
	}
}
