import { Validators, AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Odm validators class extends angulars native Validators class
 */
export class OdmValidators extends Validators {
	/**
	 * Requires digit on an input field.
	 * @param control
	 * @returns digit
	 */
	static requireDigit(control: AbstractControl): ValidationErrors | null {
		const hasNumber = /\d/.test(control.value);
		if (hasNumber) {
			return null;
		}
		return { number: true };
	}

	/**
	 * Requires uppercase on an input field.
	 * @param control
	 * @returns uppercase
	 */
	static requireUppercase(control: AbstractControl): ValidationErrors | null {
		const hasUppercase = /[A-Z]/.test(control.value);
		if (hasUppercase) {
			return null;
		}
		return { uppercase: true };
	}

	/**
	 * Requires lowercase on an input field.
	 * @param control
	 * @returns lowercase
	 */
	static requireLowercase(control: AbstractControl): ValidationErrors | null {
		const hasLowercase = /[a-z]/.test(control.value);
		if (hasLowercase) {
			return null;
		}
		return { lowercase: true };
	}

	/**
	 * Requires one of the following non alphanumeric characters '! @ # $ % & * _ ?'
	 * @param control
	 * @returns non alphanumeric
	 */
	static requireNonAlphanumeric(control: AbstractControl): ValidationErrors {
		const hasNonAlphanumeric = /[!@#$%&*_?]/.test(control.value);
		if (hasNonAlphanumeric) {
			return null;
		}
		return { nonAlphanumeric: true, requiredNonAlphanumeric: '! @ # $ % & * _ ?' };
	}
}
