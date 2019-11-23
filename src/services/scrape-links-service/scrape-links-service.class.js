/* eslint-disable quotes */
/* eslint-disable no-console */
const puppeteer = require('puppeteer');
const rp = require('request-promise');

const {
    getRealEstateImageLinks,
    getRealEstateNeighborhood,
    getRealEstateNameIds,
    getRealEstateType,
    getScraperConfiguration,
    getPriceInEuro,
    getOriginalCurrency,
    convertPriceStringToNumber,
} = require('./scraperHelpers');

/* eslint-disable no-unused-vars */
exports.ScrapeLinksService = class ScrapeLinksService {
    constructor(options) {
        this.options = options || {};
    }

    async find(params) {
        const linkToBeScraped = params.linkToBeScraped;

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

        const totalPriceInEuro = getPriceInEuro(totalPrice);
        const pricePerSquareMeterInEuro = getPriceInEuro(pricePerSquareMeter);

        const realEstateDescription = $('#description_div').text();

        const photosLinks = await getRealEstateImageLinks(
            puppeteer,
            linkToBeScraped
        );
        // await uploadImagesToS3Bucket(photosLinks, realEstateId);
        const photoIds = getRealEstateNameIds(photosLinks, realEstateId);
        const createdBy = 'Manata';

        return {
            real_estates_id: realEstateId,
            real_estates_sell_type: sellType,
            real_estates_construction_type: constructionType,
            real_estates_tec: tec,
            real_estate_construction_material: constructionMaterial || '-',
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
            real_estates_size: Number(squareFootageSize.split(' ')[0]),
            real_estates_floor: floor,
            real_estates_description: realEstateDescription,
            real_estates_imageNames: photoIds,
            real_estates_seller_phone_number: phoneNumber,
            real_estates_seller_features: commaSeparatedFeaturesText,
            real_estates_website_source: websiteSource,
            real_estates_created_by: createdBy,
        };
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
