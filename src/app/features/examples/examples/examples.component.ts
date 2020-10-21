import { Store, select } from '@ngrx/store';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';

import { routeAnimations, selectIsAuthenticated } from '../../../core/core.module';

import { State } from '../examples.state';

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
		{ link: 'todos', label: 'odm.examples.menu.todos' },
		{ link: 'stock-market', label: 'odm.examples.menu.stocks' },
		{ link: 'theming', label: 'odm.examples.menu.theming' },
		{ link: 'crud', label: 'odm.examples.menu.crud' },
		{
			link: 'simple-state-management',
			label: 'odm.examples.menu.simple-state-management'
		},
		{ link: 'form', label: 'odm.examples.menu.form' },
		{ link: 'notifications', label: 'odm.examples.menu.notifications' },
		{ link: 'elements', label: 'odm.examples.menu.elements' },
		{ link: 'authenticated', label: 'odm.examples.menu.auth', auth: true }
	];

	constructor(private store: Store<State>) {}

	ngOnInit(): void {
		this.isAuthenticated$ = this.store.pipe(select(selectIsAuthenticated));
	}
}
