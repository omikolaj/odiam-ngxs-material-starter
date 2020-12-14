import { OdmWebApiException } from './odm-web-api-exception.model';

/**
 * Problem details models for when the api responds with expected error.
 */
export interface ProblemDetails extends OdmWebApiException {
	type: string;
	status: number;
	title: string;
	detail: string;
	instance: string;
	errors?: {
		[errorCode: string]: string[];
	};
}
