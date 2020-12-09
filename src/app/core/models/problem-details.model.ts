/**
 * Problem details models for when the api responds with expected error.
 */
export interface ProblemDetails {
	type: string;
	status: string;
	title: string;
	detail: string;
	instance: string;
	errors?: [
		{
			[errorCode: string]: string | string[];
		}
	];
}
