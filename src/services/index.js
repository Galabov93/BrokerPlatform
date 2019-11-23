const realEstates = require('./real-estates/real-estates.service.js');
const users = require('./users/users.service.js');
const queryRealEstates = require('./query-real-estates/query-real-estates.service.js');
const getPropertyLinks = require('./get-property-links/get-property-links.service.js');
const scrapeLinksService = require('./scrape-links-service/scrape-links-service.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function(app) {
    app.configure(realEstates);
    app.configure(users);
    app.configure(queryRealEstates);
    app.configure(getPropertyLinks);
    app.configure(scrapeLinksService);
};
