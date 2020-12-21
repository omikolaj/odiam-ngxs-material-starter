import { Injectable } from '@angular/core';
import { AsyncValidatorFn, AbstractControl } from '@angular/forms';
import { of } from 'rxjs';
import { debounceTime, take, switchMap, map } from 'rxjs/operators';
import { UsersAsyncService } from '../services/users-async.service';

/**
 * Injectable AsyncValidatorsService
 */
@Injectable({
	providedIn: 'root'
})
export class AsyncValidatorsService {
	/**
	 * Creates an instance of validators async service.
	 * @param userService
	 */
	constructor(private usersAsyncService: UsersAsyncService) {}

	/**
	 * Determines whether the value coming from the input is empty.
	 * @param value
	 * @returns true if empty input value
	 */
	private isEmptyInputValue(value: any): boolean {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		return value === null || value.length === 0;
	}

	/**
	 * Checks if email is unique.
	 * @param [initialEmail]
	 * @returns if email is unique
	 */
	checkIfEmailIsUnique(initialEmail: string = ''): AsyncValidatorFn {
		return (control: AbstractControl) => {
			if (this.isEmptyInputValue(control.value)) {
				return of(null);
			} else if (control.value === initialEmail) {
				return of(null);
			} else {
				return control.valueChanges.pipe(
					debounceTime(500),
					take(1),
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					switchMap((_) => {
						return this.usersAsyncService
							.checkIfEmailExists(control.value)
							.pipe(map((exists) => (exists ? { nonUnique: control.value as string } : null)));
					})
				);
			}
		};
	}
}
