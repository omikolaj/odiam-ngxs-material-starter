import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { TranslateError } from 'app/core/models/translate-error.model';
import { ValidationErrorType } from 'app/core/models/validation-error.enum';
import { map } from 'rxjs/operators';

/**
 * Error translation service.
 */
@Injectable({
	providedIn: 'root'
})
export class TranslateValidationErrorsService {
	/**
	 * Creates an instance of translate errors service.
	 * @param _translateService
	 */
	constructor(private _translateService: TranslateService) {}

	/**
	 * Translates email error messages.
	 * @param errors
	 * @returns translated email error message
	 */
	translateValidationErrorMessage$(errors: ValidationErrors): Observable<string> {
		const translateError = this._mapErrorToTranslation(errors);
		return translateError.translationKey !== undefined
			? this._translateService
					.get(translateError.translationKey)
					.pipe(map((translated: string) => this._buildTranslatedString(translateError, translated)))
			: of(translateError.extras as string).pipe(map((error: string) => this._buildTranslatedString(translateError, error)));
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
		} else if (errors['minlength']) {
			// 	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			const error = errors['minlength'] as { requiredLength: number };
			return {
				translationKey: 'odm.auth.form.validations.min-length',
				extras: error['requiredLength'],
				validationErrorType: ValidationErrorType.MinLength
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
		} else if (errors['internalServerError']) {
			return {
				validationErrorType: ValidationErrorType.InternalServerError,
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
			case ValidationErrorType.InternalServerError:
			case ValidationErrorType.Number:
			default:
				return translated;

			case ValidationErrorType.NonUniqueEmail:
				return translated.replace('{email}', translateError.extras);

			case ValidationErrorType.NonAlphanumeric:
				return translated.replace('{requiredNonAlphanumeric}', translateError.extras);

			case ValidationErrorType.MinLength:
				return translated.replace('{requiredLength}', translateError.extras);
		}
	}
}
