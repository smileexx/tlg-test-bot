const request = require("request"),
    cheerio = require("cheerio"),
    crypto = require('crypto');

function JoyParser() {
    let url = "http://joyreactor.cc/tag/erotic/new";
    let lastCheck = 0;

    function fn() {
    };

    this.parseData = function (callback) {
        callback = callback || fn;

        let time = Math.floor(Date.now() / 1000);
        if ((time - lastCheck) < 3000) {
            callback(null);
            return;
        }

        lastCheck = time;

        request(url, function (error, response, body) {
            if (!error) {
                /**
                 * @type Cheerio
                 */
                let $ = cheerio.load(body);
                // postContainer = $(".postContainer .post_content .image a img"),
                let postContainer = $(".postContainer .post_top"),
                    images = [],
                    gifs = [];

                let gifNodes = $('.image video source[type="video/mp4"]');

                gifNodes.each((key, gif) => {
                    gifs.push({
                        'id': crypto.createHash('md5').update(gif.attribs.src).digest('hex'),
                        'src': gif.attribs.src
                    });
                });

                postContainer.each(function (key, post) {
                    let $ = cheerio.load(post);
                    let postTags = $('.taglist b a');
                    let tags = [];

                    //parse tags
                    postTags.each(function (key, tag) {
                        tags.push('#' + tag.attribs.title.replace(/\s/g, ''));
                    });
                    let tagsStr = tags.join(' ');

                    //parse image
                    let postImg = $('.post_content img');
                    postImg.each(function (key, item) {
                        let img = {
                            'id': crypto.createHash('md5').update(item.attribs.src).digest('hex'),
                            'src': item.attribs.src,
                            'tags': tagsStr
                        };
                        images.push(img);
                    });

                    // parse gif
                    let gifNodes = $('.image video source[type="video/mp4"]');
                    gifNodes.each((key, gif) => {
                        gifs.push({
                            'id': crypto.createHash('md5').update(gif.attribs.src).digest('hex'),
                            'src': gif.attribs.src,
                            'tags': tagsStr
                        });
                    });
                });

                callback(images, gifs);
            } else {
                console.warn(error);
                callback(null, null, error.message);
            }
        });
    }


    this.dumpGifs = function (page, callback) {
        callback = callback || fn;
        let url = 'http://joyreactor.cc/tag/ero+gif/';


        request(url + page, function (error, response, body) {
            if (!error) {
                /**
                 * @type Cheerio
                 */
                let $ = cheerio.load(body);

                let postContainer = $(".postContainer .post_top"),
                    images = [],
                    gifs = [];


                postContainer.each(function (key, post) {
                    let $ = cheerio.load(post);
                    let postTags = $('.taglist b a');
                    let tags = [];
                    postTags.each(function (key, tag) {
                        tags.push('#' + tag.attribs.title.replace(/\s/g, ''));
                    });
                    let tagsStr = tags.join(' ');

                    let gifNodes = $('.image video source[type="video/mp4"]');

                    gifNodes.each((key, gif) => {
                        gifs.push({
                            'id': crypto.createHash('md5').update(gif.attribs.src).digest('hex'),
                            'src': gif.attribs.src,
                            'tags': tagsStr
                        });
                    });
                });

                callback( gifs);
            } else {
                console.warn(error);
                callback(null, error.message);
            }
        });


    }
}

function XParser() {
    // let url = "https://www.gettyimages.com/photos/gay-man?autocorrect=none&mediatype=photography&phrase=gay%20man";
    function fn() {
    };
    let guysImagesPool = [];

    this.getImage = function (callback) {
        callback = callback || fn;

        if (guysImagesPool.length) {
            let r = Math.floor(Math.random() * guysImagesPool.length - 1);
            let img = guysImagesPool.splice(r, 1)[0];
            callback(img.src);
            return 1;
        } else {
            let page = Math.floor(Math.random() * 25) + 1;
            // URL params order can't be changed!!!
            let url = "https://www.gettyimages.com/photos/gay-man?mediatype=photography&page=" + page + "&phrase=gay%20man&sort=mostpopular";
            request(url + page, function (error, response, body) {
                if (!error) {
                    let $ = cheerio.load(body),
                        postContainer = $("article img.gallery-asset__thumb");

                    postContainer.each(function (key, item) {
                        let img = {
                            'id': crypto.createHash('md5').update(item.attribs.src).digest('hex'),
                            'src': item.attribs.src
                        };
                        guysImagesPool.push(img);
                    });
                    let img = guysImagesPool.pop();
                    console.log("Guy parsed ", guysImagesPool.length);
                    callback(img.src);
                    return 1;
                } else {
                    console.log("Error");
                }
            });
        }
    };
}

function GmParser() {
    //https://www.gettyimages.com/photos/bodybuilder-woman?ageofpeople=senioradult&mediatype=photography&page=2&phrase=bodybuilder%20woman&sort=mostpopular
    function fn() {
    };
    let adultImagesPool = [];

    this.getImage = function (callback) {
        callback = callback || fn;

        if (adultImagesPool.length) {
            let r = Math.floor(Math.random() * adultImagesPool.length - 1);
            let img = adultImagesPool.splice(r, 1)[0];
            callback(img.src);
            return 1;
        } else {
            let page = Math.floor(Math.random() * 6) + 1;
            // URL params order can't be changed!!!
            let url = "https://www.gettyimages.com/photos/bodybuilder-woman?ageofpeople=senioradult&mediatype=photography&page=" + page + "&phrase=bodybuilder%20woman&sort=mostpopular";
            request(url + page, function (error, response, body) {
                if (!error) {
                    let $ = cheerio.load(body),
                        postContainer = $("article img.gallery-asset__thumb");

                    postContainer.each(function (key, item) {
                        let img = {
                            'id': crypto.createHash('md5').update(item.attribs.src).digest('hex'),
                            'src': item.attribs.src
                        };
                        adultImagesPool.push(img);
                    });
                    let img = adultImagesPool.pop();
                    console.log("GrandMa parsed ", adultImagesPool.length);
                    callback(img.src);
                    return 1;
                } else {
                    console.log("Error");
                }
            });
        }
    };
}

module.exports.JoyParser = new JoyParser();
module.exports.XParser = new XParser();
module.exports.GmParser = new GmParser();