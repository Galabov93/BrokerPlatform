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

const puppeteer = require('puppeteer');

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

app.get(
    '/testPuppet',
    asyncMiddleware(async (req, res) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            console.log('TCL: page', page);

            // we want to login to this page using credentials
            await page.goto(
                'https://www.imot.bg/pcgi/imot.cgi?act=26&logact=1'
            );
            console.log('go');
            await page.screenshot({ path: './test.png' });
            res.send('baiko');
        } catch (error) {
            console.log('error puppet', error);
        }
    })
);

// Set up Plugins and providers
app.configure(express.rest());

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

app.hooks(appHooks);

module.exports = app;
