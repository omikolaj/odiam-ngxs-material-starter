import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthContainerComponent } from './auth-container/auth-container.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';

const routes: Routes = [
	{
		path: '',
		component: AuthContainerComponent,
		data: { title: 'odm.auth' }
	},
	{
		path: 'signup',
		component: SigninComponent,
		data: { title: 'odm.auth' }
	},
	{
		path: 'signup',
		component: SignupComponent,
		data: { title: 'odm.auth' }
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AuthRoutingModule {}
