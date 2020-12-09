import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { GhostAnimationService } from 'app/shared/services/ghost-animation.service';

/**
 * GhostBLock component.
 */
@Component({
	selector: 'odm-ghost-block',
	templateUrl: './ghost-block.component.html',
	styleUrls: ['./ghost-block.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GhostBlockComponent implements OnInit {
	/**
	 * Host binding of ghost block component indicating busy state.
	 */
	@HostBinding('attr.aria-busy')
	busy = true;

	/**
	 * Creates an instance of ghost block component.
	 * @param ghostAnimationService
	 */
	constructor(private ghostAnimationService: GhostAnimationService) {}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.ghostAnimationService.syncAnimation();
	}
}
