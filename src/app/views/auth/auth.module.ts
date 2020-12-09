import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthContainerComponent } from './auth-container/auth-container.component';
import { SharedModule } from 'app/shared/shared.module';
import { AuthComponent } from './auth/auth.component';
import { AuthFacadeService } from './auth-facade.service';

/**
 * Auth module.
 */
@NgModule({
	declarations: [AuthContainerComponent, AuthComponent],
	imports: [CommonModule, AuthRoutingModule, SharedModule],
	providers: [AuthFacadeService]
})
export class AuthModule {}
