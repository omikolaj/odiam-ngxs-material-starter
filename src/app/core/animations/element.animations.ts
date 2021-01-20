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
 * Fade in animation.
 * Example: @fadeIn
 */
export const fadeInAnimation = trigger('fadeIn', [
	transition(':enter', [style({ opacity: '0' }), animate('.5s ease-in-out', style({ opacity: '1' }))])
]);
