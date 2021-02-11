import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { BACKEND_API_URL } from '../api-url-injection-token';
import { Observable } from 'rxjs';
import { PasswordReset } from '../auth/password-reset.model';
import { AccountDetails } from '../models/account-details.model';
import { AccountSecurityDetails } from '../models/account-security-details.model';

@Injectable({
	providedIn: 'root'
})
export class UsersAsyncService {
	/**
	 * Headers of users service.
	 */
	private _headers = new HttpHeaders({
		'Content-Type': 'application/json'
	});

	/**
	 * Creates an instance of users service.
	 * @param apiUrl
	 * @param http
	 */
	constructor(@Inject(BACKEND_API_URL) private apiUrl: string, private http: HttpClient) {}

	getUserProfile(id: string): Observable<AccountDetails> {
		return this.http.get<AccountDetails>(`${this.apiUrl}/users/${id}`);
	}

	/**
	 * Gets user account security details.
	 * @param id
	 * @returns account security details
	 */
	getAccountSecurityDetails(id: string): Observable<AccountSecurityDetails> {
		return this.http.get<AccountSecurityDetails>(`${this.apiUrl}/users/${id}/account/security`);
	}

	/**
	 * Checks if email exists.
	 * @param email
	 * @returns if email exists
	 */
	checkIfEmailExists(email: string): Observable<boolean> {
		return this.http.get<boolean>(`${this.apiUrl}/users/email`, { params: { email: email }, headers: this._headers });
	}

	/**
	 * Sends reset link to the passed in email.
	 * @param email
	 * @returns password
	 */
	forgotPassword(email: string): Observable<void> {
		return this.http.post<void>(`${this.apiUrl}/users/password`, JSON.stringify(email), { headers: this._headers });
	}

	/**
	 * Resets password.
	 * @param model
	 * @returns password
	 */
	resetPassword(model: PasswordReset): Observable<void> {
		return this.http.put<void>(`${this.apiUrl}/users/password`, JSON.stringify(model), { headers: this._headers });
	}
}
