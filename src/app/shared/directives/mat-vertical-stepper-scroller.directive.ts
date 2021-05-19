import { Directive, HostListener } from '@angular/core';
import { CdkStepper } from '@angular/cdk/stepper';

/**
 * Material vertical stepper scroller directive used to bring the stepper to the top of view port.
 */
@Directive({
	selector: '[odmMatVerticalStepperScroller]'
})
export class MatVerticalStepperScrollerDirective {
	/**
	 * Creates an instance of mat vertical stepper scroller directive.
	 * @param _stepper
	 */
	constructor(private _stepper: CdkStepper) {}

	/**
	 * Scrolls vertically when mat-vertical-stepper is displayed.
	 * Ensures the component is in users view port.
	 */
	@HostListener('animationDone')
	selectionChanged(): void {
		const stepId = this._stepper._getStepLabelId(this._stepper.selectedIndex);
		const stepElement = document.getElementById(stepId);
		if (stepElement) {
			// not supported in iOS or Safari, or few other mobile websites { block: 'start', inline: 'nearest', behavior: 'smooth' }
			stepElement.scrollIntoView(true);
		}
	}
}
