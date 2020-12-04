import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { SigninComponent } from './signin/signin.component';
import { AuthContainerComponent } from './auth-container/auth-container.component';
import { SignupComponent } from './signup/signup.component';
import { SharedModule } from 'app/shared/shared.module';
import { AuthComponent } from './auth/auth.component';

@NgModule({
	declarations: [SigninComponent, AuthContainerComponent, SignupComponent, AuthComponent],
	imports: [CommonModule, AuthRoutingModule, SharedModule]
})
export class AuthModule {}
