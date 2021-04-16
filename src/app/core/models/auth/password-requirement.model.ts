import { PasswordRequirementType } from './password-requirement-type.enum';

/**
 * Password requirement model used to model individual password requirements.
 */
export interface PasswordRequirement {
	/**
	 *  Translation key for given password requirement.
	 */
	name: string;

	/**
	 * Password requirement type. Used to differentiate password requirements.
	 */
	type: PasswordRequirementType;

	/**
	 * If individual password requirements have additional tree nodes below it.
	 */
	children: PasswordRequirement[];
}
