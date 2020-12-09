import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BACKEND_API_URL } from '../api-url-injection-token';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	constructor(@Inject(BACKEND_API_URL) private apiUrl: string, private http: HttpClient) {}

	checkIfEmailExists(email: string): Observable<boolean> {
		return this.http.get<boolean>(`${this.apiUrl}/auth`, { params: { email } });
		// return of(true).pipe(delay(100));
	}
}
