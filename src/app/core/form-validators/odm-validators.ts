import { Validators, AbstractControl, ValidationErrors, UntypedFormGroup } from '@angular/forms';

/**
 * Minimum password length requirement for the application user.
 */
export const MinPasswordLength = 8;

/**
 * Verification code length.
 */
export const VerificationCodeLength = 6;

/**
 * Require minimum number of unique characters in a password. Example if 3 chars are required:
 * 'pppaaasss' will pass validation, however 'pppaaa' will fail.
 */
const RequiredUniqueChars = 3;

/**
 * Odm validators class extends angulars native Validators class
 */
export class OdmValidators extends Validators {
	/**
	 * Requires digit on an input field.
	 * @param control
	 * @returns validation result
	 */
	static requireDigit(control: AbstractControl): ValidationErrors | null {
		const hasNumber = /\d/.test(control.value);
		if (hasNumber) {
			return null;
		}
		return { number: true };
	}

	/**
	 * Requires three unique characters on an input field.
	 * @param control
	 * @param numOfUniqueChars
	 * @returns validation result
	 */
	static requireThreeUniqueCharacters(control: AbstractControl): ValidationErrors | null {
		const password = control.value as string;
		const uniqueChars = new Set(password);
		if (RequiredUniqueChars >= 1 && uniqueChars.size < RequiredUniqueChars) {
			return { uniqueChars: true };
		}
		return null;
	}

	/**
	 * Requires uppercase on an input field.
	 * @param control
	 * @returns validation result
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
	 * @returns validation result
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
	 * @returns validation result
	 */
	static requireNonAlphanumeric(control: AbstractControl): ValidationErrors {
		const hasNonAlphanumeric = /[!@#$%&*_?]/.test(control.value);
		if (hasNonAlphanumeric) {
			return null;
		}
		return { nonAlphanumeric: true, requiredNonAlphanumeric: '! @ # $ % & * _ ?' };
	}

	/**
	 * Requires that password and confirm password fields match.
	 * @param group
	 * @returns validation result
	 */
	static requireConfirmPassword(group: UntypedFormGroup): ValidationErrors | null {
		const password = group.get('password').value as string;
		const confirmPassword = group.get('confirmPassword').value as string;
		return password === confirmPassword ? null : { notSame: true };
	}
}
