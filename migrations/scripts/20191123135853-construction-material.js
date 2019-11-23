module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.addColumn(
                    'real_estates',
                    'real_estate_construction_material',
                    {
                        type: Sequelize.STRING,
                    },
                    { transaction: t }
                ),
            ]);
        });
    },

    down: queryInterface => {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
                queryInterface.removeColumn(
                    'real_estates',
                    'real_estate_construction_material',
                    {
                        transaction: t,
                    }
                ),
            ]);
        });
    },
};
