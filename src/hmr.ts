/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ApplicationRef, NgModuleRef } from '@angular/core';
import { createNewHosts } from '@angularclass/hmr';

export const hmrBootstrap = (module: any, bootstrap: () => Promise<NgModuleRef<any>>) => {
	let ngModule: NgModuleRef<any>;
	module.hot.accept();
	void bootstrap().then((mod) => (ngModule = mod));
	module.hot.dispose(() => {
		const appRef: ApplicationRef = ngModule.injector.get(ApplicationRef);
		const elements = appRef.components.map((c) => c.location.nativeElement);
		const makeVisible = createNewHosts(elements);
		ngModule.destroy();
		makeVisible();
	});
};
