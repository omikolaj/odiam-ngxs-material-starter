/**
 * Represents the active panel for sign-in/sign-up overlay.
 * NOTE: These are used as CSS class along with selectors in auth-container.component.scss to remove sign-in/sign-up overlay.
 */
export type ActiveAuthType =
	| 'sign-in-active'
	| 'sign-up-active'
	| 'forgot-password-active'
	| 'two-step-verification-active'
	| 'reset-password-active'
	| 'successful-registration-active'
	| 'email-confirmation-active'
	| 'email-change-confirmation-active'
	| 'confirmation-error-active';
