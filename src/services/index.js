const realEstates = require('./real-estates/real-estates.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function(app) {
    app.configure(realEstates);
};
