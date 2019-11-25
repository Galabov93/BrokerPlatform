// Initializes the `scrape-images-from-url` service on path `/scrape-images-from-url`
const { ScrapeImagesFromUrl } = require('./scrape-images-from-url.class');
const hooks = require('./scrape-images-from-url.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/scrape-images-from-url', new ScrapeImagesFromUrl(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('scrape-images-from-url');

  service.hooks(hooks);
};
