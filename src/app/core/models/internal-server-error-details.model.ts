import { OdmWebApiException } from './odm-web-api-exception.model';

/**
 * Internal server error details model.
 */
export interface InternalServerErrorDetails extends OdmWebApiException {
	/**
	 * Http status code.
	 */
	status: number;

	/**
	 * Http error message.
	 */
	message: string;
}
