import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { GhostAnimationService } from 'app/shared/services/ghost-animation.service';

@Component({
	selector: 'odm-ghost-block',
	templateUrl: './ghost-block.component.html',
	styleUrls: ['./ghost-block.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GhostBlockComponent implements OnInit {
	@HostBinding('attr.aria-busy')
	busy = true;

	constructor(private ghostAnimationService: GhostAnimationService) {}

	ngOnInit(): void {
		this.ghostAnimationService.syncAnimation();
	}
}
