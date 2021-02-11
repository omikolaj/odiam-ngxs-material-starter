import { Directive, HostListener } from '@angular/core';
import { CdkStepper } from '@angular/cdk/stepper';

/**
 * MatVerticalStepperScrollerDirective directive
 */
@Directive({
	selector: '[odmMatVerticalStepperScroller]'
})
export class MatVerticalStepperScrollerDirective {
	/**
	 * Creates an instance of mat vertical stepper scroller directive.
	 * @param stepper
	 */
	constructor(private stepper: CdkStepper) {}

	/**
	 * Scrolls vertically when mat-vertical-stepper is displayed.
	 * Ensures the component is in users view port.
	 */
	@HostListener('animationDone')
	selectionChanged(): void {
		const stepId = this.stepper._getStepLabelId(this.stepper.selectedIndex);
		const stepElement = document.getElementById(stepId);
		if (stepElement) {
			stepElement.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
		}
	}
}
