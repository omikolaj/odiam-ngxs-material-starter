import { Directive, HostListener } from '@angular/core';
import { CdkStepper } from '@angular/cdk/stepper';

@Directive({
	selector: '[odmMatVerticalStepperScroller]'
})
export class MatVerticalStepperScrollerDirective {
	constructor(private stepper: CdkStepper) {}

	@HostListener('animationDone')
	selectionChanged() {
		const stepId = this.stepper._getStepLabelId(this.stepper.selectedIndex);
		const stepElement = document.getElementById(stepId);
		if (stepElement) {
			stepElement.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
		}
	}
}
