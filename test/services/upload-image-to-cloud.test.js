const app = require('../../src/app');

describe('\'upload-image-to-cloud\' service', () => {
  it('registered the service', () => {
    const service = app.service('upload-image-to-cloud');
    expect(service).toBeTruthy();
  });
});
