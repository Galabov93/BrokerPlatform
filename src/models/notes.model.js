// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
    const sequelizeClient = app.get('sequelizeClient');
    const notes = sequelizeClient.define(
        'notes',
        {
            text: {
                type: DataTypes.STRING,
                allowNull: false,
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
    notes.associate = function (models) {
        const { users, real_estates } = models;
        notes.belongsTo(real_estates);
        notes.belongsTo(users);
        // Define associations here
        // See http://docs.sequelizejs.com/en/latest/docs/associations/
    };

    return notes;
};
