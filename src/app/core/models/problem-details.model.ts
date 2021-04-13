import { OdmWebApiException } from './odm-web-api-exception.model';

/**
 * Problem details models for when the api responds with expected error.
 */
export interface ProblemDetails extends OdmWebApiException {
	/**
	 * Type of error (i.e BadRequest, NotAcceptable etc.).
	 */
	type: string;

	/**
	 * Error http status code.
	 */
	status: number;

	/**
	 * Error title.
	 */
	title: string;

	/**
	 * Error detail message.
	 */
	detail: string;

	/**
	 * Instance at which the error occured at (i.e 'api/auth/refresh-token etc.).
	 */
	instance: string;

	/**
	 * Any additional validation errors that occured on the server.
	 */
	errors?: {
		[errorCode: string]: string[];
	};
}
