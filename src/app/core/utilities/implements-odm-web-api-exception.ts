import { InternalServerErrorDetails } from '../models/internal-server-error-details.model';

/**
 * Determines whether the internal server error response implements OdmWebApiException
 * @param error
 * @returns odm api exception
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function implementsOdmWebApiException(error: any): error is InternalServerErrorDetails {
	return (
		(error as InternalServerErrorDetails).title !== undefined ||
		(error as InternalServerErrorDetails).detail !== undefined ||
		(error as InternalServerErrorDetails).instance !== undefined ||
		(error as InternalServerErrorDetails).type !== undefined
	);
}
