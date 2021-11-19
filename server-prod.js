const path = require('path');
const express = require('express');

const PORT = process.env.PORT || 4000;

const app = express();

app.use(express.static(path.resolve(__dirname, './dist/odiam-ngxs-material-starter/browser')));
app.use('/', express.static(path.resolve(__dirname, './dist/odiam-ngxs-material-starter/browser')));
app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`));
