const { Forbidden } = require('@feathersjs/errors');

const isIdUnique = async (realEstatesTable, real_estates_id) => {
    const token = await realEstatesTable.findOne({
        where: { real_estates_id },
    });
    return token !== null ? false : true;
};

module.exports = {
    before: {
        all: [],
        find: [],
        get: [],
        create: [
            // check if id is already in the database
            async context => {
                const sequelize = context.app.get('sequelizeClient');
                const { real_estates } = sequelize.models;
                const { real_estates_id } = context.data;
                if (!(await isIdUnique(real_estates, real_estates_id))) {
                    throw new Forbidden(
                        'This real estate is already in the database'
                    );
                }
            },
        ],
        update: [],
        patch: [],
        remove: [],
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: [],
    },

    error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: [],
    },
};
