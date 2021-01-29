import { ValidationError } from './validation-error.enum';

export interface TranslateError {
	translationKey?: string;
	extras?: any;
	validationError: ValidationError;
}
