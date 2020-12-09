import { Injectable, Inject } from '@angular/core';
import { BACKEND_API_URL } from '../api-url-injection-token';
import { AccessToken } from './access-token.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RegisterUserModel } from './register-user.model';
import { Observable } from 'rxjs';

/**
 * AuthService injectable.
 */
@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private headers = new HttpHeaders({
		'Content-Type': 'application/json'
	});

	/**
	 * Creates an instance of auth service.
	 * @param apiUrl
	 */
	constructor(@Inject(BACKEND_API_URL) private apiUrl: string, private http: HttpClient) {}

	/**
	 * Signups new users.
	 * @param registerModel
	 * @returns signup
	 */
	signup(registerModel: RegisterUserModel): Observable<AccessToken> {
		return this.http.post<AccessToken>(`${this.apiUrl}/auth/signup`, JSON.stringify(registerModel), { headers: this.headers });
	}
}
