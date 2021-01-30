/**
 * Validation error type. Used for specific cases when placeholder values need to be replaced.
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
