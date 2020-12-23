import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticatorSetupModel } from '../models/2fa/authenticator-setup.model.2fa';
import { BACKEND_API_URL } from '../api-url-injection-token';
import { AuthenticatorVerificationCodeModel } from '../models/2fa/authenticator-verification-code-model.2fa';
import { AuthenticatorSetupResultModel } from '../models/2fa/authenticator-setup-result-model.2fa';
import { Disable2FaResultModel } from '../models/2fa/disable-2fa-result-model.2fa';
import { GenerateRecoveryCodesResultModel } from '../models/2fa/generate-recovery-codes-result-model.2fa';

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
	private _headers = new HttpHeaders({
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
	setupAuthenticator(): Observable<AuthenticatorSetupModel> {
		return this.http.get<AuthenticatorSetupModel>(`${this.apiUrl}/2fa/setup-authenticator`, { headers: this._headers });
	}

	/**
	 * Verifys authenticator verification code is valid.
	 * @param model
	 * @returns AuthenticatorSetupResultModel
	 */
	verifyAuthenticator(model: AuthenticatorVerificationCodeModel): Observable<AuthenticatorSetupResultModel> {
		return this.http.post<AuthenticatorSetupResultModel>(`${this.apiUrl}/2fa/verify-authenticator`, JSON.stringify(model.verificationCode), {
			headers: this._headers
		});
	}

	/**
	 * Generates two factor authentication recovery codes.
	 * @returns GenerateRecoveryCodesResultModel
	 */
	generate2FaRecoveryCodes(): Observable<GenerateRecoveryCodesResultModel> {
		return this.http.post<GenerateRecoveryCodesResultModel>(`${this.apiUrl}/2fa/generate-recovery-codes`, '', { headers: this._headers });
	}

	/**
	 * Disables two factor authentication for the given user.
	 * @returns Disable2FaResultModel.
	 */
	disable2Fa(): Observable<void> {
		return this.http.post<void>(`${this.apiUrl}/2fa/disable`, '', { headers: this._headers });
	}
}
