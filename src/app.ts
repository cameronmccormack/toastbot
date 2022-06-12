import express from 'express';
import { config } from './config';

import * as healthcheckController from './controllers/healthcheckController';
import * as helpController from './controllers/helpController';
import * as toastController from './controllers/toastController';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.listen(config.port, () => {
    return console.log(`Express is listening at http://localhost:${config.port}`);
});

/**
 * Primary app routes.
 */
app.get('/healthcheck', healthcheckController.check);
app.post('/v1/help', helpController.help);
app.post('/v1/toast', toastController.toast);
