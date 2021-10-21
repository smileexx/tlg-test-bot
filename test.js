console.log(Math.floor(Date.now() / 1000));

/*var request = require("request"),
    cheerio = require("cheerio"),
    crypto = require('crypto'),
    url = "http://joyreactor.cc/tag/art";

request(url, function (error, response, body) {
    if (!error) {
        let data = [];
        let $ = cheerio.load(body),
            postContainer = $(".postContainer .post_content .image a img");

        postContainer.each(function(key, item){
            let set = {
                'id': crypto.createHash('md5').update(item.attribs.src).digest('hex'),
                'src': item.attribs.src
            };
            data.push(set)
        });
        console.log(data);
    } else {
        console.log("Произошла ошибка " );
    }
});*/

/*
let list = [
    { id: 'a60f533307c5daf2ff69a5475e93a4ae',
        src:
            'http://img10.joyreactor.cc/pics/post/%D0%B4%D0%BE%D0%BC%D0%B0%D1%88%D0%BD%D1%8F%D1%8F-%D1%8D%D1%80%D0%BE%D1%82%D0%B8%D0%BA%D0%B0-%D0%AD%D1%80%D0%BE%D1%82%D0%B8%D0%BA%D0%B0-5137286.jpeg' }
];

*/
const Storage = require('./storage').Storage;

Storage.loadRandomImages( (res, err)=>{
    console.log(res, err);
});





/*

const Serv = require('./my-services').MyServices;

Serv.Weather.getWeather(function(result){
    console.log(result);
})*/
// const Storage = require('./storage').Storage;
// const JoyParser = require('./joy-parser').JoyParser;
// let gifs = [];
// let pageStart = 610,
//     page = pageStart;
// JoyParser.parseData( );
//
// function callback(newGifs, err){
//     gifs = gifs.concat(newGifs);
//     if( page > pageStart - 30 && page > 0 ) {
//         console.log(page);
//         JoyParser.dumpGifs(--page, callback);
//     } else {
//         pageStart = page;
//
//         console.log('Saving', 'start ' + pageStart );
//         Storage.addGifs(gifs, (res)=>{
//             console.log('Saved');
//             return 1;
//         });
//     }
//
// }
//
// let interval = setInterval(function () {
//     if( pageStart  > 0 ) {
//         JoyParser.dumpGifs( pageStart, callback);
//     } else {
//         clearInterval(interval);
//     }
//
// }, 30000);


