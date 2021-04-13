import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsContainerComponent } from './settings/settings-container.component';
import { SettingsSandboxService } from './settings-sandbox.service';

/**
 * Settings module.
 */
@NgModule({
	declarations: [SettingsContainerComponent],
	providers: [SettingsSandboxService],
	imports: [CommonModule, SharedModule, SettingsRoutingModule]
})
export class SettingsModule {}
