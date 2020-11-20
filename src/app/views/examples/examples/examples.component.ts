import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';

import { routeAnimations } from '../../../core/core.module';
import { Store } from '@ngxs/store';
import { AuthState } from 'app/core/auth/auth.store.state';

// import { State } from '../examples.state';

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

	constructor(private store: Store) {}

	ngOnInit(): void {
		this.isAuthenticated$ = this.store.select(AuthState.selectIsAuthenticated);
	}
}
