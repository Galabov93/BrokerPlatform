const app = require('../../src/app');

describe('\'query-real-estates\' service', () => {
  it('registered the service', () => {
    const service = app.service('query-real-estates');
    expect(service).toBeTruthy();
  });
});
