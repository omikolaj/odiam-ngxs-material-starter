import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { OdmGhostAnimationService } from 'app/shared/services/odm-ghost-animation.service';
import { LogService } from 'app/core/logger/log.service';

/**
 * Ghosting component.
 */
@Component({
	selector: 'odm-ghost-block',
	templateUrl: './odm-ghost-block.component.html',
	styleUrls: ['./odm-ghost-block.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OdmGhostBlockComponent implements OnInit {
	/**
	 * Host binding of ghost block component indicating busy state.
	 */
	@HostBinding('attr.aria-busy') busy = true;

	/**
	 * Creates an instance of ghost block component.
	 * @param _ghostAnimationService
	 * @param _log
	 */
	constructor(private _ghostAnimationService: OdmGhostAnimationService, private _log: LogService) {}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this._log.trace('Initialized.', this);
		this._ghostAnimationService.syncAnimation();
	}
}
