// TODO should be removed if existing way of displaying and translating error messages works.
// /**
//  * Shared functions between reset password component and signup component.
//  */

// import { ValidationErrors } from '@angular/forms';
// import { ValidationMessage_Invalid, ValidationMessage_Required, ValidationMessage_Email } from './validation-messages';
// import { TranslateError } from 'app/core/models/translate-error.model';
// import { ValidationErrorType } from 'app/core/models/validation-error.enum';

// /**
//  * Gets email error message.
//  * @param errors
//  * @returns email error message
//  */
// export function getEmailErrorMessage(errors: ValidationErrors): string {
// 	if (errors['required']) {
// 		return ValidationMessage_Required;
// 	} else if (errors['email']) {
// 		return ValidationMessage_Email;
// 	} else if (errors['nonUnique']) {
// 		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
// 		return `${errors['nonUnique']} is already registered.`;
// 	} else if (errors['serverAuthenticationError']) {
// 		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
// 		return errors['errorDescription'];
// 	} else {
// 		return ValidationMessage_Invalid;
// 	}
// }

// /**
//  * Gets password error message.
//  * @param errors
//  * @returns password error message
//  */
// export function getPasswordErrorMessage(errors: ValidationErrors): string {
// 	if (errors['required']) {
// 		return ValidationMessage_Required;
// 	} else if (errors['number']) {
// 		return "Password must have at least one digit ('0'-'9').";
// 	} else if (errors['uppercase']) {
// 		return "Password must have at least one uppercase ('A'-'Z').";
// 	} else if (errors['lowercase']) {
// 		return "Password must have at least one lowercase ('a'-'z').";
// 	} else if (errors['nonAlphanumeric']) {
// 		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
// 		return `Password must contain one of: ${errors['requiredNonAlphanumeric']}`;
// 	} else if (errors['minlength']) {
// 		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
// 		const error = errors['minlength'] as { requiredLength: number };
// 		return `Password must to be at least ${error['requiredLength']} characters long.`;
// 	} else if (errors['serverValidationError']) {
// 		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
// 		return errors['errorDescription'];
// 	} else if (errors['serverAuthenticationError']) {
// 		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
// 		return errors['errorDescription'];
// 	} else {
// 		return ValidationMessage_Invalid;
// 	}
