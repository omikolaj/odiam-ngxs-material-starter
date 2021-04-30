import { PasswordRequirement } from '../models/auth/password-requirement.model';
import { PasswordRequirementType } from '../models/auth/password-requirement-type.enum';

/**
 * Gets password requirements for this application.
 * @returns password requirements
 */
export function getPasswordRequirements(): PasswordRequirement[] {
	return [
		{
			name: 'odm.auth.form.requirements.title',
			type: PasswordRequirementType.None,
			children: [
				{
					name: 'odm.auth.form.requirements.min-chars-long',
					type: PasswordRequirementType.MinCharsLength
				},
				{
					name: 'odm.auth.form.requirements.one-upper-case',
					type: PasswordRequirementType.UpperCase
				},
				{
					name: 'odm.auth.form.requirements.one-lower-case',
					type: PasswordRequirementType.LowerCase
				},
				{
					name: 'odm.auth.form.requirements.digit',
					type: PasswordRequirementType.Digit
				},
				{
					name: 'odm.auth.form.requirements.three-unique-chars',
					type: PasswordRequirementType.ThreeUniqueChar
				},
				{
					name: 'odm.auth.form.requirements.one-special-char',
					type: PasswordRequirementType.SpecialChar
				}
			]
		}
	] as PasswordRequirement[];
}
