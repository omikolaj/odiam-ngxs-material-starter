import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BACKEND_API_URL } from '../api-url-injection-token';
import { AccessToken } from '../models/auth/access-token.model';
import { AuthResponse } from '../models/auth/auth-response.model';
import { SigninUser } from '../models/auth/signin-user.model';
import { SignupUser } from '../models/auth/signup-user.model';

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
	 * Signs users out.
	 * @returns void
	 */
	signout$(): Observable<void> {
		return this._http.delete<void>(`${this._apiUrl}/auth/signout`, { headers: this._headers });
	}

	/**
	 * Trys to renew access token.
	 * @returns renew access token
	 */
	tryRenewAccessToken$(): Observable<AccessToken> {
		return this._http.post<AccessToken>(`${this._apiUrl}/auth/refresh-token`, { headers: this._headers });
	}
}
