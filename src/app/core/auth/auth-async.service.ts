import { Injectable, Inject } from '@angular/core';
import { BACKEND_API_URL } from '../api-url-injection-token';
import { AccessTokenModel } from './access-token.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SignupUserModel } from './signup-user.model';
import { Observable } from 'rxjs';
import { SigninUserModel } from './signin-user.model';
import { RenewAccessTokenModelResult } from './renew-access-token-result.model';
import { SocialUser } from 'angularx-social-login';

/**
 * AuthAsyncService injectable.
 */
@Injectable({
	providedIn: 'root'
})
export class AuthAsyncService {
	private _headers = new HttpHeaders({
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
	signup(model: SignupUserModel): Observable<AccessTokenModel> {
		return this.http.post<AccessTokenModel>(`${this.apiUrl}/auth/signup`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Signs users in.
	 * @param model
	 * @returns access token
	 */
	signin(model: SigninUserModel): Observable<AccessTokenModel> {
		return this.http.post<AccessTokenModel>(`${this.apiUrl}/auth/signin`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Signs user in with google.
	 * @param model
	 * @returns access token
	 */
	signinWithGoogle(model: SocialUser): Observable<AccessTokenModel> {
		return this.http.post<AccessTokenModel>(`${this.apiUrl}/auth/external-signin-google`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Signs user in with facebook.
	 * @param model
	 * @returns access token
	 */
	signinWithFacebook(model: SocialUser): Observable<AccessTokenModel> {
		return this.http.post<AccessTokenModel>(`${this.apiUrl}/auth/external-signin-facebook`, JSON.stringify(model), { headers: this._headers });
	}

	/**
	 * Trys to renew access token.
	 * @returns renew access token
	 */
	tryRenewAccessTokenModel(): Observable<RenewAccessTokenModelResult> {
		return this.http.post<RenewAccessTokenModelResult>(`${this.apiUrl}/auth/refresh-token`, { headers: this._headers });
	}
}
