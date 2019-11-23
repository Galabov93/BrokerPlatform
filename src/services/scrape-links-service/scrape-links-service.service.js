// Initializes the `scrape-links-service` service on path `/scrape-links-service`
const { ScrapeLinksService } = require('./scrape-links-service.class');
const hooks = require('./scrape-links-service.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/scrape-links-service', new ScrapeLinksService(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('scrape-links-service');

  service.hooks(hooks);
};
