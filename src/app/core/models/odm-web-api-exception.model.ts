export interface OdmWebApiException {
	type: string;
	title: string;
	status: number;
	detail: string;
	instance: string;
}