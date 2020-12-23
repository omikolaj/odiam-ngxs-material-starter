import { UserProfileDetails } from 'app/core/models/user-profile-details.model';

/**
 * User profile details.
 */
export class SetUserProfileDetails {
	/**
	 * Type of action.
	 */
	static readonly type = '[Dashboard] Set User Profile Details';

	/**
	 * Creates an instance of set user profile details.
	 * @param paylaod
	 */
	constructor(public paylaod: UserProfileDetails) {}
}
