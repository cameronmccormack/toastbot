import express from 'express';
import 'dotenv/config'
import bodyParser from 'body-parser';

import * as healthcheckController from './controllers/healthcheckController'
import * as toastController from './controllers/toastController'

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});

/**
 * Primary app routes.
 */
app.get('/healthcheck', healthcheckController.check)
app.post('/v1/toast', toastController.toast);
