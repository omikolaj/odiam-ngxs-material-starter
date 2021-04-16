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
import { MatTreeModule } from '@angular/material/tree';

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
import { OdmGhostBlockComponent } from './components/odm-ghost-block/odm-ghost-block.component';
import { OdmGhostAnimationService } from './services/odm-ghost-animation.service';
import { OdmSpinnerComponent } from './components/odm-spinner/odm-spinner.component';
import { MatVerticalStepperScrollerDirective } from './directives/mat-vertical-stepper-scroller.directive';
import { ServerSideErrorComponent } from './components/server-side-error/server-side-error.component';
import { VerificationCodeComponent } from './components/verification-code/verification-code.component';
import { PasswordHelpComponent } from './components/password-help/password-help.component';

/**
 * Shared module.
 */
@NgModule({
	declarations: [
		OdmGhostBlockComponent,
		OdmSpinnerComponent,
		MatVerticalStepperScrollerDirective,
		ServerSideErrorComponent,
		VerificationCodeComponent,
		PasswordHelpComponent
	],
	providers: [OdmGhostAnimationService, { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,

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
		MatTreeModule,
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
		MatTreeModule,
		LayoutModule,

		FontAwesomeModule,

		// Components
		OdmGhostBlockComponent,
		OdmSpinnerComponent,
		ServerSideErrorComponent,
		VerificationCodeComponent,
		PasswordHelpComponent,

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
