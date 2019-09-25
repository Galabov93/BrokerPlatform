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
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2c156544901411455&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2c156751853870763&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2c156682201473131&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2c156864576256791&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2d156897581885400&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2d156869949814193&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2d156862487090849&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2d156675956118638&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2d156879162951646&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2h154823736720085&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2h153994587637584&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2h155922434929591&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2h156397757079571&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2k156820114792554&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2m155941819522603&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2m156689384668590&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156820824079225&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156858567634282&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a155815870920769&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156388883718689&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156878704466899&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156819205260566&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156743098200519&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156893116720842&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156909176257364&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156810139004916&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156699145723420&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156707356895254&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156777254669016&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156733569430660&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156892477616608&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156741498740009&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156808107708048&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156914438072932&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156836155446144&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156817024394545&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156887157903241&slink=4uycmp&f1=1',
    'https://www.imot.bg/pcgi/imot.cgi?act=5&adv=2a156280122143766&slink=4uycmp&f1=1',
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

    const city = title.split(',')[1];
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

    const totalPrice = $('#cena').text();
    const pricePerSquareMeter = $('#cenakv').text();

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
        function convert(originalCurrencyPrice) {
            // Using replace() method
            // to make currency string suitable
            // for parseFloat() to convert
            const temp = originalCurrencyPrice.replace(/[^0-9.-]+/g, '');

            // Converting string to float
            // or double and return
            return parseFloat(temp);
        }

        if (
            getOriginalCurrency(originalCurrencyPrice) ===
            possibleCurrencies.euro
        ) {
            return convert(originalCurrencyPrice);
        } else if (
            getOriginalCurrency(originalCurrencyPrice) ===
            possibleCurrencies.leva
        ) {
            return convert(originalCurrencyPrice) * 2;
        }
    }

    const totalPriceInEuro = getPriceInEuro(totalPrice);
    const pricePerSquareMeterInEuro = getPriceInEuro(pricePerSquareMeter);

    const realEstateDescription = $('#description_div').text();

    // await uploadImagesToS3Bucket(photosLinks, realEstateId);
    const photoIds = getRealEstateNameIds(photosLinks, realEstateId);
    const createdBy = 'Manata';

    return {
        real_estates_id: realEstateId,
        real_estates_sell_type: sellType,
        real_estates_construction_type: constructionType,
        real_estates_tec: tec,
        real_estates_phone: phone,
        real_estates_title: title,
        real_estates_neighborhood: neighborhood,
        real_estates_city: city,
        real_estates_address: address,
        real_estates_original_price: totalPrice,
        real_estates_price_in_euro: totalPriceInEuro,
        real_estates_currency: getOriginalCurrency(totalPrice),
        real_estates_price_per_square: pricePerSquareMeter,
        real_estates_price_per_square_in_euro: pricePerSquareMeterInEuro,
        real_estates_size: squareFootageSize,
        real_estates_floor: floor,
        real_estates_description: realEstateDescription,
        real_estates_imageNames: 'imageg1,image2,image3',
        real_estates_seller_phone_number: phoneNumber,
        real_estates_seller_features: commaSeparatedFeaturesText,
        real_estates_website_source: websiteSource,
        real_estates_created_by: createdBy,
    };
}

async function postDataToDb(dataObject) {
    const sequelize = app.get('sequelizeClient');
    const { real_estates } = sequelize.models;

    try {
        await real_estates.create(dataObject);
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
            for (let index = 0; index < 10; index++) {
                // const element = array[index];

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
