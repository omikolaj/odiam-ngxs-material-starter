# Angular 13, Ngxs and Angular Material Starter

## Getting started

```bash
git clone https://github.com/omikolaj/odiam-ngxs-material-starter.git new-project
cd new-project
npm install
npm start
```

Build files with index-dev.html
```bash
npm run build
```

Build files with index.html
```bash
npm run build:prod
```

Start server locally and serve files from /dist (uses index.html)
```bash
npm run start:prod
```

#### Server Side Rendering

Start SSR server for local development
```bash
npm run dev:ssr
```

Build SSR bundles - development (index-dev.html)
```bash
npm run build:ssr
```

Server SSR Bundles - development (index-dev.html)
```bash
npm run serve:ssr
odiam-ngxs-material-starter/server/main.js expects index-dev.html file (does not work when static files were generated using build:ssr:prod)
```

Build and serve SSR files - development (index-dev.html)
Allows to see how production nodejs file configuration setup will behave. Uses odiam-ngxs-material-starter/server/main.js file to serve index-dev.html.
```bash
npm run start:ssr
```

Build SSR Bundles - production (index.html)
```bash
npm run build:ssr:prod
```

## Features

- custom themes support (4 themes included)
- lazy-loading of feature modules
- localStorage ui state persistence
- fully responsive design
- Hot module reload support
- Server side rendering support
- Translations
- angular-material and custom components in `SharedModule`
