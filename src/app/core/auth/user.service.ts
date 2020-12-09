import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BACKEND_API_URL } from '../api-url-injection-token';
import { Observable } from 'rxjs';

/**
 * UserService injectable
 */
@Injectable({
	providedIn: 'root'
})
export class UserService {
	/**
	 * Creates an instance of user service.
	 * @param apiUrl
	 * @param http
	 */
	constructor(@Inject(BACKEND_API_URL) private apiUrl: string, private http: HttpClient) {}

	/**
	 * Checks if email exists.
	 * @param email
	 * @returns if email exists
	 */
	checkIfEmailExists(email: string): Observable<boolean> {
		return this.http.get<boolean>(`${this.apiUrl}/auth`, { params: { email } });
	}
}
