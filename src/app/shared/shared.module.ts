import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';
import { LayoutModule } from '@angular/cdk/layout';

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
	faPlus,
	faEdit,
	faTrash,
	faTimes,
	faCaretUp,
	faCaretDown,
	faExclamationTriangle,
	faFilter,
	faTasks,
	faCheck,
	faSquare,
	faLanguage,
	faPaintBrush,
	faLightbulb,
	faWindowMaximize,
	faStream,
	faBook,
	faUserSecret
} from '@fortawesome/free-solid-svg-icons';
import { faMediumM, faGithub } from '@fortawesome/free-brands-svg-icons';
import { GhostBlockComponent } from './components/ghost-block/ghost-block.component';
import { GhostAnimationService } from './services/ghost-animation.service';
import { OdmSpinnerComponent } from './components/odm-spinner/odm-spinner.component';
import { MatVerticalStepperScrollerDirective } from './directives/mat-vertical-stepper-scroller.directive';

/**
 * Shared module.
 */
@NgModule({
	declarations: [GhostBlockComponent, OdmSpinnerComponent, MatVerticalStepperScrollerDirective],
	providers: [GhostAnimationService, { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }],
	imports: [
		CommonModule,
		FormsModule,

		TranslateModule,

		// Angular material
		MatButtonModule,
		MatSelectModule,
		MatTabsModule,
		MatInputModule,
		MatProgressSpinnerModule,
		MatChipsModule,
		MatCardModule,
		MatCheckboxModule,
		MatListModule,
		MatMenuModule,
		MatIconModule,
		MatTooltipModule,
		MatSnackBarModule,
		MatSlideToggleModule,
		MatDividerModule,
		MatStepperModule,
		MatExpansionModule,
		LayoutModule,

		FontAwesomeModule
	],
	exports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,

		TranslateModule,

		// Angular material
		MatButtonModule,
		MatMenuModule,
		MatTabsModule,
		MatChipsModule,
		MatInputModule,
		MatProgressSpinnerModule,
		MatCheckboxModule,
		MatCardModule,
		MatListModule,
		MatSelectModule,
		MatIconModule,
		MatTooltipModule,
		MatSnackBarModule,
		MatSlideToggleModule,
		MatDividerModule,
		MatSliderModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatStepperModule,
		MatExpansionModule,
		LayoutModule,

		FontAwesomeModule,

		// Components
		GhostBlockComponent,
		OdmSpinnerComponent,

		// Directives
		MatVerticalStepperScrollerDirective
	]
})
export class SharedModule {
	/**
	 * Creates an instance of shared module.
	 * @param faIconLibrary
	 */
	constructor(faIconLibrary: FaIconLibrary) {
		faIconLibrary.addIcons(
			faGithub,
			faMediumM,
			faPlus,
			faEdit,
			faTrash,
			faTimes,
			faCaretUp,
			faCaretDown,
			faExclamationTriangle,
			faFilter,
			faTasks,
			faCheck,
			faSquare,
			faLanguage,
			faPaintBrush,
			faLightbulb,
			faWindowMaximize,
			faStream,
			faBook,
			faUserSecret
		);
	}
}
