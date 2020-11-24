# Angular 10, Ngxs and Angular Material Starter

## Getting started

```bash
git clone https://github.com/omikolaj/odiam-ngxs-material-starter.git new-project
cd new-project
npm install
npm start
```

## Useful Commands

- `npm start` - starts a dev server and opens browser with running app
- `npm run start:prod` - runs full prod build and serves prod bundle
- `npm run test` - runs lint and tests
- `npm run watch` - runs tests in watch mode
- `npm run prettier` - runs prettier to format whole code base (`.ts` and `.scss`)
- `npm run analyze` - runs full prod build and `webpack-bundle-analyzer` to visualize how much code is shipped (dependencies & application)

## Make It Your Own

When using this starter project to build your own app you might consider some of the following steps:

- use `search and replace` functionality of your favourite IDE to replace `odm` with `<your-app-prefix>`
- rename project in `package.json` `name` property and set appropriate version (eg `0.0.0` or `1.0.0`)
- remove / rename context path config `-- --deploy-url /odiam-ngxs-material-starter/ --base-href /odiam-ngxs-material-starter` in `package.json`, this is used to configure url (context path) on which the application will be available (eg. `https://www.something.com/<context-path>/`)
- rename app in `/environments/` files (will be shown in browser tab)
- delete pre-existing `CHANGELOG.md` (you will generate your own with future releases of your features)
- delete `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md` and `BUILT_WITH.md` files as they are relevant only if project is open sourced on Github
- edit the title and Open Graph metadata properties in `index.html`
- remove or adjust links in the [footer](https://github.com/tomastrajan/odiam-ngxs-material-starter/blob/master/src/app/app.component.html#L79)
- replace logo in `/assets` folder ( currently 128 x 128 pixel `png` file )
- adjust colors in `/themes/default-theme.scss`
- create a pull request in the [original repository](https://github.com/tomastrajan/odiam-ngxs-material-starter/) to update `BUILT_WITH.md` [file](https://github.com/tomastrajan/odiam-ngxs-material-starter/blob/master/BUILT_WITH.md) with a link and short description of your project

## Goals

The main goal of this repository is to provide an up to date example of Angular application following all recent best practices in various areas like:

- routing
- Angular CLI configuration (prod build, budgets, ...)

This repository will also strive to always stay in sync with releases of Angular and the related libraries.
The nature of the repository is also a great match for first time open source contributors who can add
simple features and enhance test coverage, all contributors are more than welcome!

#### Theming

- [Live coding Video Tutorial](https://www.youtube.com/watch?v=PsgZjFTAleI)
- [Meetup Presentation & Live coding Video](https://www.youtube.com/watch?v=7auj9RfCNrE)

## Features

- custom themes support (4 themes included)
- lazy-loading of feature modules
- lazy reducers
- localStorage ui state persistence
- fully responsive design
- angular-material and custom components in `SharedModule`

## Stack

- Angular
- Angular Material
