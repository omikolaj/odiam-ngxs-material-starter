import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { AuthState } from './auth.store.state';
import { tap } from 'rxjs/operators';
import { AuthService } from 'app/views/auth/auth.service';

/**
 * Auth guard service which determines if user is authenticated.
 */
@Injectable({
	providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
	/**
	 * Creates an instance of auth guard service.
	 * @param store
	 * @param router
	 */
	constructor(private store: Store) {}

	/**
	 * Determines whether user can activate this route.
	 * @returns user is authentication status.
	 */
	canActivate(): Observable<boolean> {
		return this.store.select(AuthState.selectIsAuthenticated);
	}
}
