import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { BACKEND_API_URL } from '../api-url-injection-token';
import { Observable } from 'rxjs';
import { AccountSecurityDetails } from '../models/account/security/account-security-details.model';
import { AccountGeneralDetails } from '../models/account/general/account-general-details.model';
import { PasswordReset } from '../models/auth/password-reset.model';

/**
 * User async service.
 */
@Injectable({
	providedIn: 'root'
})
export class UsersAsyncService {
	/**
	 * Headers of users service.
	 */
	private readonly _headers = new HttpHeaders({
		'Content-Type': 'application/json'
	});

	/**
	 * Creates an instance of users service.
	 * @param _apiUrl
	 * @param _http
	 */
	constructor(@Inject(BACKEND_API_URL) private _apiUrl: string, private _http: HttpClient) {}

	/**
	 * Gets user account security details.
	 * @param id
	 * @returns account security details
	 */
	getAccountSecurityDetails$(id: string): Observable<AccountSecurityDetails> {
		return this._http.get<AccountSecurityDetails>(`${this._apiUrl}/users/${id}/account/security`);
	}

	/**
	 * Gets user account general details.
	 * @param id
	 * @returns account general details
	 */
	getAccountGeneralDetails$(id: string): Observable<AccountGeneralDetails> {
		return this._http.get<AccountGeneralDetails>(`${this._apiUrl}/users/${id}/account/general`);
	}

	/**
	 * Resends email verification.
	 * @param id
	 * @returns email verification
	 */
	resendEmailVerification$(id: string): Observable<void> {
		return this._http.get<void>(`${this._apiUrl}/users/${id}/account/resend-email-verification`);
	}

	/**
	 * Checks if email exists.
	 * @param email
	 * @returns if email exists
	 */
	checkIfEmailExists$(email: string): Observable<boolean> {
		return this._http.get<boolean>(`${this._apiUrl}/users/email`, { params: { email: email }, headers: this._headers });
	}

	/**
	 * Sends reset link to the passed in email.
	 * @param email
	 * @returns password
	 */
	forgotPassword$(email: string): Observable<void> {
		return this._http.post<void>(`${this._apiUrl}/users/password`, JSON.stringify(email), { headers: this._headers });
	}

	/**
	 * Resets password.
	 * @param model
	 * @returns password
	 */
	resetPassword$(model: PasswordReset): Observable<void> {
		return this._http.put<void>(`${this._apiUrl}/users/password`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Fetchs username for remember me option.
	 * @param id
	 * @returns username for remember me
	 */
	fetchUsernameForRememberMe$(id: string): Observable<string> {
		return this._http.get<string>(`${this._apiUrl}/users/${id}/username`, { headers: this._headers });
	}
}
