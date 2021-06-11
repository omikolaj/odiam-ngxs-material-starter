import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

/**
 * Notification service that displays toast notification.
 */
@Injectable({
	providedIn: 'root'
})
export class NotificationService {
	/**
	 * Creates an instance of notification service.
	 * @param snackBar
	 * @param zone
	 */
	constructor(private readonly _snackBar: MatSnackBar, private readonly _zone: NgZone) {}

	/**
	 * Defaults notification.
	 * @param message
	 */
	default(message: string): void {
		this._show(message, {
			duration: 2000,
			panelClass: 'default-notification-overlay'
		});
	}

	/**
	 * Info notification.
	 * @param message
	 */
	info(message: string): void {
		this._show(message, {
			duration: 2000,
			panelClass: 'info-notification-overlay'
		});
	}

	/**
	 * Info notification with 'Dismiss' button.
	 * @param message
	 */
	infoWithBtn(message: string): void {
		this._showWithBtn(message, {
			panelClass: 'info-notification-overlay-with-btn'
		});
	}

	/**
	 * Success notification.
	 * @param message
	 */
	success(message: string): void {
		this._show(message, {
			duration: 2000,
			panelClass: 'success-notification-overlay'
		});
	}

	/**
	 * Warns notification.
	 * @param message
	 */
	warn(message: string): void {
		this._show(message, {
			duration: 2500,
			panelClass: 'warning-notification-overlay'
		});
	}

	/**
	 * Errors notification.
	 * @param message
	 */
	error(message: string): void {
		this._show(message, {
			duration: 3000,
			panelClass: 'error-notification-overlay'
		});
	}

	/**
	 * Displays the notification.
	 * @param message
	 * @param configuration
	 */
	private _show(message: string, configuration: MatSnackBarConfig): void {
		// Need to open snackBar from Angular zone to prevent issues with its position per
		// https://stackoverflow.com/questions/50101912/snackbar-position-wrong-when-use-errorhandler-in-angular-5-and-material
		this._zone.run(() => this._snackBar.open(message, null, configuration));
	}

	/**
	 * Displays the notification with 'Dismiss' button.
	 * @param message
	 * @param configuration
	 */
	private _showWithBtn(message: string, configuration: MatSnackBarConfig): void {
		// Need to open snackBar from Angular zone to prevent issues with its position per
		// https://stackoverflow.com/questions/50101912/snackbar-position-wrong-when-use-errorhandler-in-angular-5-and-material
		this._zone.run(() => this._snackBar.open(message, 'Dismiss', configuration));
	}
}
