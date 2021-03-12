/**
 * Error translate type. Used to control which method execution enters when translating
 * errors. Improves performance, by only checking errors scoped to the type.
 */
export enum ErrorTranslateType {
	Password,
	Server,
	Form
}
