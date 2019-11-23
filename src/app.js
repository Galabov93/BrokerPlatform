/* eslint-disable quotes */
/* eslint-disable no-console */
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

const puppeteer = require('puppeteer');
const rp = require('request-promise');
const cheerio = require('cheerio');
const Buffer = require('buffer').Buffer;
const iconv = require('iconv');
const sequelize = require('./sequelize');

const authentication = require('./authentication');
require('./config/aws');

const app = express(feathers());
const {
    getRealEstateImageLinks,
    uploadImagesToS3Bucket,
    getRealEstateNeighborhood,
    getRealEstateNameIds,
    getRealEstateType,
} = require('./helpers/scraper');

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

const testLinks = [
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=1b157443558385309',
];

function getScraperConfiguration(linkToBeScraped) {
    return {
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
}

function convertPriceStringToNumber(originalCurrencyPrice) {
    const temp = originalCurrencyPrice.replace(/[^0-9.-]+/g, '');
    return parseFloat(temp);
}

async function getScrapedData(linkToBeScraped) {
    const photosLinks = await getRealEstateImageLinks(
        puppeteer,
        linkToBeScraped
    );
    const scraperOptions = getScraperConfiguration(linkToBeScraped);
    const $ = await rp(scraperOptions);

    const realEstateId = linkToBeScraped
        .split('&')
        .find(element => element.includes('adv'))
        .split('=')[1];

    const title = $('form')
        .attr('name', 'search')
        .children('table')
        .first()
        .find('h1')
        .text();

    const sellType = 'rent';
    const constructionType = getRealEstateType(title);
    const neighborhood = getRealEstateNeighborhood(title);

    const city = title
        .split(',')[1]
        .replace('град', '')
        .trim();
    const address = $('h2:contains("Местоположение")')
        .find('b')
        .text();

    const websiteSource = 'imot.bg';

    // eslint-disable-next-line quotes
    const squareFootageSize = $("td:contains('Квадратура')")
        .last()
        .next()
        .children()
        .text();

    // eslint-disable-next-line quotes
    const floor = $("td:contains('Етаж')")
        .last()
        .next()
        .children()
        .text();

    // eslint-disable-next-line quotes
    const phone = $("td:contains('Телефон')")
        .last()
        .next()
        .children()
        .text();

    // boolean tec
    // eslint-disable-next-line quotes
    const tec = $("td:contains('ТEЦ:')")
        .last()
        .next()
        .children()
        .text();

    const constructionMaterial = $("td:contains('Вид строителство:')")
        .last()
        .next()
        .children()
        .text();

    const phoneNumber = $("strong:contains('За контакти:')")
        .next()
        .next()
        .text();

    let commaSeparatedFeaturesText = '';
    const featuresDivs = $("div:contains('Особености:')")
        .last()
        .next()
        .children()
        .children()
        .children()
        .children();
    featuresDivs.each(function(index) {
        if (index !== featuresDivs.length - 1) {
            commaSeparatedFeaturesText += `${$(this)
                .text()
                .replace('\u2022', '')},`;
        } else {
            commaSeparatedFeaturesText += `${$(this)
                .text()
                .replace('\u2022', '')}`;
        }
    });

    const totalPrice = $('#cena')
        .text()
        .trim();
    const pricePerSquareMeter = $('#cenakv')
        .text()
        .trim();

    const possibleCurrencies = {
        euro: 'EUR',
        leva: 'BGN',
        dollar: 'USD',
    };

    function getOriginalCurrency(originalCurrencyPrice) {
        if (originalCurrencyPrice.includes('лв')) {
            return possibleCurrencies.leva;
        } else if (originalCurrencyPrice.includes('EUR')) {
            return possibleCurrencies.euro;
        } else {
            return possibleCurrencies.dollar;
        }
    }

    function getPriceInEuro(originalCurrencyPrice) {
        if (
            getOriginalCurrency(originalCurrencyPrice) ===
            possibleCurrencies.euro
        ) {
            return convertPriceStringToNumber(originalCurrencyPrice);
        } else if (
            getOriginalCurrency(originalCurrencyPrice) ===
            possibleCurrencies.leva
        ) {
            return convertPriceStringToNumber(originalCurrencyPrice) * 2;
        }
    }

    const totalPriceInEuro = getPriceInEuro(totalPrice);
    const pricePerSquareMeterInEuro = getPriceInEuro(pricePerSquareMeter);

    const realEstateDescription = $('#description_div').text();

    await uploadImagesToS3Bucket(photosLinks, realEstateId);
    const photoIds = getRealEstateNameIds(photosLinks, realEstateId);
    console.log('TCL: getScrapedData -> photoIds', photoIds);
    const createdBy = 'Manata';

    return {
        real_estates_id: realEstateId,
        real_estates_sell_type: sellType,
        real_estates_construction_type: constructionType,
        real_estates_tec: tec,
        real_estate_construction_material: constructionMaterial,
        real_estates_phone: phone,
        real_estates_title: title,
        real_estates_neighborhood: neighborhood,
        real_estates_city: city,
        real_estates_address: address,
        real_estates_original_price: convertPriceStringToNumber(totalPrice),
        real_estates_price_in_euro: totalPriceInEuro,
        real_estates_currency: getOriginalCurrency(totalPrice),
        real_estates_price_per_square: pricePerSquareMeter,
        real_estates_price_per_square_in_euro: pricePerSquareMeterInEuro,
        real_estates_size: squareFootageSize,
        real_estates_floor: floor,
        real_estates_description: realEstateDescription,
        real_estates_imageNames: photoIds,
        real_estates_seller_phone_number: phoneNumber,
        real_estates_seller_features: commaSeparatedFeaturesText,
        real_estates_website_source: websiteSource,
        real_estates_created_by: createdBy,
    };
}

async function postDataToDb(dataObject) {
    try {
        const response = await app.service('real-estates').create(dataObject);
        console.log('TCL: postDataToDb -> response', response);
        console.log('Success updating database');
    } catch (e) {
        console.log('Error creating record', e);
    }
}

app.get(
    '/testScraper',
    asyncMiddleware(async (req, res) => {
        try {
            //event emitter --> run function on get new links
            for (let index = 0; index < testLinks.length; index++) {
                const linkToBeScraped = testLinks[index];

                const realEstateData = await getScrapedData(linkToBeScraped);

                await postDataToDb(realEstateData);
            }

            res.send('Success');
        } catch (error) {
            console.error('Error scraping individual page', error);
        }
    })
);

app.get(
    '/loginAndGetLinks',
    asyncMiddleware(async (req, res) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            // we want to login to this page using credentials
            await page.goto(process.env.CANDY_SIGN_IN_URL, {
                waitUntil: 'networkidle0',
            });

            await page.waitForSelector('.vhodOptions input:first-of-type');

            await page.evaluate(() => {
                // eslint-disable-next-line no-undef
                document
                    .querySelector('.vhodOptions input:first-of-type')
                    .click();
            });

            await page.waitFor('input[name="usr"]');
            await page.type('input[name="usr"]', process.env.CANDY_USERNAME);

            await page.waitFor('input[name="pwd"]');
            await page.type('input[name="pwd"]', process.env.CANDY_PASSWORD);

            await Promise.all([
                page.click('.loginButton'),
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
            ]);

            await page.goto(process.env.CANDY_CUSTOM_FILTERS, {
                waitUntil: 'networkidle0',
            });

            await Promise.all([
                page.click('.startFilter'),
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
            ]);

            const links = await page.evaluate(() => {
                const links = Array.from(
                    // eslint-disable-next-line no-undef
                    document.querySelectorAll('.photoLink')
                ).map(link => `https:${link.getAttribute('href')}`);
                return links;
            });

            // event emitter emit new links arrived
            console.log('links', links);

            await page.screenshot({ path: './test.png' });

            await browser.close();
            res.send('Success');
        } catch (error) {
            console.log('error puppet', error);
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
