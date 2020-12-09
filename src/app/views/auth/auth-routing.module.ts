import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthContainerComponent } from './auth-container/auth-container.component';

const routes: Routes = [
	{
		path: '',
		component: AuthContainerComponent,
		data: { title: 'odm.auth' }
	}
];

/**
 * Auth routing module.
 */
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AuthRoutingModule {}
