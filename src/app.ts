import express from 'express';

import * as toastController from './controllers/toastController'

const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});

/**
 * Primary app routes.
 */
app.post('/v1/toast', toastController.toast);
