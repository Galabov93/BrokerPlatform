// Initializes the `real-estates` service on path `/real-estates`
const createService = require('feathers-sequelize');
const createModel = require('../../models/real-estates.model');
const hooks = require('./real-estates.hooks');

module.exports = function(app) {
    const Model = createModel(app);
    const paginate = app.get('paginate');

    const options = {
        Model,
        paginate,
    };

    // Initialize our service with any options it requires
    app.use('/real-estates', createService(options));

    // Get our initialized service so that we can register hooks
    const service = app.service('real-estates');

    service.hooks(hooks);
};
