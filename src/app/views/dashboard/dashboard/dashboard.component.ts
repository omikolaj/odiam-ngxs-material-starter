import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DashboardFacadeService } from '../dashboard-facade.service';
import { UserProfileDetails } from 'app/core/models/user-profile-details.model';
import { Observable } from 'rxjs';

@Component({
	selector: 'odm-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
	userProfileDetails$: Observable<UserProfileDetails>;

	constructor(private facade: DashboardFacadeService) {
		this.userProfileDetails$ = facade.userProfileDetails$;
	}

	ngOnInit(): void {
		this.facade.getUserProfile();
	}
}
