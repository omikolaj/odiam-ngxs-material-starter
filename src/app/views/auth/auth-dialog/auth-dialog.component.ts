import { Component, OnInit, ChangeDetectionStrategy, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthDialogData } from 'app/core/auth/models/auth-dialog-data.model';
import { Observable, timer } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { LogService } from 'app/core/logger/log.service';
import { AuthDialogUserDecision } from './auth-dialog-user-decision.enum';

/**
 * Auth dialog component.
 */
@Component({
	selector: 'odm-auth-dialog',
	templateUrl: './auth-dialog.component.html',
	styleUrls: ['./auth-dialog.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthDialogComponent implements OnInit {
	/**
	 * Current time in seconds before session times out.
	 */
	_counter$: Observable<number>;

	/**
	 * Number of seconds left before session times out.
	 */
	_count: number;

	/**
	 * Display message of auth dialog component.
	 */
	_displayMessage: string;

	/**
	 * Event emitter for when user requests to stay signed in.
	 */
	@Output() staySignedInClicked = new EventEmitter<AuthDialogUserDecision>();

	/**
	 * Event emitter for when user requests to sign out.
	 */
	@Output() signOutClicked = new EventEmitter<AuthDialogUserDecision>();

	/**
	 * Creates an instance of auth dialog component.
	 * @param data
	 */
	constructor(@Inject(MAT_DIALOG_DATA) data: AuthDialogData, private log: LogService) {
		this._count = data.timeUntilTimeoutSeconds;
		this._displayMessage = data.message;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.log.trace('Initialized', this);
		this._counter$ = timer(0, 1000).pipe(
			take(this._count),
			map(() => --this._count)
		);
	}

	/**
	 * Event handler for when user requests to stay signed in.
	 */
	_onStaySignedIn(): void {
		this.log.trace('_onStaySignedIn fired.', this);
		this.staySignedInClicked.emit(AuthDialogUserDecision.staySignedIn);
	}

	/**
	 * Event handler for when user reqests to be signed out.
	 */
	_onSignOut(): void {
		this.log.trace('_onSignOut fired.', this);
		this.signOutClicked.emit(AuthDialogUserDecision.signOut);
	}
}
