import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { UserProfileDetails } from 'app/core/models/user-profile-details.model';

@Component({
	selector: 'odm-profile-details',
	templateUrl: './profile-details.component.html',
	styleUrls: ['./profile-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileDetailsComponent implements OnInit {
	@Input() profileDetails: UserProfileDetails;
	constructor() {}

	ngOnInit(): void {}
}
