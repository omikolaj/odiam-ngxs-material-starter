import { ROUTE_ANIMATIONS_ELEMENTS } from 'app/core/core.module';
import { implementsOdmWebApiException } from 'app/core/utilities/implements-odm-web-api-exception';
import { Subscription } from 'rxjs';

export abstract class AuthBase {
	/**
	 * Facebook login icon.
	 */
	protected facebookLoginIcon = (require('../../../assets/facebook_icon_color.svg') as { default: string }).default;

	/**
	 * Google login icon.
	 */
	protected googleLoginIcon = (require('../../../assets/google_icon_color.svg') as { default: string }).default;

	/**
	 * Route animations elements of auth container component.
	 */
	protected _routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;
}
