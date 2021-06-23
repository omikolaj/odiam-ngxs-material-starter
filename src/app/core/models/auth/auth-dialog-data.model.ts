/**
 * Auth dialog data model.
 */
export interface AuthDialogData {
	/**
	 * Time (in seconds) until the auth dialog closes and signs user out if no action is taken by the user.
	 */
	dialogTimeout: number;

	/**
	 * Message displayed in the auth dialog.
	 */
	message: string;
}
