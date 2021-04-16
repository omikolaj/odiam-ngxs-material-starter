/**
 * Password requirement type. Used to differentiate different password requirement types.
 */
export enum PasswordRequirementType {
	/**
	 * Used for 'Password help' text.
	 */
	None,
	/**
	 * Describes minimum characters length requirement.
	 */
	MinCharsLength,
	/**
	 * Describes lower case requirement.
	 */
	LowerCase,
	/**
	 * Describes upper case requirement.
	 */
	UpperCase,
	/**
	 * Describes digit requirement.
	 */
	Digit,
	/**
	 * Describes three unique characters requirement.
	 */
	ThreeUniqueChar,
	/**
	 * Describes special character requirement
	 */
	SpecialChar
}
