import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';

import { routeAnimations } from '../../../core/core.module';
import { Store } from '@ngxs/store';
import { AuthState } from 'app/core/auth/auth.store.state';
import { LogService } from 'app/core/logger/log.service';

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

	examples = [
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
	 * @param store
	 */
	constructor(private store: Store, private logger: LogService) {}

	/**
	 * NgOnInit life cycle.
	 */
	ngOnInit(): void {
		this.logger.trace('Initialized.', this);
		this.isAuthenticated$ = this.store.select(AuthState.selectIsAuthenticated);
	}
}
