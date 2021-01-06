import { AccountDetails } from 'app/core/models/account-details.model';

/**
 * User profile details.
 */
export class SetUserProfileDetails {
	/**
	 * Type of action.
	 */
	static readonly type = '[Account] Set User Profile Details';

	/**
	 * Creates an instance of set user profile details.
	 * @param paylaod
	 */
	constructor(public paylaod: AccountDetails) {}
}
