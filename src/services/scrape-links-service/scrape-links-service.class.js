/* eslint-disable quotes */
/* eslint-disable no-console */
const rp = require('request-promise');

const {
    getRealEstateNeighborhood,
    getRealEstateType,
    getScraperConfiguration,
    getPriceInEuro,
    getOriginalCurrency,
    convertPriceStringToNumber,
    getRealEstateNameIds,
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

        // get main title
        const mainTitle = $('.imotData')
            .parent()
            .find('strong')
            .first()
            .text();

        const subtitle = $('.imotData')
            .parent()
            .find('span')
            .first()
            .text();

        const title = `${mainTitle},${subtitle}`;
        // get subtitle

        function getSellTtype(title) {
            if (title.toLowerCase().includes('продава')) {
                return 'sale';
            } else {
                return 'rent';
            }
        }

        const sellType = getSellTtype(title);

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

        let squareFootageSize = '',
            floor = '',
            phone = '',
            tec = '',
            constructionMaterial = '';

        const imotDetails = $('.imotData').children('li');
        imotDetails.each(index => {
            if (index % 2 === 0) {
                const typeKey = imotDetails.eq(index).text();
                const typeValue = imotDetails.eq(index + 1).text();
                if (typeKey.toLowerCase().includes('квадратура')) {
                    squareFootageSize = typeValue;
                }
                if (typeKey.toLowerCase().includes('етаж')) {
                    floor = typeValue;
                }
                if (typeKey.toLowerCase().includes('телефон')) {
                    phone = typeValue;
                }
                if (typeKey.toLowerCase().includes('тeц:')) {
                    console.log(
                        'TCL: ScrapeLinksService -> find -> typeKey',
                        typeKey
                    );
                    tec = typeValue;
                }
                if (typeKey.toLowerCase().includes('строителство')) {
                    constructionMaterial = typeValue;
                }
            }
        });

        const phoneNumber = $('.phone')
            .text()
            .trim();

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

        const thumbLinks = $('.thmbsLi img').toArray();
        const photoIds = getRealEstateNameIds(thumbLinks);
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
            real_estates_seller_features: commaSeparatedFeaturesText.trim(),
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
