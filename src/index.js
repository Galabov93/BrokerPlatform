/* eslint-disable no-console */
const logger = require('./logger');
const app = require('./app');
const port = app.get('port');
const server = app.listen(port);

const cron = require('node-cron');
const scrapeRealEstates = require('./scraperRunner');

const filterNumber = 0;
scrapeRealEstates(app, filterNumber);

cron.schedule('0 0 * * *', () => {
    const filterNumber = 0;
    scrapeRealEstates(app, filterNumber);
});

cron.schedule('0 3 * * *', () => {
    const filterNumber = 1;
    scrapeRealEstates(app, filterNumber);
});

process.on('unhandledRejection', (reason, p) =>
    logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
    logger.info(
        'Feathers application started on http://%s:%d',
        app.get('host'),
        port
    )
);
