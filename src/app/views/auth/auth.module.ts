import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthContainerComponent } from './auth-container/auth-container.component';
import { SharedModule } from 'app/shared/shared.module';
import { AuthComponent } from './auth/auth.component';

/**
 * Auth module.
 */
@NgModule({
	declarations: [AuthContainerComponent, AuthComponent],
	imports: [CommonModule, AuthRoutingModule, SharedModule]
})
export class AuthModule {}
