import { rootInjector } from 'app/root-injector';
import { ServerErrorService } from './server-error.service';

/**
 * Problems details error.
 * @returns details error function.
 */
export function ProblemDetailsError(): (target: any, key: string) => void {
	return function (target: any, key: string): void {
		const service = rootInjector.get(ServerErrorService);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		target[key] = service.getProblemDetails$;
	};
}
