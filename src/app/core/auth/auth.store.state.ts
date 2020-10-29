import { StateToken, StateContext, State, Selector, Action } from '@ngxs/store';
import { AuthStateModel } from './auth-state-model';
import { Injectable } from '@angular/core';
import produce from 'immer';
import * as Auth from './auth.store.actions';
import { Router } from '@angular/router';
import { LocalStorageService } from '../core.module';
import { AUTH_KEY } from './auth.effects';

const AUTH_STATE_TOKEN = new StateToken<AuthStateModel>('auth');

@State<AuthStateModel>({
	name: AUTH_STATE_TOKEN,
	defaults: {
		isAuthenticated: false
	}
})
@Injectable()

/**
 * Provides all action handlers for user authentication.
 */
export class AuthState {
	/**
	 * Selects user authentication status.
	 * @param state
	 * @returns true if is authenticated.
	 */
	@Selector([AUTH_STATE_TOKEN])
	static selectIsAuthenticated(state: AuthStateModel): boolean {
		return state.isAuthenticated;
	}

	/**
	 * Creates an instance of auth state.
	 * @param router
	 * @param localStorageService
	 */
	constructor(private router: Router, private localStorageService: LocalStorageService) {}

	/**
	 * Action handler that Logs user in.
	 * @param ctx
	 * @returns action to persist auth state.
	 */
	@Action(Auth.Login)
	login(ctx: StateContext<AuthStateModel>): void {
		ctx.setState(
			produce((draft: AuthStateModel) => {
				draft.isAuthenticated = true;
			})
		);

		// TODO remove from store put inside facade.
		const auth = { isAuthenticated: true };
		this.localStorageService.setItem(AUTH_KEY, auth);
	}

	/**
	 * Action handler that Logs user out.
	 * @param ctx
	 * @returns action to persist auth state.
	 */
	@Action(Auth.Logout)
	logout(ctx: StateContext<AuthStateModel>): void {
		ctx.setState(
			produce((draft: AuthStateModel) => {
				draft.isAuthenticated = false;
			})
		);

		// TODO remove this.router.navigate from the store, should be inside the facade.
		void this.router.navigate(['']);
		const auth = { isAuthenticated: false };
		this.localStorageService.setItem(AUTH_KEY, auth);
	}
}
