import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { BACKEND_API_URL } from '../../core/api-url-injection-token';
import { Observable } from 'rxjs';
import { AccountSecurityDetails } from '../../core/models/account/security/account-security-details.model';
import { AccountGeneralDetails } from '../../core/models/account/general/account-general-details.model';
import { PasswordReset } from '../../core/models/auth/password-reset.model';
import { PasswordChange } from 'app/core/models/auth/password-change.model';
import { ChangeEmailRequest } from 'app/core/models/auth/change-email-request.model';
import { ChangeEmail } from 'app/core/models/auth/change-email.model';
import { ConfirmEmail } from 'app/core/models/auth/confirm-email.model';

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
	resetPassword$(id: string, model: PasswordReset): Observable<void> {
		return this._http.post<void>(`${this._apiUrl}/users/${id}/reset-password`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Fetchs username for remember me option.
	 * @param id
	 * @returns username for remember me
	 */
	fetchUsernameForRememberMe$(id: string): Observable<string> {
		return this._http.get<string>(`${this._apiUrl}/users/${id}/username`, { headers: this._headers });
	}

	/**
	 * Changes user's password.
	 * @param id
	 */
	changePassword$(id: string, model: PasswordChange): Observable<void> {
		return this._http.put<void>(`${this._apiUrl}/users/${id}/password`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Changes user's e-mail.
	 * @param id
	 */
	changeEmail$(id: string, model: ChangeEmail): Observable<void> {
		return this._http.put<void>(`${this._apiUrl}/users/${id}/email`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Requests to change user's email address. Will generate change email token and email it to the new email.
	 * @param id
	 * @param model
	 */
	requestToChangeEmail$(id: string, model: ChangeEmailRequest): Observable<void> {
		return this._http.post<void>(`${this._apiUrl}/users/${id}/change-email-request`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Confirms user's email address.
	 * @param model
	 */
	confirmEmail$(model: ConfirmEmail): Observable<void> {
		return this._http.post<void>(`${this._apiUrl}/users/confirm-email`, JSON.stringify(model), { headers: this._headers });
	}
}
