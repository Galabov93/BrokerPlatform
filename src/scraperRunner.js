async function scrapeRealEstates(app, filterNumber) {
    try {
        const linksForScraping = await app
            .service('get-property-links')
            .find({ filterNumber });

        for (let index = 0; index < linksForScraping.length; index++) {
            try {
                const linkToBeScraped = linksForScraping[index];

                //get data
                const propertyData = await app
                    .service('scrape-links-service')
                    .find({
                        linkToBeScraped,
                    });

                await app.service('real-estates').create(propertyData); // upload to DB

                const images = await app
                    .service('scrape-images-from-url')
                    .create({
                        linkToBeScraped,
                    });

                await app.service('upload-image-to-cloud').uploadAllImages({
                    links: images,
                    realEstateId: propertyData.real_estates_id,
                });
            } catch (e) {
                console.log('Error in property creation', e.message);
            }
        }

        console.log('Succesful scraping');
    } catch (error) {
        console.error('Error scraping individual page', error);
    }
}

module.exports = scrapeRealEstates;
