import { OdmWebApiException } from './odm-web-api-exception.model';

export interface InternalServerErrorDetails extends OdmWebApiException {
	status: number;
	message: string;
}
