/* eslint-disable no-unused-vars */

const puppeteer = require('puppeteer');

exports.ScrapeImagesFromUrl = class ScrapeImagesFromUrl {
    constructor(options) {
        this.options = options || {};
    }

    async create(data, params) {
        // get url
        const { linkToBeScraped } = data;

        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            await page.goto(linkToBeScraped, {
                waitUntil: 'networkidle0',
            });

            const links = await page.evaluate(() => {
                // eslint-disable-next-line no-undef
                let thumbsLinks = document.querySelectorAll('.thmbsLi a'); //select image links
                let arr = [];
                for (let index = 0; index < thumbsLinks.length; index++) {
                    // eslint-disable-next-line no-undef
                    const photoSrc = document
                        .querySelector(`#small_pic_${index}`)
                        .getAttribute('src');

                    //big photos are just with a different folder structure

                    const bigPhoto = photoSrc.includes('small')
                        ? photoSrc.replace('small', 'big')
                        : photoSrc.includes('med')
                        ? photoSrc.replace('med', 'big')
                        : photoSrc;

                    arr.push(`https:${bigPhoto}`);
                }
                return arr;
            });

            await browser.close();

            return links;
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Error getting puppeteer images', e);
        }

        return data;
    }
};
