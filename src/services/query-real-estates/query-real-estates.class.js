/* eslint-disable */
const Sequelize = require('sequelize');

function formatDataFromReactSelect(dataArray) {
    return dataArray.map(object => JSON.parse(object).value);
}

class Service {
    constructor(options) {
        this.options = options || {};
        this.app = this.options.app;
    }

    async find(params) {
        const { query } = params;
        const sequelize = this.app.get('sequelizeClient');
        const { real_estates } = sequelize.models;
        const Op = Sequelize.Op;

        function getRealEstatesSellType(query) {
            if (!query.propertySellType) {
                return {};
            } else {
                return {
                    real_estates_sell_type: {
                        [Op.eq]: query.propertySellType,
                    },
                };
            }
        }

        function getNeighbourhoodFilter(query, propertyName) {
            if (!query[propertyName]) {
                return {};
            } else {
                return {
                    real_estates_neighborhood: {
                        [Op.in]: formatDataFromReactSelect(query[propertyName]),
                    },
                };
            }
        }

        function getConstructionTypeFilter(query, propertyName) {
            if (!query[propertyName]) {
                return {};
            } else {
                return {
                    real_estates_construction_type: {
                        [Op.in]: formatDataFromReactSelect(query[propertyName]),
                    },
                };
            }
        }

        function getPriceFilter(query) {
            const fromValue = Number(query.priceFrom) || 0;
            const toValue = Number(query.priceTo) || 0;

            if (!toValue) {
                return {};
            } else {
                return {
                    real_estates_price_in_euro: {
                        [Op.between]: [fromValue, toValue],
                    },
                };
            }
        }

        function getSizeFilter(query) {
            const fromValue = Number(query.sizeFrom) || 0;
            const toValue = Number(query.sizeTo) || 0;

            if (!toValue) {
                return {};
            } else {
                return {
                    real_estates_size: {
                        [Op.between]: [fromValue, toValue],
                    },
                };
            }
        }

        const sizeFilter = getPriceFilter(query);
        const priceFilter = getSizeFilter(query);
        const sellTypeFilter = getRealEstatesSellType(query);
        const neighbourhoodsFilter = getNeighbourhoodFilter(
            query,
            'neighbourhoods'
        );
        const constructionTypeFilter = getConstructionTypeFilter(
            query,
            'constructionType'
        );

        const { count, rows } = await real_estates.findAndCountAll({
            limit: Number(query.limit),
            offset: Number(query.offset),
            where: {
                ...sellTypeFilter,
                ...constructionTypeFilter,
                ...neighbourhoodsFilter,
                ...priceFilter,
                ...sizeFilter,
            },
        });

        return { count, rows };
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
}

module.exports = function(options) {
    return new Service(options);
};

module.exports.Service = Service;
