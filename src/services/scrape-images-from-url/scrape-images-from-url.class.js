/* eslint-disable no-unused-vars */

const rp = require('request-promise');

const {
    getScraperConfiguration,
} = require('../scrape-links-service/scraperHelpers');
exports.ScrapeImagesFromUrl = class ScrapeImagesFromUrl {
    constructor(options) {
        this.options = options || {};
    }

    async create(data, params) {
        // get url
        const { linkToBeScraped } = data;

        const scraperOptions = getScraperConfiguration(linkToBeScraped);
        const $ = await rp(scraperOptions);

        let arr = [];
        $('#pictures_moving')
            .children('a')
            .find('img')
            .each(index => {
                const photoSrc = $('#pictures_moving')
                    .children('a')
                    .find('img')
                    .eq(index)
                    .attr('src');

                const bigPhoto = photoSrc.includes('small')
                    ? photoSrc.replace('small', 'big')
                    : photoSrc.includes('med')
                    ? photoSrc.replace('med', 'big')
                    : photoSrc;

                arr.push(`https:${bigPhoto}`);
            });
        return arr;
    }
};
