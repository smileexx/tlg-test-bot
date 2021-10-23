const Storage = require('./storage').Storage;
const JoyParser = require('./joy-parser').JoyParser;
const https = require('https');

JoyParser.parseData(function (images, gifs, err) {
    console.log('Schedule parse');
    if (err) {
        console.warn(err);
        return;
    }
    if (images && images.length) {
        Storage.addImages(images);
    }
    if (gifs && gifs.length) {
        Storage.addGifs(gifs);
    }
});
