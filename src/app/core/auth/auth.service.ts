import { Injectable, Inject } from '@angular/core';
import { BACKEND_API_URL } from '../api-url-injection-token';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	constructor(@Inject(BACKEND_API_URL) private apiUrl: string) {}
}
