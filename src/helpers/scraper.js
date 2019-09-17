/* eslint-disable no-console */
const Axios = require('axios');
const aws = require('aws-sdk');

async function getImageFrom(url) {
    const response = await Axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer',
    });
    return response.data;
}

async function saveImageToS3Bucket(url, newFolder = '', filename = 'newImage') {
    console.log('TCL: functionsaveImageToS3Bucket -> url', url);
    const image = await getImageFrom(url);
    const s3 = new aws.S3();
    var params = {
        Bucket: process.env.AMAZON_S3_BUCKET_NAME,
        Key: `${newFolder}/${filename}`,
        Body: image,
    };
    var putObjectPromise = s3.putObject(params).promise();
    putObjectPromise
        .then(function() {
            // eslint-disable-next-line no-console
            console.log('Success uploading photo to S3');
        })
        .catch(function(err) {
            console.log(err);
        });
}

async function getRealEstateImageLinks(puppeteer, linkToBeScraped) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(linkToBeScraped, {
        waitUntil: 'networkidle0',
    });

    const links = await page.evaluate(() => {
        // eslint-disable-next-line no-undef
        let thumbsLinks = document.querySelectorAll('.thmbsLi a');
        let arr = [];
        for (let index = 0; index < thumbsLinks.length; index++) {
            let thumbAndBigPhotoPair = { thumbPhoto: '', bigPhoto: '' };
            // eslint-disable-next-line no-undef
            const thumbPhoto = document
                .querySelector(`#small_pic_${index}`)
                .getAttribute('src');
            const bigPhoto = thumbPhoto.replace('small', 'big');

            thumbAndBigPhotoPair.thumbPhoto = `https:${thumbPhoto}`;
            thumbAndBigPhotoPair.bigPhoto = `https:${bigPhoto}`;

            arr.push(thumbAndBigPhotoPair);
        }
        return arr;
    });

    await browser.close();

    return links;
}

/**
 * @param links[] - array of objects with the image https links
 * @param links[index].thumbPhoto - url link to thumb photo
 * @param links[index].bigPhoto - url link to bigPhoto
 */
async function uploadImagesToS3Bucket(links, realEstateId) {
    // link
    for (let index = 0; index < links.length; index++) {
        const imageLinks = links[index];
        console.log(
            'TCL: functionuploadImagesToS3Bucket -> imageLinks',
            imageLinks
        );

        const imageName = getImageName(imageLinks.thumbPhoto);
        if (index === 0) {
            await saveImageToS3Bucket(
                imageLinks.thumbPhoto,
                `${realEstateId}/thumbPhotos`,
                imageName
            );
            await saveImageToS3Bucket(
                imageLinks.bigPhoto,
                `${realEstateId}/bigPhotos`,
                imageName
            );
        }
    }
}

function getImageName(link) {
    return link
        .split('/')
        .pop()
        .split('.')[0];
}

const getRealEstateType = title => {
    const realEstateTypes = [
        'СТАЯ',
        '1-СТАЕН',
        '2-СТАЕН',
        '3-СТАЕН',
        '4-СТАЕН',
        'МНОГОСТАЕН',
        'МЕЗОНЕТ',
        'АТЕЛИЕ, ТАВАН',
        'ОФИС',
        'МАГАЗИН',
        'ЗАВЕДЕНИЕ',
        'СКЛАД',
        'ХОТЕЛ',
        'ПРОМ. ПОМЕЩЕНИЕ',
        'ЕТАЖ ОТ КЪЩА',
        'КЪЩА',
        'ВИЛА',
        'МЯСТО',
        'ГАРАЖ',
        'ЗЕМЕДЕЛСКА ЗЕМЯ',
    ];

    let result = null;
    realEstateTypes.forEach(element => {
        if (title.includes(element)) {
            result = element;
        }
    });
    return result;
};

module.exports = {
    getImageFrom,
    saveImageToS3Bucket,
    getRealEstateImageLinks,
    uploadImagesToS3Bucket,
    getImageName,
    getRealEstateType,
};
