import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';

import { routeAnimations } from '../../../core/core.module';
import { ExamplesFacadeService } from '../examples-facade.service';

/**
 * Examples component.
 */
@Component({
	selector: 'odm-examples',
	templateUrl: './examples.component.html',
	styleUrls: ['./examples.component.scss'],
	animations: [routeAnimations],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamplesComponent implements OnInit {
	isAuthenticated$: Observable<boolean>;

	readonly examples = [
		{ link: './', label: 'odm.examples.menu.todos' },
		{ link: './', label: 'odm.examples.menu.stocks' },
		{ link: './', label: 'odm.examples.menu.theming' },
		{ link: './', label: 'odm.examples.menu.crud' },
		{ link: './', label: 'odm.examples.menu.something' },
		{ link: './', label: 'odm.examples.menu.form' },
		{ link: './', label: 'odm.examples.menu.notifications' },
		{ link: './', label: 'odm.examples.menu.elements' },
		{ link: './', label: 'odm.examples.menu.auth', auth: true }
	];

	/**
	 * Creates an instance of examples component.
	 * @param facade
	 */
	constructor(private facade: ExamplesFacadeService) {
		this.isAuthenticated$ = this.facade.isAuthenticated$;
	}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.facade.log.trace('Initialized.', this);
	}
}
