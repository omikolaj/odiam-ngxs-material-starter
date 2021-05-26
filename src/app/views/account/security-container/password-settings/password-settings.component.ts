import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SecuritySandboxService } from '../security-sandbox.service';
import { ActivatedRoute } from '@angular/router';
import { ODM_GLOBAL_SECURITY_SHORT_DESCRIPTION } from 'app/shared/global-settings/global-settings';
import { downUpFadeInAnimation } from 'app/core/core.module';

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
	readonly _shortDescription = ODM_GLOBAL_SECURITY_SHORT_DESCRIPTION;

	/**
	 * Creates an instance of password settings component.
	 * @param _sb
	 * @param _route
	 * @param _log
	 */
	constructor(private _sb: SecuritySandboxService, private _route: ActivatedRoute) {}

	/**
	 * Event handler when user clicks to launch the change password view.
	 */
	_onChangePasswordClicked(): void {
		this._sb.log.trace('_onChangePasswordClicked fired.', this);
		void this._sb.router.navigate(['change-password'], { relativeTo: this._route.parent });
	}
}
