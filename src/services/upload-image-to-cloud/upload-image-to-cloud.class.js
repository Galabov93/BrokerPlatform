/* eslint-disable no-unused-vars */
const Axios = require('axios');
const aws = require('aws-sdk');

exports.UploadImageToCloud = class UploadImageToCloud {
    constructor(options) {
        this.options = options || {};
    }

    async uploadAllImages(data, params) {
        const { links, realEstateId } = data;
        for (let index = 0; index < links.length; index++) {
            const imageLink = links[index];

            const imageName = getImageName(imageLink);

            await this.create({
                url: imageLink,
                folderName: `${realEstateId}/bigPhotos`,
                filename: imageName,
            });
        }
    }

    async create(data, params) {
        const { url, folderName, filename } = data;
        const image = await getImageFrom(url);
        const s3 = new aws.S3();
        const s3Params = {
            Bucket: process.env.AMAZON_S3_BUCKET_NAME,
            Key: `${folderName}/${filename}`,
            Body: image,
        };
        const putObjectPromise = s3.putObject(s3Params).promise();
        putObjectPromise
            .then(function() {
                // eslint-disable-next-line no-console
                console.log('Success uploading photo to S3');
            })
            .catch(function(err) {
                // eslint-disable-next-line no-console
                console.log(err);
            });
    }
};

async function getImageFrom(url) {
    const response = await Axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer',
    });
    return response.data;
}

function getImageName(link) {
    return link
        .split('/')
        .pop()
        .split('.')[0];
}
