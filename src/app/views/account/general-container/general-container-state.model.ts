/**
 * General container state model.
 */
export interface GeneralContainerStateModel {
	/**
	 * User's email.
	 */
	email: string;

	/**
	 * Whether user's email has been verified or not.
	 */
	verified: boolean;

	/**
	 * Whether user's email change requested completed without errors.
	 */
	emailChangeCompleted: boolean;
}
