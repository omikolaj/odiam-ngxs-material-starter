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
	constructor(private readonly snackBar: MatSnackBar, private readonly zone: NgZone) {}

	/**
	 * Defaults notification.
	 * @param message
	 */
	default(message: string): void {
		this.show(message, {
			duration: 2000,
			panelClass: 'default-notification-overlay'
		});
	}

	/**
	 * Infos notification.
	 * @param message
	 */
	info(message: string): void {
		this.show(message, {
			duration: 2000,
			panelClass: 'info-notification-overlay'
		});
	}

	/**
	 * Success notification.
	 * @param message
	 */
	success(message: string): void {
		this.show(message, {
			duration: 2000,
			panelClass: 'success-notification-overlay'
		});
	}

	/**
	 * Warns notification.
	 * @param message
	 */
	warn(message: string): void {
		this.show(message, {
			duration: 2500,
			panelClass: 'warning-notification-overlay'
		});
	}

	/**
	 * Errors notification.
	 * @param message
	 */
	error(message: string): void {
		this.show(message, {
			duration: 3000,
			panelClass: 'error-notification-overlay'
		});
	}

	/**
	 * Displays the notification.
	 * @param message
	 * @param configuration
	 */
	private show(message: string, configuration: MatSnackBarConfig): void {
		// Need to open snackBar from Angular zone to prevent issues with its position per
		// https://stackoverflow.com/questions/50101912/snackbar-position-wrong-when-use-errorhandler-in-angular-5-and-material
		this.zone.run(() => this.snackBar.open(message, null, configuration));
	}
}
