/**
 * Odm web api exception model.
 */
export interface OdmWebApiException {
	/**
	 * Type of error (i.e BadRequest, InternalServerError, NotAcceptable etc.).
	 */
	type: string;

	/**
	 * Error title.
	 */
	title: string;

	/**
	 * Error http status code.
	 */
	status: number;

	/**
	 * Error detail message.
	 */
	detail: string;

	/**
	 * Instance at which the error occured at (i.e 'api/auth/refresh-token etc.).
	 */
	instance: string;
}
