import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AccountFacadeService } from '../account-facade.service';

/**
 * Component responsible for handling two factor authentication settings.
 */
@Component({
	selector: 'odm-two-factor-authentication2',
	templateUrl: './two-factor-authentication2.component.html',
	styleUrls: ['./two-factor-authentication2.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TwoFactorAuthentication2Component {
	_showTwoFactorAuthSetupWizard = false;

	/**
	 * Initial state of the user's two factor authentication setting.
	 */
	@Input() twoFactorEnabled: boolean;

	/**
	 * Creates an instance of two factor authentication2 component.
	 * @param facade
	 */
	constructor(private facade: AccountFacadeService) {}

	/**
	 * Event handler when user requests to enable/disable two factor authentication.
	 * @param event
	 */
	_onTwoFactorAuthToggle(event: MatSlideToggleChange): void {
		this._showTwoFactorAuthSetupWizard = event.checked;
		if (event.checked) {
			this.facade.setupAuthenticator();
		} else {
			this.facade.disable2Fa();
		}
	}

	/**
	 * Event handler for when user requests to generate new recovery codes.
	 */
	_onGenerateNew2FaRecoveryCodes(): void {
		this.facade.generateRecoveryCodes();
	}
}
