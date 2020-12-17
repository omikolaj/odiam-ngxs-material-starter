import { Injectable, Inject } from '@angular/core';
import { BACKEND_API_URL } from '../api-url-injection-token';
import { AccessToken } from './access-token.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SignupUserModel } from './signup-user.model';
import { Observable } from 'rxjs';
import { SigninUserModel } from './signin-user.model';
import { RenewAccessTokenResult } from './renew-access-token-result.model';

/**
 * AuthAsyncService injectable.
 */
@Injectable({
	providedIn: 'root'
})
export class AuthAsyncService {
	private headers = new HttpHeaders({
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
	signup(model: SignupUserModel): Observable<AccessToken> {
		return this.http.post<AccessToken>(`${this.apiUrl}/auth/signup`, JSON.stringify(model), { headers: this.headers });
	}

	/**
	 * Signs users in.
	 * @param model
	 * @returns access token
	 */
	signin(model: SigninUserModel): Observable<AccessToken> {
		return this.http.post<AccessToken>(`${this.apiUrl}/auth/signin`, JSON.stringify(model), { headers: this.headers });
	}

	/**
	 * Trys to renew access token.
	 * @returns renew access token
	 */
	tryRenewAccessToken(): Observable<RenewAccessTokenResult> {
		return this.http.post<RenewAccessTokenResult>(`${this.apiUrl}/auth/refresh-token`, { headers: this.headers });
	}
}
