import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralContainerRoutingModule } from './general-container-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { PersonalEmailComponent } from './personal-email/personal-email.component';
import { GeneralContainerComponent } from './general-container.component';
import { AccountGeneralState } from './general-container.store.state';
import { NgxsModule } from '@ngxs/store';
import { GeneralSandboxService } from './general-sandbox.service';

/**
 * General Container module.
 */
@NgModule({
	declarations: [GeneralContainerComponent, PersonalEmailComponent],
	imports: [CommonModule, GeneralContainerRoutingModule, SharedModule, NgxsModule.forFeature([AccountGeneralState])],
	providers: [GeneralSandboxService]
})
export class GeneralContainerModule {}
