require('dotenv').config();
const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./logger');

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');

const sequelize = require('./sequelize');
const queue = require('async/queue');

const authentication = require('./authentication');
require('./config/aws');

const app = express(feathers());

// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));

const asyncMiddleware = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// run the cronjob here
app.get(
    '/testScraper',
    asyncMiddleware(async (req, res) => {
        try {
            const linksForScraping = await app
                .service('get-property-links')
                .find();

            for (let index = 0; index < linksForScraping.length; index++) {
                try {
                    const linkToBeScraped = linksForScraping[index];

                    //get data
                    const propertyData = await app
                        .service('scrape-links-service')
                        .find({
                            linkToBeScraped,
                        });

                    // upload to DB
                    const uploadTable = await app
                        .service('real-estates')
                        .create(propertyData);

                    const images = await app
                        .service('scrape-images-from-url')
                        .create({
                            linkToBeScraped,
                        });

                    await app.service('upload-image-to-cloud').uploadAllImages({
                        links: images,
                        realEstateId: propertyData.real_estates_id,
                    });
                } catch (e) {
                    console.log('Error in property creation', e);
                }
            }

            res.send('Success');
        } catch (error) {
            console.error('Error scraping individual page');
        }
    })
);

// Set up Plugins and providers
app.configure(express.rest());
app.configure(sequelize);
// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
app.configure(authentication);
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

app.hooks(appHooks);

module.exports = app;
