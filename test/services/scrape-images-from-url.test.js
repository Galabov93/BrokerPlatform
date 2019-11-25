const app = require('../../src/app');

describe('\'scrape-images-from-url\' service', () => {
  it('registered the service', () => {
    const service = app.service('scrape-images-from-url');
    expect(service).toBeTruthy();
  });
});
