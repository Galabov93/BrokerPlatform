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

const aws = require('aws-sdk');
// const puppeteer = require('puppeteer');
const rp = require('request-promise');
const cheerio = require('cheerio');
const Buffer = require('buffer').Buffer;
const iconv = require('iconv');
const sequelize = require('./sequelize');

const fs = require('fs');
const request = require('request');

const authentication = require('./authentication');

const app = express(feathers());

const S3_BUCKET = process.env.S3_BUCKET;
aws.config.region = 'eu-central-1';

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

const realEstateTypes = [
    'СТАЯ',
    '1-СТАЕН',
    '2-СТАЕН',
    '3-СТАЕН',
    '4-СТАЕН',
    'МНОГОСТАЕН',
    'МЕЗОНЕТ',
    'АТЕЛИЕ, ТАВАН',
    'ОФИС',
    'МАГАЗИН',
    'ЗАВЕДЕНИЕ',
    'СКЛАД',
    'ХОТЕЛ',
    'ПРОМ. ПОМЕЩЕНИЕ',
    'ЕТАЖ ОТ КЪЩА',
    'КЪЩА',
    'ВИЛА',
    'МЯСТО',
    'ГАРАЖ',
    'ЗЕМЕДЕЛСКА ЗЕМЯ',
];

const testLinks = [
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2b156631115948854',
];

// real_estates_id  ---> done
// real_estates_sell_type ---> done
// real_estates_type --> done
// real_estates_construction_type
// real_estates_tec
// real_estates_title
// real_estates_city
// real_estates_address
// real_estates_price
// real_estates_currency
// real_estates_price_per_square
// real_estates_size
// real_estates_floor
// real_estates_description
// real_estates_thumbnail_images
// real_estates_big_images
// real_estates_seller_phone_number
// real_estates_website_source

const getRealEstateType = (title, realEstateTypes) => {
    let result = null;
    realEstateTypes.forEach(element => {
        if (title.includes(element)) {
            result = element;
        }
    });
    return result;
};

app.get(
    '/testScraper',
    asyncMiddleware(async (req, res) => {
        try {
            const linkToBeScraped = testLinks[0];
            const scraperOptions = {
                uri: linkToBeScraped,
                method: 'GET',
                encoding: 'binary',
                transform: function(body) {
                    body = Buffer.from(body, 'binary');
                    let conv = new iconv.Iconv('windows-1251', 'utf8');
                    body = conv.convert(body).toString();
                    return cheerio.load(body);
                },
            };
            const realEstateId = linkToBeScraped
                .split('&')
                .find(element => element.includes('adv'))
                .split('=')[1];
            const sellType = 'rent';

            const $ = await rp(scraperOptions);

            const title = $('form')
                .attr('name', 'search')
                .children('table')
                .first()
                .find('h1')
                .text();

            const realEstateType = getRealEstateType(title, realEstateTypes);

            console.log('TCL: realEstateType', realEstateType);

            const totalPrice = $('#cena').text();
            const pricePerSquareMeter = $('cenakv').text();
            const descriptionDiv = $('#description_div').text();

            console.log('TCL: sellType', sellType);
            console.log('TCL: realEstateId', realEstateId);

            console.log('TCL: title', title);
            console.log('TCL: totalPrice', totalPrice);
            console.log('TCL: descriptionDiv', descriptionDiv);
            console.log('TCL: pricePerSquareMeter', pricePerSquareMeter);

            res.send('Bogus');
        } catch (error) {
            console.error('Error scraping individual page', error);
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

// app.get(
//     '/loginAndGetLinks',
//     asyncMiddleware(async (req, res) => {
//         try {
//             const browser = await puppeteer.launch();
//             const page = await browser.newPage();
//             // we want to login to this page using credentials
//             await page.goto(process.env.CANDY_SIGN_IN_URL, {
//                 waitUntil: 'networkidle0',
//             });

//             await page.waitForSelector('.vhodOptions input:first-of-type');

//             await page.evaluate(() => {
//                 // eslint-disable-next-line no-undef
//                 document
//                     .querySelector('.vhodOptions input:first-of-type')
//                     .click();
//             });

//             await page.waitFor('input[name="usr"]');
//             await page.type('input[name="usr"]', process.env.CANDY_USERNAME);

//             await page.waitFor('input[name="pwd"]');
//             await page.type('input[name="pwd"]', process.env.CANDY_PASSWORD);

//             await Promise.all([
//                 page.click('.loginButton'),
//                 page.waitForNavigation({ waitUntil: 'networkidle0' }),
//             ]);

//             await page.goto(process.env.CANDY_CUSTOM_FILTERS, {
//                 waitUntil: 'networkidle0',
//             });

//             await Promise.all([
//                 page.click('.startFilter'),
//                 page.waitForNavigation({ waitUntil: 'networkidle0' }),
//             ]);

//             const links = await page.evaluate(() => {
//                 const links = Array.from(
//                     // eslint-disable-next-line no-undef
//                     document.querySelectorAll('.photoLink')
//                 ).map(link => `https:${link.getAttribute('href')}`);
//                 return links;
//             });

//             console.log('links', links);

//             await page.screenshot({ path: './test.png' });

//             await browser.close();
//             res.send('Success');
//         } catch (error) {
//             console.log('error puppet', error);
//         }
//     })
// );
