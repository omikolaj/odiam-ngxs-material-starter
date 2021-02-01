/**
 * Validation error type. Used for specific cases when placeholder values need to be replaced within the translation string.
 */
export enum ValidationErrorType {
	None,
	Required,
	ServerValidationError,
	ServerAuthenticationError,
	InputValidationError,
	InvalidEmailFormat,
	NonUniqueEmail
}
