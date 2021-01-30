import { ValidationErrorType } from './validation-error.enum';

/**
 * Translate error type used for translating client side errors.
 */
export interface TranslateError {
	/**
	 * Translation key that matches what is inside i18n .json files, example odm.account.header
	 */
	translationKey?: string;

	/**
	 * Error detail that should be replaced with placeholder, example '{email} is already registered.' Extras will be email that is already registered.
	 */
	extras?: any;

	/**
	 * Type of validation error.
	 */
	validationErrorType: ValidationErrorType;
}
