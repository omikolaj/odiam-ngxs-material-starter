import { AccountDetails } from 'app/core/models/account-details.model';
import { TwoFactorConfigurationStatus } from 'app/core/models/2fa/2fa-configuration-status.model';

/**
 * User profile details.
 */
export class SetUserProfileDetails {
	/**
	 * Type of action.
	 */
	static readonly type = '[account] Set User Profile Details';

	/**
	 * Creates an instance of set user profile details.
	 * @param paylaod
	 */
	constructor(public paylaod: AccountDetails) {}
}

export class UpdateTwoFactorConfigurationStatus {
	static readonly type = '[account] Two Factor Configuration Status Change';
	/**
	 *
	 */
	constructor(public payload: TwoFactorConfigurationStatus) {}
}
