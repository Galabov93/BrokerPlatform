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
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(linkToBeScraped, {
            waitUntil: 'networkidle0',
        });

        const links = await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            let thumbsLinks = document.querySelectorAll('.thmbsLi a'); //select image links
            let arr = [];
            for (let index = 0; index < thumbsLinks.length; index++) {
                let thumbAndBigPhotoPair = { thumbPhoto: '', bigPhoto: '' };
                // eslint-disable-next-line no-undef
                const thumbPhoto = document
                    .querySelector(`#small_pic_${index}`)
                    .getAttribute('src');

                //big photos are just with a different folder structure
                const bigPhoto = thumbPhoto.replace('small', 'big');

                thumbAndBigPhotoPair.thumbPhoto = `https:${thumbPhoto}`;
                thumbAndBigPhotoPair.bigPhoto = `https:${bigPhoto}`;

                arr.push(thumbAndBigPhotoPair);
            }
            return arr;
        });

        await browser.close();

        return links;
    } catch (e) {
        console.error('Error getting puppeteer images', e);
    }
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

        const imageName = getImageName(imageLinks.thumbPhoto);
        // if (index === 0) {
        await saveImageToS3Bucket(
            imageLinks.thumbPhoto,
            s3ImageFolderPath('thumb', realEstateId),
            imageName
        );
        await saveImageToS3Bucket(
            imageLinks.bigPhoto,
            s3ImageFolderPath('big', realEstateId),
            imageName
        );
        // }
    }
}

async function getRealEstateNameIds(links, realEstateId) {
    // thumbPhotos and bigPhotos
    const photoIds = { thumbPhotos: '', bigPhotos: '' };
    for (let index = 0; index < links.length; index++) {
        const imageLinks = links[index];

        const imageName = getImageName(imageLinks.thumbPhoto);
        if (index !== links.length) {
            photoIds.thumbPhotos += `${realEstateId}/thumbPhotos/${imageName},`;
            photoIds.bigPhotos += `${realEstateId}/bigPhotos/${imageName},`;
        } else {
            photoIds.thumbPhotos += `${realEstateId}/thumbPhotos/${imageName}`;
            photoIds.bigPhotos += `${realEstateId}/bigPhotos/${imageName}`;
        }
    }

    return photoIds;
}

const getRealEstateNeighborhood = title => {
    const neighborhoods = [
        '7-ми 11-ти километър',
        'Абдовица',
        'Банишора',
        'Белите брези',
        'Бенковски',
        'Борово',
        'Ботунец',
        'Бояна',
        'Бусманци',
        'Бъкстон',
        'Вердикал',
        'Видните',
        'Витоша',
        'Военна рампа',
        'Враждебна',
        'Връбница 1',
        'Връбница 2',
        'Гевгелийски',
        'Гео Милев',
        'Гниляне',
        'Горна баня',
        'Горубляне',
        'Гоце Делчев',
        'Градина',
        'Градоман',
        'Дианабад',
        'Димитър Миленков',
        'Докторски паметник',
        'Драгалевци',
        'Дружба 1',
        'Дружба 2',
        'Дървеница',
        'Западен парк',
        'Захарна фабрика',
        'Зона Б-18',
        'Зона Б-19',
        'Зона Б-5',
        'Зона Б-5-3',
        'Иван Вазов',
        'Изгрев',
        'Изток',
        'Илинден',
        'Илиянци',
        'Карпузица',
        'Княжево',
        'Красна поляна 1',
        'Красна поляна 2',
        'Красна поляна 3',
        'Красно село',
        'Кремиковци',
        'Кръстова вада',
        'Кубратово',
        'Кумарица',
        'Курило',
        'Лагера',
        'Левски',
        'Левски В',
        'Левски Г',
        'Летище София',
        'Лозенец',
        'Люлин - център',
        'Люлин 1',
        'Люлин 10',
        'Люлин 2',
        'Люлин 3',
        'Люлин 4',
        'Люлин 5',
        'Люлин 6',
        'Люлин 7',
        'Люлин 8',
        'Люлин 9',
        'Малашевци',
        'Малинова долина',
        'Манастирски ливади',
        'Медицинска академия',
        'Михайлово',
        'Младост 1',
        'Младост 1А',
        'Младост 2',
        'Младост 3',
        'Младост 4',
        'Модерно предградие',
        'Мусагеница',
        'НПЗ Дианабад',
        'НПЗ Изток',
        'НПЗ Искър',
        'НПЗ Средец',
        'НПЗ Хаджи Димитър',
        'Надежда 1',
        'Надежда 2',
        'Надежда 3',
        'Надежда 4',
        'Негован',
        'Обеля',
        'Обеля 1',
        'Обеля 2',
        'Оборище',
        'Овча купел',
        'Овча купел 1',
        'Овча купел 2',
        'Орландовци',
        'ПЗ Илиянци',
        'ПЗ Хладилника',
        'Павлово',
        'Подуяне',
        'Полигона',
        'Разсадника',
        'Редута',
        'Република',
        'Република 2',
        'СПЗ Модерно предградие',
        'СПЗ Слатина',
        'Света Троица',
        'Свети Стефан',
        'Световрачене',
        'Свобода',
        'Сердика',
        'Сеславци',
        'Симеоново',
        'Славия',
        'Славовци',
        'Слатина',
        'Стрелбище',
        'Студентски град',
        'Сухата река',
        'Суходол',
        'Толстой',
        'Требич',
        'Триъгълника',
        'Факултета',
        'Филиповци',
        'Фондови жилища',
        'Хаджи Димитър',
        'Хиподрума',
        'Хладилника',
        'Христо Ботев',
        'Център',
        'Челопечене',
        'Чепинци',
        'Яворов',
        'в.з.Американски колеж',
        'в.з.Беловодски път',
        'в.з.Бояна',
        'в.з.Бункера',
        'в.з.Врана - Герман',
        'в.з.Врана - Лозен',
        'в.з.Габаро - Азмата',
        'в.з.Горна баня',
        'в.з.Драгалевци лифта',
        'в.з.Килиите',
        'в.з.Киноцентъра',
        'в.з.Киноцентъра 3 част',
        'в.з.Малинова долина',
        'в.з.Малинова долина - Герена',
        'в.з.Милкова кория',
        'в.з.Могилата',
        'в.з.Симеоново - Драгалевци',
        'ж.гр.Зоопарк',
        'ж.гр.Южен парк',
        'м-т Батареята',
        'м-т Гърдова глава',
        'м-т Детски град',
        'м-т Киноцентъра',
        'м-т Мала кория',
        'м-т Орехите',
        'м-т Подлозище',
        'м-т Яладжа',
    ];
    let result = null;
    neighborhoods.forEach(element => {
        if (title.includes(element)) {
            result = element;
        }
    });
    return result;
};

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
    saveImageToS3Bucket,
    getRealEstateImageLinks,
    uploadImagesToS3Bucket,
    getRealEstateNameIds,
    getRealEstateType,
    getRealEstateNeighborhood,
};

function getImageName(link) {
    return link
        .split('/')
        .pop()
        .split('.')[0];
}

const s3ImageFolderPath = (type, realEstateId) =>
    type === 'thumb'
        ? `${realEstateId}/thumbPhotos`
        : `${realEstateId}/bigPhotos`;
