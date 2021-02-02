import { trigger, transition, animate, keyframes, style } from '@angular/animations';

/*
 * Up down fade in animation that can be used to display elements fading in from the top and leaving fading up.
 * Example: @upDownFadeIn
 */
export const upDownFadeInAnimation = trigger('upDownFadeIn', [
	transition(':enter', [
		animate(
			500,
			keyframes([style({ opacity: 0, transform: 'translateY(-20px)', offset: 0 }), style({ opacity: 1, transform: 'translateY(0)', offset: 1 })])
		)
	]),
	transition(':leave', [
		animate(
			500,
			keyframes([style({ opacity: 1, transform: 'translateY(0)', offset: 0 }), style({ opacity: 0, transform: 'translateY(-20px)', offset: 1 })])
		)
	])
]);

/*
 * Right to left fade in animation used to display and hide elements incoming from right hand side to left hand side.
 * Example: @rightLeftFadeIn
 */
export const rightLeftFadeInAnimation = trigger('rightLeftFadeIn', [
	transition(':enter', [
		animate(
			300,
			keyframes([style({ opacity: 0, transform: 'translateX(-20px)', offset: 0 }), style({ opacity: 1, transform: 'translateX(0)', offset: 1 })])
		)
	]),
	transition(':leave', [
		animate(
			300,
			keyframes([style({ opacity: 1, transform: 'translateX(0)', offset: 0 }), style({ opacity: 0, transform: 'translateX(-20px)', offset: 1 })])
		)
	])
]);

/*
 * Left to right fade in animation used to display and hide elements incoming from left hand side to right hand side.
 * Example: @leftRightFadeIn
 */
export const leftRightFadeInAnimation = trigger('leftRightFadeIn', [
	transition(':enter', [
		animate(
			300,
			keyframes([style({ opacity: 0, transform: 'translateX(20px)', offset: 0 }), style({ opacity: 1, transform: 'translateX(0)', offset: 1 })])
		)
	]),
	transition(':leave', [
		animate(
			300,
			keyframes([style({ opacity: 1, transform: 'translateX(0px)', offset: 0 }), style({ opacity: 0, transform: 'translateX(-20px)', offset: 1 })])
		)
	])
]);

/*
 * Fade in animation.
 * Example: @fadeIn
 */
export const fadeInAnimation = trigger('fadeIn', [
	transition(':enter', [style({ opacity: '0' }), animate('.5s ease-in-out', style({ opacity: '1' }))])
]);
