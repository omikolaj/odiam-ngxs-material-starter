import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FeatureListComponent } from './feature-list/feature-list.component';

const routes: Routes = [
	{
		path: '',
		component: FeatureListComponent,
		data: { title: 'odm.menu.features' }
	}
];

/**
 * Feature list routing module.
 */
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class FeatureListRoutingModule {}
