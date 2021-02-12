import { OdmWebApiException } from './odm-web-api-exception.model';

/**
 * Internal server error details model.
 */
export interface InternalServerErrorDetails extends OdmWebApiException {
	status: number;
	message: string;
}
