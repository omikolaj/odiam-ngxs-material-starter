/**
 * Auth dialog user decision enum used to differentiate between the type of action user took when presented with the auth dialog.
 */
export enum AuthDialogUserDecision {
	/**
	 * User decided to stay signed in.
	 */
	staySignedIn,

	/**
	 * User decided to sign out.
	 */
	signOut
}
