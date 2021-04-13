/**
 * Auth dialog data model.
 */
export interface AuthDialogData {
	/**
	 * Time until user session ends.
	 */
	timeUntilTimeoutSeconds: number;

	/**
	 * Message displayed in the auth dialog.
	 */
	message: string;
}
