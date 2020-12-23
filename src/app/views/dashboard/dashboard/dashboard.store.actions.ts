import { UserProfileDetails } from 'app/core/models/user-profile-details.model';
import { TwoFactorConfigurationStatus } from 'app/core/models/2fa/2fa-configuration-status.model';

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

export class UpdateTwoFactorConfigurationStatus {
	static readonly type = '[Dashboard] Two Factor Configuration Status Change';
	/**
	 *
	 */
	constructor(public payload: TwoFactorConfigurationStatus) {}
}
