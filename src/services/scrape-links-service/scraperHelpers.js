/* eslint-disable no-console */
const cheerio = require('cheerio');
const Buffer = require('buffer').Buffer;
const iconv = require('iconv');

function getRealEstateNameIds(thumbnailImages) {
    let sources = Array.from(thumbnailImages).map(element => {
        return element.attribs.src;
    });
    return sources.map(el => getImageName(el)).join(',');
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

function getScraperConfiguration(linkToBeScraped) {
    return {
        uri: linkToBeScraped,
        method: 'GET',
        encoding: 'binary',
        transform: function(body) {
            body = Buffer.from(body, 'binary');
            let conv = new iconv.Iconv('windows-1251', 'utf8');
            body = conv.convert(body).toString();
            return cheerio.load(body);
        },
    };
}

function convertPriceStringToNumber(originalCurrencyPrice) {
    const temp = originalCurrencyPrice.replace(/[^0-9.-]+/g, '');
    return parseFloat(temp);
}

const possibleCurrencies = {
    euro: 'EUR',
    leva: 'BGN',
    dollar: 'USD',
};

function getOriginalCurrency(originalCurrencyPrice) {
    if (originalCurrencyPrice.includes('лв')) {
        return possibleCurrencies.leva;
    } else if (originalCurrencyPrice.includes('EUR')) {
        return possibleCurrencies.euro;
    } else {
        return possibleCurrencies.dollar;
    }
}

function getPriceInEuro(originalCurrencyPrice) {
    if (
        getOriginalCurrency(originalCurrencyPrice) === possibleCurrencies.euro
    ) {
        return convertPriceStringToNumber(originalCurrencyPrice);
    } else if (
        getOriginalCurrency(originalCurrencyPrice) === possibleCurrencies.leva
    ) {
        return convertPriceStringToNumber(originalCurrencyPrice) * 2;
    }
}

module.exports = {
    getRealEstateNameIds,
    getRealEstateType,
    getRealEstateNeighborhood,
    getScraperConfiguration,
    getOriginalCurrency,
    convertPriceStringToNumber,
    getPriceInEuro,
};

function getImageName(link) {
    return link
        .split('/')
        .pop()
        .split('.')[0];
}
