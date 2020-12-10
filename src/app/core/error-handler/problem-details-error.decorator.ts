import { rootInjector } from 'app/root-injector';
import { ProblemDetailsService } from './problem-details.service';

export function ProblemDetailsError() {
	return function (target: any, key: string): void {
		const service = rootInjector.get(ProblemDetailsService);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		target[key] = service.getProblemDetails$;
	};
}
