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
	 * Whether user's request to change email has been sent succesfully.
	 */
	changeEmailRequestSent: boolean;
}
