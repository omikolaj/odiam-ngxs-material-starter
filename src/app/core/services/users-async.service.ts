import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { BACKEND_API_URL } from '../api-url-injection-token';
import { Observable } from 'rxjs';
import { PasswordReset } from '../auth/models/password-reset.model';
import { AccountDetails } from '../models/account-details.model';
import { AccountSecurityDetails } from '../models/account-security-details.model';
import { AccountGeneralDetails } from '../models/account-general-details.model';

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
	 * @param apiUrl
	 * @param http
	 */
	constructor(@Inject(BACKEND_API_URL) private apiUrl: string, private http: HttpClient) {}

	/**
	 * Gets user profile.
	 * @param id
	 * @returns user profile
	 */
	getUserProfile$(id: string): Observable<AccountDetails> {
		return this.http.get<AccountDetails>(`${this.apiUrl}/users/${id}`);
	}

	/**
	 * Gets user account security details.
	 * @param id
	 * @returns account security details
	 */
	getAccountSecurityDetails$(id: string): Observable<AccountSecurityDetails> {
		return this.http.get<AccountSecurityDetails>(`${this.apiUrl}/users/${id}/account/security`);
	}

	/**
	 * Gets user account general details.
	 * @param id
	 * @returns account general details
	 */
	getAccountGeneralDetails$(id: string): Observable<AccountGeneralDetails> {
		return this.http.get<AccountGeneralDetails>(`${this.apiUrl}/users/${id}/account/general`);
	}

	/**
	 * Resends email verification.
	 * @param id
	 * @returns email verification
	 */
	resendEmailVerification$(id: string): Observable<void> {
		return this.http.get<void>(`${this.apiUrl}/users/${id}/account/resend-email-verification`);
	}

	/**
	 * Checks if email exists.
	 * @param email
	 * @returns if email exists
	 */
	checkIfEmailExists$(email: string): Observable<boolean> {
		return this.http.get<boolean>(`${this.apiUrl}/users/email`, { params: { email: email }, headers: this._headers });
	}

	/**
	 * Sends reset link to the passed in email.
	 * @param email
	 * @returns password
	 */
	forgotPassword$(email: string): Observable<void> {
		return this.http.post<void>(`${this.apiUrl}/users/password`, JSON.stringify(email), { headers: this._headers });
	}

	/**
	 * Resets password.
	 * @param model
	 * @returns password
	 */
	resetPassword$(model: PasswordReset): Observable<void> {
		return this.http.put<void>(`${this.apiUrl}/users/password`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Fetchs username for remember me option.
	 * @param id
	 * @returns username for remember me
	 */
	fetchUsernameForRememberMe$(id: string): Observable<string> {
		return this.http.get<string>(`${this.apiUrl}/users/${id}/username`, { headers: this._headers });
	}
}
