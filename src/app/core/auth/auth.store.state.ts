import { StateToken, StateContext, State, Selector, Action } from '@ngxs/store';
import { AuthStateModel, AUTH_KEY } from './auth-state-model';
import { Injectable } from '@angular/core';
import produce from 'immer';
import * as Auth from './auth.store.actions';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { isBefore, add, getUnixTime, fromUnixTime } from 'date-fns';
import { LogService } from '../logger/log.service';
import { ActiveAuthType } from './active-auth-type.model';

const AUTH_STATE_TOKEN = new StateToken<AuthStateModel>('auth');

@State<AuthStateModel>({
	name: AUTH_STATE_TOKEN,
	defaults: {
		isAuthenticated: false,
		access_token: '',
		expires_at: 0,
		rememberMe: false,
		username: '',
		staySignedIn: false,
		userId: '',
		activeAuthType: 'sign-in-active'
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
	@Selector([AuthState.selectExpiresAt])
	static selectIsAuthenticated(state: AuthStateModel, expiresAt: Date): boolean {
		return state.isAuthenticated && isBefore(new Date(), expiresAt);
	}

	/**
	 * Selects expires_at value from local storage and converts it to Date.
	 * @param state
	 * @returns date of expires at
	 */
	@Selector([AUTH_STATE_TOKEN])
	static selectCurrentUserId(state: AuthStateModel): string {
		return state.userId;
	}

	/**
	 * Selects expires_at value from local storage and converts it to Date.
	 * @param state
	 * @returns date of expires at
	 */
	@Selector([AUTH_STATE_TOKEN])
	private static selectExpiresAt(state: AuthStateModel): Date {
		return fromUnixTime(state.expires_at || 0);
	}

	/**
	 * Selectors access token.
	 * @param state
	 * @returns access token
	 */
	@Selector([AUTH_STATE_TOKEN])
	static selectAccessTokenModel(state: AuthStateModel): string {
		return state.access_token || '';
	}

	/**
	 * Selects whether user selected remember me option.
	 * @param state
	 * @returns true if remember me
	 */
	@Selector([AUTH_STATE_TOKEN])
	static selectRememberMe(state: AuthStateModel): boolean {
		return state.rememberMe;
	}

	/**
	 * Selects whether user selected to stay signed in option.
	 * @param state
	 * @returns true if stay signed in is selected
	 */
	@Selector([AUTH_STATE_TOKEN])
	static selectStaySignedIn(state: AuthStateModel): boolean {
		return state.staySignedIn;
	}

	/**
	 * Selects username from the store.
	 * @param state
	 * @returns username
	 */
	@Selector([AUTH_STATE_TOKEN])
	static selectUsername(state: AuthStateModel): string {
		return state.username;
	}

	/**
	 * Selects active auth type, either sign-in or sign-up.
	 * @param state
	 * @returns active auth type
	 */
	@Selector([AUTH_STATE_TOKEN])
	static selectActiveAuthType(state: AuthStateModel): ActiveAuthType {
		return state.activeAuthType;
	}

	/**
	 * Creates an instance of auth state.
	 * @param router
	 * @param localStorageService
	 */
	constructor(private localStorageService: LocalStorageService, private logger: LogService) {}

	/**
	 * Action handler that updates remember me option.
	 * @param ctx
	 * @param action
	 */
	@Action(Auth.RememberMeOptionChange)
	rememberMe(ctx: StateContext<AuthStateModel>, action: Auth.RememberMeOptionChange): void {
		this.logger.debug('Remember me action fired.', this);
		ctx.setState(
			produce((draft: AuthStateModel) => {
				draft.rememberMe = action.payload;
			})
		);
		const auth = ctx.getState();
		this.localStorageService.setItem(AUTH_KEY, auth);
	}

	/**
	 * Action handler that remembers username in local storage.
	 * @param ctx
	 * @param action
	 */
	@Action(Auth.UpdateRememberUsername)
	updateRememberUsername(ctx: StateContext<AuthStateModel>, action: Auth.UpdateRememberUsername): void {
		this.logger.debug('Update Remember username action fired.', this);
		ctx.setState(
			produce((draft: AuthStateModel) => {
				draft.username = action.payload;
			})
		);
		const auth = ctx.getState();
		this.localStorageService.setItem(AUTH_KEY, auth);
	}

	/**
	 * Action handler that updates stay signed in option.
	 * @param ctx
	 * @param action
	 */
	@Action(Auth.StaySignedinOptionChange)
	staySignedIn(ctx: StateContext<AuthStateModel>, action: Auth.StaySignedinOptionChange): void {
		this.logger.debug('Stay signed in action fired.', this);
		ctx.setState(
			produce((draft: AuthStateModel) => {
				draft.staySignedIn = action.payload;
			})
		);
		const auth = ctx.getState();
		this.localStorageService.setItem(AUTH_KEY, auth);
	}

	/**
	 * Action handler that Logs user in.
	 * @param ctx
	 * @returns action to persist auth state.
	 */
	@Action(Auth.Signin)
	signin(ctx: StateContext<AuthStateModel>, action: Auth.Signin): void {
		this.logger.debug(`Jwt token expires in: ${action.payload.accessToken.expires_in} seconds.`, this);
		this.logger.debug(`Jwt token expirey date`, this, add(new Date(), { seconds: action.payload.accessToken.expires_in }));
		const expires_at = getUnixTime(add(new Date(), { seconds: action.payload.accessToken.expires_in }));
		ctx.setState(
			produce((draft: AuthStateModel) => {
				draft.isAuthenticated = true;
				draft.access_token = action.payload.accessToken.access_token;
				draft.expires_at = expires_at;
				draft.userId = action.payload.userId;
			})
		);

		const auth = ctx.getState();
		this.localStorageService.setItem(AUTH_KEY, auth);
	}

	/**
	 * Action handler for setting current user id.
	 * @param ctx
	 * @param action
	 */
	@Action(Auth.SetCurrentUserId)
	setCurrentUserId(ctx: StateContext<AuthStateModel>, action: Auth.SetCurrentUserId): void {
		this.logger.debug('Setting current user id', this, action.payload);
		ctx.setState(
			produce((draft: AuthStateModel) => {
				draft.userId = action.payload;
			})
		);
	}

	/**
	 * Action handler that logs user out.
	 * @param ctx
	 * @returns action to persist auth state.
	 */
	@Action(Auth.Signout)
	signout(ctx: StateContext<AuthStateModel>): void {
		ctx.setState(
			produce((draft: AuthStateModel) => {
				draft.isAuthenticated = false;
				draft.access_token = '';
				draft.expires_at = 0;
				draft.userId = '';
				draft.username = '';
			})
		);
		const auth = { isAuthenticated: false };
		this.localStorageService.setItem(AUTH_KEY, auth);
		this.logger.debug('User has been signed out.');
	}

	/**
	 * Action handler that switches active panel.
	 * @param ctx
	 * @param action
	 */
	@Action(Auth.SwitchAuthType)
	switchAuthType(ctx: StateContext<AuthStateModel>, action: Auth.SwitchAuthType): void {
		this.logger.debug('Changing auth type.');
		ctx.setState(
			produce((draft: AuthStateModel) => {
				draft = { ...draft, ...action.payload };
				return draft;
			})
		);
		const auth = ctx.getState();
		this.localStorageService.setItem(AUTH_KEY, auth);
	}
}
