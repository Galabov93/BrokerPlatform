function composeUrl(url, page) {
    const urlParts = url.split('=');
    const immutablePartOfUrl = urlParts.slice(0, urlParts.length - 1);
    return `${immutablePartOfUrl.join('=')}=${page}`;
}

module.exports = {
    composeUrl,
};
