const packageJson = require('../../package.json');

export const environment = {
	appName: 'Odiam Ngxs Material Starter',
	envName: 'DEV',
	hmr: true,
	backend: {
		apiUrl: '/api'
	},
	production: false,
	test: false,
	i18nPrefix: '',
	versions: {
		app: packageJson.version,
		angular: packageJson.dependencies['@angular/core'],
		ngxs: packageJson.dependencies['@ngxs/store'],
		material: packageJson.dependencies['@angular/material'],
		bootstrap: packageJson.dependencies.bootstrap,
		rxjs: packageJson.dependencies.rxjs,
		ngxtranslate: packageJson.dependencies['@ngx-translate/core'],
		fontAwesome: packageJson.dependencies['@fortawesome/fontawesome-free'],
		angularCli: packageJson.devDependencies['@angular/cli'],
		typescript: packageJson.devDependencies['typescript'],
		cypress: packageJson.devDependencies['cypress']
	}
};
