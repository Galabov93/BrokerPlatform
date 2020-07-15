const { authenticate } = require('@feathersjs/authentication').hooks;

module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [
            function (context) {
                const usersModel = context.app.services.users.Model;
                const realEstatesModel =
                    context.app.services['real-estates'].Model;

                context.params.sequelize = {
                    attributes: ['id', 'text', 'createdAt'],
                    through: {
                        attributes: [],
                    },

                    include: [
                        {
                            model: usersModel,
                            attributes: ['email', 'id'],
                        },
                        {
                            model: realEstatesModel,
                            attributes: ['real_estates_id', 'id'],
                        },
                    ],
                };

                return context;
            },
        ],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: [],
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [
            function (context) {
                const email = context.params.user.email;

                context.result['user.email'] = email;

                return context;
            },
        ],
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
