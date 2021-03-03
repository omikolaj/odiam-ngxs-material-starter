import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { AuthState } from './auth.store.state';
import { map, tap } from 'rxjs/operators';
import { AuthService } from 'app/views/auth/auth.service';
import { InitSessionResult } from './init-session-result.model';
import { LogService } from '../logger/log.service';

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
	constructor(private store: Store, private router: Router, private authService: AuthService, private log: LogService) {}

	/**
	 * Determines whether user can activate this route.
	 * @returns user is authentication status.
	 */
	canActivate(): Observable<boolean> {
		this.log.trace('Executing canActive guard.', this);
		return this.store.select(AuthState.selectIsAuthenticated).pipe(
			tap((isAuthenticated) => console.log(isAuthenticated)),
			tap((isAuthenticated) => (isAuthenticated ? null : void this.router.navigate(['auth/sign-in'])))
		);
		// return this.store
		// 	.select(AuthState.selectIsAuthenticated)
		// 	.pipe(switchMap((isAuthenticated) => (isAuthenticated ? of(true) : this._manageSession())));
	}

	/**
	 * Manages session for the user. Attempts to renew user's session otherwise signs them out.
	 * @returns session
	 */
	// private _manageSession(): Observable<boolean> {
	// 	this.log.trace('Executing _manageSession.', this);
	// 	const staySignedIn = this.store.selectSnapshot(AuthState.selectStaySignedIn);
	// 	const explicitlySignedOut = this.store.selectSnapshot(AuthState.selectDidUserExplicitlySignout);

	// 	return this.authService
	// 		.renewExpiredSessionOrSignUserOut(false, staySignedIn, explicitlySignedOut)
	// 		.pipe(map((result) => this._handleSessionResult(result, staySignedIn)));
	// }

	// /**
	//  * Handles session set result.
	//  * @param result
	//  * @param staySignedIn
	//  * @returns true if session result
	//  */
	// private _handleSessionResult(result: InitSessionResult, staySignedIn: boolean): boolean {
	// 	this.log.trace('Executing _handleSessionResult.', this);
	// 	if (result.succeeded) {
	// 		this.authService.maintainSession(staySignedIn, result.accessToken.expires_in);
	// 		return true;
	// 	}
	// 	void this.router.navigate(['auth/sign-in']);
	// 	return false;
	// }
}
