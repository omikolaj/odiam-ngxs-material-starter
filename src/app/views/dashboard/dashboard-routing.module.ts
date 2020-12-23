import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuardService } from 'app/core/core.module';

const routes: Routes = [
	{
		path: '',
		component: DashboardComponent,
		canActivate: [AuthGuardService]
	}
];

/**
 * User dashboard routing module.
 */
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class DashboardRoutingModule {}
