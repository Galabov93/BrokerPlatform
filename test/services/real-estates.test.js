const app = require('../../src/app');

describe('\'real-estates\' service', () => {
  it('registered the service', () => {
    const service = app.service('real-estates');
    expect(service).toBeTruthy();
  });
});
