import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ODM_GLOBAL_ACCOUNT_SHORT_DESCRIPTION_SIZE, ODM_GLOBAL_ACCOUNT_HEADER_SIZE } from 'app/shared/global-settings/global-settings';
import { downUpFadeInAnimation } from 'app/core/core.module';

import { LogService } from 'app/core/logger/log.service';

/**
 * Password settings security container component.
 */
@Component({
	selector: 'odm-password-settings',
	templateUrl: './password-settings.component.html',
	styleUrls: ['./password-settings.component.scss'],
	animations: [downUpFadeInAnimation],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordSettingsComponent {
	/**
	 * Short description font size.
	 */
	readonly _shortDescription = ODM_GLOBAL_ACCOUNT_SHORT_DESCRIPTION_SIZE;

	/**
	 * Account header font size.
	 */
	readonly _accountHeader = ODM_GLOBAL_ACCOUNT_HEADER_SIZE;

	/**
	 * Creates an instance of password settings component.
	 * @param _sb
	 * @param _route
	 * @param _log
	 */
	constructor(private _log: LogService, private _router: Router, private _route: ActivatedRoute) {}

	/**
	 * Event handler when user clicks to launch the change password view.
	 */
	_onChangePasswordClicked(): void {
		this._log.trace('_onChangePasswordClicked fired.', this);
		void this._router.navigate(['security/change-password'], { relativeTo: this._route.parent });
	}
}
