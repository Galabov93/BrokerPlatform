// Initializes the `query-real-estates` service on path `/query-real-estates`
const createService = require('./query-real-estates.class.js');
const hooks = require('./query-real-estates.hooks');

module.exports = function(app) {
    const paginate = app.get('paginate');

    const options = {
        app,
        paginate,
    };

    // Initialize our service with any options it requires
    app.use('/query-real-estates', createService(options));

    // Get our initialized service so that we can register hooks
    const service = app.service('query-real-estates');

    service.hooks(hooks);
};
