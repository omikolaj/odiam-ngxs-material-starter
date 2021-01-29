import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { TranslateError } from 'app/core/models/translate-error.model';
import { ValidationError } from 'app/core/models/validation-error.enum';
import { map } from 'rxjs/internal/operators/map';

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
	translateEmailErrorMessage$(errors: ValidationErrors): Observable<string> {
		const translateError = this._mapEmailErrorToTranslation(errors);
		return translateError.translationKey !== undefined
			? this.translateService
					.get(translateError?.translationKey)
					.pipe(map((translated: string) => this._buildTranslatedString(translateError, translated)))
			: of(translateError.extras as string);
	}

	/**
	 * Maps email error to translation.
	 * @param errors
	 * @returns TranslateError
	 */
	private _mapEmailErrorToTranslation(errors: ValidationErrors): TranslateError {
		if (errors['required']) {
			return {
				translationKey: 'odm.auth.validation.field-required',
				validationError: ValidationError.Required
			};
		} else if (errors['email']) {
			return {
				translationKey: 'odm.auth.validation.invalid-email-format',
				validationError: ValidationError.InvalidEmailFormat
			};
		} else if (errors['nonUnique']) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			return {
				translationKey: 'odm.auth.validation.non-unique-email',
				extras: errors['nonUnique'] as string,
				validationError: ValidationError.NonUniqueEmail
			};
		} else if (errors['serverAuthenticationError']) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return {
				validationError: ValidationError.ServerAuthenticationError,
				extras: errors['errorDescription'] as string
			};
		} else {
			return {
				translationKey: 'odm.auth.validation.input-error',
				validationError: ValidationError.InputValidationError
			};
		}
	}

	/**
	 * Translates password error message if translation exists.
	 * @param errors
	 * @returns translated password error message
	 */
	translatePasswordErrorMessage$(errors: ValidationErrors): Observable<string> {
		const translateError = this._mapPasswordErrorToTranslation(errors);
		return translateError.translationKey !== undefined
			? this.translateService
					.get(translateError?.translationKey)
					.pipe(map((translated: string) => this._buildTranslatedString(translateError, translated)))
			: of(translateError.extras as string);
	}

	/**
	 * Maps password error to translation key and validation error enum.
	 * @param errors
	 * @returns password error to translation
	 */
	private _mapPasswordErrorToTranslation(errors: ValidationErrors): TranslateError {
		if (errors['required']) {
			return {
				translationKey: 'odm.auth.validation.field-required',
				validationError: ValidationError.Required
			};
		} else if (errors['number']) {
			return {
				translationKey: 'odm.auth.server.validation.number',
				validationError: ValidationError.Number
			};
		} else if (errors['uppercase']) {
			return {
				translationKey: 'odm.auth.server.validation.uppercase',
				validationError: ValidationError.Uppercase
			};
		} else if (errors['lowercase']) {
			return {
				translationKey: 'odm.auth.server.validation.lowercase',
				validationError: ValidationError.Lowercase
			};
		} else if (errors['nonAlphanumeric']) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			return {
				translationKey: 'odm.auth.server.validation.non-alphanumeric',
				extras: errors['requiredNonAlphanumeric'] as string,
				validationError: ValidationError.NonAlphanumeric
			};
		} else if (errors['minlength']) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			const error = errors['minlength'] as { requiredLength: number };
			return {
				translationKey: 'odm.auth.server.validation.minlength',
				extras: error['requiredLength'],
				validationError: ValidationError.MinLength
			};
		} else if (errors['serverValidationError']) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			// these could be 40X errors explicitly returned by the server
			return {
				validationError: ValidationError.ServerValidationError,
				extras: errors['errorDescription'] as string
			};
		} else if (errors['serverAuthenticationError']) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return errors['errorDescription'];
		} else {
			return {
				translationKey: 'odm.auth.validation.input-error',
				validationError: ValidationError.InputValidationError
			};
		}
	}

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

	/**
	 * Builds translated string. Accounts for special handling for certain errors.
	 * @param translateError
	 * @param translated
	 * @returns translated string
	 */
	private _buildTranslatedString(translateError: TranslateError, translated: string): string {
		let formatedTranslation = '';
		switch (translateError.validationError) {
			case ValidationError.Required:
			case ValidationError.Number:
			case ValidationError.Uppercase:
			case ValidationError.Lowercase:
			case ValidationError.InputValidationError:
			case ValidationError.InvalidEmailFormat:
			default:
				formatedTranslation = translated;
				break;
			case ValidationError.NonUniqueEmail: {
				const extras = translateError.extras !== undefined ? (translateError.extras as string) : '';
				formatedTranslation = `${extras} ${translated}`;
				break;
			}
			case ValidationError.NonAlphanumeric: {
				const extras = translateError.extras !== undefined ? (translateError.extras as string) : '';
				formatedTranslation = `${translated} ${extras}`;
				break;
			}
			case ValidationError.MinLength:
				formatedTranslation = translated.replace('{0}', translateError.extras);
				break;
		}
		return formatedTranslation;
	}
}
