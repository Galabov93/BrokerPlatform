const realEstates = require('./real-estates/real-estates.service.js');
const users = require('./users/users.service.js');
const queryRealEstates = require('./query-real-estates/query-real-estates.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function(app) {
    app.configure(realEstates);
    app.configure(users);
    app.configure(queryRealEstates);
};
