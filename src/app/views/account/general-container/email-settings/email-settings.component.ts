import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ROUTE_ANIMATIONS_ELEMENTS, downUpFadeInAnimation } from 'app/core/core.module';
import { ODM_GLOBAL_SECURITY_SHORT_DESCRIPTION } from 'app/shared/global-settings/global-settings';
import { AccountSandboxService } from '../../account-sandbox.service';
import { ActivatedRoute } from '@angular/router';

/**
 * Email settings component displayed in the general view.
 */
@Component({
	selector: 'odm-email-settings',
	templateUrl: './email-settings.component.html',
	styleUrls: ['./email-settings.component.scss'],
	animations: [downUpFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailSettingsComponent {
	/**
	 * Route animations.
	 */
	readonly _routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;

	/**
	 * Short description font size.
	 */
	readonly _shortDescription = ODM_GLOBAL_SECURITY_SHORT_DESCRIPTION;

	/**
	 * User's email.
	 */
	@Input() email: string;

	/**
	 * Whether user's email has been verified or not.
	 */
	@Input() verified: boolean;

	/**
	 * Creates an instance of email settings component.
	 * @param _sb
	 * @param _route
	 */
	constructor(private _sb: AccountSandboxService, private _route: ActivatedRoute) {}

	/**
	 * Event handler when user clicks to launch the change password view.
	 */
	_onChangeEmailClicked(): void {
		this._sb.log.trace('_onChangePasswordClicked fired.', this);
		void this._sb.router.navigate(['general/change-email'], { relativeTo: this._route.parent });
	}
}
