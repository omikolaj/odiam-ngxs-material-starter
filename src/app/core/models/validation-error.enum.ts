export enum ValidationError {
	None,
	Required,
	Number,
	Uppercase,
	Lowercase,
	NonAlphanumeric,
	MinLength,
	ServerValidationError,
	ServerAuthenticationError,
	InputValidationError,
	InvalidEmailFormat,
	NonUniqueEmail
}
