import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { TranslateError } from 'app/core/models/translate-error.model';
import { ValidationErrorType } from 'app/core/models/validation-error.enum';
import { map } from 'rxjs/operators';

/**
 * Translate errors service.
 */
@Injectable({
	providedIn: 'root'
})
export class TranslateErrorsService {
	/**
	 * Creates an instance of translate errors service.
	 * @param translateService
	 */
	constructor(private translateService: TranslateService) {}

	/**
	 * Translates email error messages.
	 * @param errors
	 * @returns translated email error message
	 */
	translateErrorMessage$(errors: ValidationErrors): Observable<string> {
		const translateError = this._mapErrorToTranslation(errors);
		return translateError.translationKey !== undefined
			? this.translateService
					.get(translateError.translationKey)
					.pipe(map((translated: string) => this._buildTranslatedString(translateError, translated)))
			: of(translateError.extras as string);
	}

	/**
	 * Maps email error to translation.
	 * @param errors
	 * @returns TranslateError
	 */
	private _mapErrorToTranslation(errors: ValidationErrors): TranslateError {
		if (errors['required']) {
			return {
				translationKey: 'odm.auth.form.validations.field-required',
				validationErrorType: ValidationErrorType.Required
			};
		} else if (errors['email']) {
			return {
				translationKey: 'odm.auth.form.validations.invalid-email-format',
				validationErrorType: ValidationErrorType.InvalidEmailFormat
			};
		} else if (errors['nonUnique']) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			return {
				translationKey: 'odm.auth.form.validations.non-unique-email',
				extras: errors['nonUnique'] as string,
				validationErrorType: ValidationErrorType.NonUniqueEmail
			};
		} else if (errors['serverValidationError']) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			// these could be 40X errors explicitly returned by the server
			return {
				validationErrorType: ValidationErrorType.ServerValidationError,
				extras: errors['errorDescription'] as string
			};
		} else if (errors['serverAuthenticationError']) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return {
				validationErrorType: ValidationErrorType.ServerAuthenticationError,
				extras: errors['errorDescription'] as string
			};
		} else {
			return {
				translationKey: 'odm.auth.form.validations.input-error',
				validationErrorType: ValidationErrorType.InputValidationError
			};
		}
	}

	/**
	 * Builds translated string. Accounts for special handling for certain errors.
	 * @param translateError
	 * @param translated
	 * @returns translated string
	 */
	private _buildTranslatedString(translateError: TranslateError, translated: string): string {
		switch (translateError.validationErrorType) {
			case ValidationErrorType.Required:
			case ValidationErrorType.InputValidationError:
			case ValidationErrorType.InvalidEmailFormat:
			case ValidationErrorType.ServerValidationError:
			case ValidationErrorType.ServerAuthenticationError:
			default:
				return translated;

			case ValidationErrorType.NonUniqueEmail:
				return translated.replace('{email}', translateError.extras);
		}
	}

	/**
	 * Maps password error to translation key and validation error enum.
	 * @param errors
	 * @returns password error to translation
	 */
	// private _mapPasswordErrorToTranslation(errors: ValidationErrors): TranslateError {
	// if (errors['required']) {
	// 	return {
	// 		translationKey: 'odm.auth.form.validations.field-required',
	// 		validationErrorType: ValidationErrorType.Required
	// 	};
	// } else if (errors['number']) {
	// 	return {
	// 		translationKey: 'odm.auth.server.validation.number',
	// 		validationErrorType: ValidationErrorType.Number
	// 	};
	// } else if (errors['uppercase']) {
	// 	return {
	// 		translationKey: 'odm.auth.server.validation.uppercase',
	// 		validationErrorType: ValidationErrorType.Uppercase
	// 	};
	// } else if (errors['lowercase']) {
	// 	return {
	// 		translationKey: 'odm.auth.server.validation.lowercase',
	// 		validationErrorType: ValidationErrorType.Lowercase
	// 	};
	// } else if (errors['nonAlphanumeric']) {
	// 	// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
	// 	return {
	// 		translationKey: 'odm.auth.server.validation.non-alphanumeric',
	// 		extras: errors['requiredNonAlphanumeric'] as string,
	// 		validationErrorType: ValidationErrorType.NonAlphanumeric
	// 	};
	// } else if (errors['minlength']) {
	// 	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	// 	const error = errors['minlength'] as { requiredLength: number };
	// 	return {
	// 		translationKey: 'odm.auth.server.validation.minlength',
	// 		extras: error['requiredLength'],
	// 		validationErrorType: ValidationErrorType.MinLength
	// 	};
	// }
	// 	if (errors['serverValidationError']) {
	// 		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	// 		// these could be 40X errors explicitly returned by the server
	// 		return {
	// 			validationErrorType: ValidationErrorType.ServerValidationError,
	// 			extras: errors['errorDescription'] as string
	// 		};
	// 	} else if (errors['serverAuthenticationError']) {
	// 		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	// 		return errors['errorDescription'];
	// 	} else {
	// 		return {
	// 			translationKey: 'odm.auth.form.validations.input-error',
	// 			validationErrorType: ValidationErrorType.InputValidationError
	// 		};
	// 	}
	// }

	// TODO should be removed if existing method of displaying errors works
	// getPasswordErrorMessage(errors: ValidationErrors): string {
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
	// }

	// TODO should be removed if existing method of displaying errors works
	// getEmailErrorMessage(errors: ValidationErrors): string {
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
}
