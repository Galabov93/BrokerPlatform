/* eslint-disable no-console */
const puppeteer = require('puppeteer');
const { composeUrl } = require('./helpers');

/* eslint-disable no-unused-vars */
exports.GetPropertyLinks = class GetPropertyLinks {
    constructor(options) {
        this.options = options || {};
    }

    async find(params) {
        try {
            const browser = await puppeteer.launch({
                headless: false,
            });
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

            const totalPages = await page.evaluate(() => {
                return Number(
                    // eslint-disable-next-line no-undef
                    document
                        .querySelector('.pageNumbersInfo')
                        .innerHTML.split('от')[1]
                        .trim()
                );
            });

            let allLinks = [];

            for (let index = 1; index < 3; index++) {
                let currentPageUrl = composeUrl(page.url(), index);
                await page.goto(currentPageUrl, {
                    waitUntil: 'networkidle0',
                });

                const currentPageLinks = await page.evaluate(() => {
                    const links = Array.from(
                        // eslint-disable-next-line no-undef
                        document.querySelectorAll('.photoLink')
                    ).map(link => `https:${link.getAttribute('href')}`);
                    return links;
                });

                allLinks.push(...currentPageLinks);
            }

            await browser.close();
            return allLinks;
        } catch (error) {
            console.log('error puppet', error);
        }
    }

    async get(id, params) {
        return {
            id,
            text: `A new message with ID: ${id}!`,
        };
    }

    async create(data, params) {
        if (Array.isArray(data)) {
            return Promise.all(
                data.map(current => this.create(current, params))
            );
        }

        return data;
    }

    async update(id, data, params) {
        return data;
    }

    async patch(id, data, params) {
        return data;
    }

    async remove(id, params) {
        return { id };
    }
};
