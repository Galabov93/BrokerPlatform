// Initializes the `get-property-links` service on path `/get-property-links`
const { GetPropertyLinks } = require('./get-property-links.class');
const hooks = require('./get-property-links.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/get-property-links', new GetPropertyLinks(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('get-property-links');

  service.hooks(hooks);
};
