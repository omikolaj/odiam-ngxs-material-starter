import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { AuthState } from './auth.store.state';

@Injectable({
	providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
	constructor(private store: Store) {}

	canActivate(): Observable<boolean> {
		return this.store.select(AuthState.selectIsAuthenticated);
	}
}
