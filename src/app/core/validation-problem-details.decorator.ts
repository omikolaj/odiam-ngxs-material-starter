import { rootInjector } from 'app/root-injector';
import { HttpStatusService } from './http-status.service';

export function ValidationProblemDetails() {
	return function (target: any, key: string): void {
		const service = rootInjector.get(HttpStatusService);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		target[key] = service.getValidationErrors$;
	};
}
