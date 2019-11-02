/* eslint-disable no-unused-vars */
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
        // constructionType,
        // neighbourhoods,
        // priceFrom,
        // priceTo,
        // sizeFrom,
        // sizeTo

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

        function getFiltersWhereIn(query, propertyName, databaseColumnName) {
            if (!query[propertyName]) {
                return {};
            } else {
                return {
                    databaseColumnName: {
                        [Op.in]: formatDataFromReactSelect(query[propertyName]),
                    },
                };
            }
        }

        function getFiltersWhereBetween(
            query,
            propertyName,
            databaseColumnName
        ) {
            const fromValue = query[`from${propertyName}`] || 0;
            const toValue = query[`to${propertyName}`] || 0;
            if (!toValue) {
                return {};
            } else {
            }
        }

        const sellTypeFilter = getRealEstatesSellType(query);
        const neighbourhoodsFilter = getFiltersWhereIn(
            query,
            'neighbourhoods',
            'real_estates_neighborhood'
        );
        const constructionTypeFilter = getFiltersWhereIn(
            query,
            'constructionType',
            'real_estates_construction_type'
        );

        const filteredData = await real_estates.findAll({
            where: {
                ...sellTypeFilter,
                ...constructionTypeFilter,
                ...neighbourhoodsFilter,
                real_estates_price_in_euro: {
                    [Op.between]: [0, 500],
                },
                real_estates_size: {
                    [Op.between]: [0, 100],
                },
                // real_estates_construction_type: {},
                // real_estates_seller_features
            },
        });

        return filteredData;
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
