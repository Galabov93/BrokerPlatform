/* eslint-disable no-unused-vars */
const Sequelize = require('sequelize');

class Service {
    constructor(options) {
        this.options = options || {};
        this.app = this.options.app;
    }

    async find(params) {
        const sequelize = this.app.get('sequelizeClient');
        const { real_estates } = sequelize.models;
        const Op = Sequelize.Op;

        const filteredData = await real_estates.findAll({
            where: {
                real_estates_sell_type: {
                    [Op.eq]: 'rent',
                },
                real_estates_price_in_euro: {
                    [Op.between]: [0, 500],
                },
                real_estates_neighborhood: {
                    [Op.in]: ['Младост 2'],
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
