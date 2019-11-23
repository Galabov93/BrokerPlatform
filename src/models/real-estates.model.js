// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
    const sequelizeClient = app.get('sequelizeClient');
    const realEstates = sequelizeClient.define(
        'real_estates',
        {
            real_estates_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            real_estates_sell_type: {
                // rent or by
                type: DataTypes.STRING,
                allowNull: false,
            },
            real_estates_construction_type: {
                // 1-Стаен, 2-стаен и т.н
                type: DataTypes.STRING,
                allowNull: false,
            },
            real_estates_title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            real_estates_neighborhood: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            real_estates_city: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            real_estates_address: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            real_estates_original_price: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            real_estates_price_in_euro: {
                // will be used for filtering
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            real_estates_currency: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            real_estates_price_per_square: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            real_estates_price_per_square_in_euro: {
                // will be used for filtering
                type: DataTypes.DOUBLE,
                allowNull: false,
            },
            real_estates_size: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            real_estates_floor: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            real_estates_tec: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            real_estate_construction_material: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            real_estates_phone: {
                // is there phone or not
                type: DataTypes.STRING,
                allowNull: false,
            },
            real_estates_description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            real_estates_imageNames: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            real_estates_seller_phone_number: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            real_estates_seller_features: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            real_estates_created_by: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            real_estates_website_source: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            hooks: {
                beforeCount(options) {
                    options.raw = true;
                },
            },
        }
    );

    // eslint-disable-next-line no-unused-vars
    realEstates.associate = function(models) {
        // Define associations here
        // See http://docs.sequelizejs.com/en/latest/docs/associations/
    };

    return realEstates;
};
