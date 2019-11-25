// Initializes the `upload-image-to-cloud` service on path `/upload-image-to-cloud`
const { UploadImageToCloud } = require('./upload-image-to-cloud.class');
const hooks = require('./upload-image-to-cloud.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/upload-image-to-cloud', new UploadImageToCloud(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('upload-image-to-cloud');

  service.hooks(hooks);
};
