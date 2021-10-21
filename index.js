process.env.NTBA_FIX_319 = 1;

const TelegramBot = require('node-telegram-bot-api');
const Storage = require('./storage').Storage;
const JoyParser = require('./joy-parser').JoyParser;
const XParser = require('./joy-parser').XParser;
const GmParser = require('./joy-parser').GmParser;
const Serv = require('./my-services').MyServices;

/**
 * Config and const
 */
const botName = '@tlg_my_f1rst_bot',
    token = process.env.BOT_TOKEN,
    port = process.env.PORT || 443,
    host = '0.0.0.0',  // probably this change is not required
    webhook = process.env.WEBHOOK; //|| 'https://tlg-test-bot.herokuapp.com/bot'

const bot = new TelegramBot(token, {webHook: {port: port, host: host}, onlyFirstMatch: true});
// Create a bot that uses 'polling' to fetch new updates
// const bot = new TelegramBot(token, {polling: true});

const issueChatId = '176450805';
const boobsChatId = '-191176138';
const boysChatId = '-229628223';

let stateKeys = ['date', 'lastBoobImg', 'stat'];

let State = {
    date: new Date().toISOString().slice(0, 10),
    lastBoobImg: {},
    stat: {}
};

let gayList = [];
let MediaList = [];
const Sorry = [
    'не осуждаю геев',
    'извините, я так больше не буду'
];

getMediaList();

Storage.retriveState(State.date, function (oldState) {
    if (oldState) {
        console.log('Old state:', oldState);
        State = oldState;
    }
    main();
    sendBoobsBySchedule();
});

function sendBoobsBySchedule() {
    setTimeout(function(){
        let now = Math.floor(Date.now() / 1000);

        if (!State.lastBoobImg[boysChatId]) {
            State.lastBoobImg[boysChatId] = {time: 0, cnt: 0}
        }
        let delay = 60 * 15;
        console.log("sendBoobsBySchedule", now - State.lastBoobImg[boysChatId].time, delay);
        if ((now - State.lastBoobImg[boysChatId].time) > delay) {
            State.lastBoobImg[boysChatId].time = now;
            sendBoobs(true, boysChatId);
        }
    }, 1000)
}

function checkState() {
    stateKeys.forEach((val, i) => {

    })
}

function main() {
    bot.setWebHook(webhook + ':443/bot' + token);


// Matches "/echo [whatever]"
    bot.onText(/\/echo (.+)/, (msg, match) => {
        // 'msg' is the received Message from Telegram
        // 'match' is the result of executing the regexp above on the text content
        // of the message
        // console.log(msg);
        const chatId = msg.chat.id;
        const resp = match[1]; // the captured "whatever"
        // send back the matched "whatever" to the chat
        bot.sendMessage(chatId, resp);
    });

    bot.onText(/^\/ce_usd/, (msg, match) => {
        const chatId = msg.chat.id;
        Serv.PB.currencyExchange('usd', function (result) {
            bot.sendMessage(chatId, result);
        })
    });
    bot.onText(/\/weather/, (msg, match) => {
        const chatId = msg.chat.id;
        Serv.Weather.getWeather(function (result) {
            bot.sendMessage(chatId, result);
        })
    });

    bot.onText(/\/users/, (msg, match) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, JSON.stringify(Storage.getUsers()));
    });

    bot.onText(/\/test/, (msg, match) => {
        const chatId = msg.chat.id;
        let name = msg.from.username ? msg.from.username : msg.from.first_name;
        postGm(chatId, name);
    });

    bot.onText(/\/sorry(.*)/, (msg, match) => {
        console.log(match);
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        let matched = false;

        if (match[1]) {
            let str = match[1].trim().toLowerCase();
            if (str.startsWith('вова') || Sorry.includes(str)) {
                gayList.forEach(element => {
                    bot.deleteMessage(chatId, element);
                });
                gayList = [];

                bot.sendSticker(chatId, "CAADAgADNAUAAp1D8UgMQnjBM_rmyxYE");
                bot.sendMessage(chatId, 'Okay...');

                matched = true;
            }
        }

        if (!matched) {
            bot.sendSticker(chatId, "CAADAgADVAUAAqN5-EjM69EnluuEqBYE");
            bot.sendMessage(chatId, "But you don't ask with respect");
        }
    });

    bot.onText(/\/help/, (msg, match) => {
        const txt =
            "/help - call this help 😁\n" +
            "/weather - Show weather in Chernihiv\n" +
            "/ce_usd - Show USD currency rate\n" +
            "/stat - Show gey statistic\n" +
            "/img - Check your luck and get a nice pic\n" +
            "/sorry <'не осуждаю геев' | 'извините, я так больше не буду'> - Remove your shame"
        ;
        bot.sendMessage(msg.chat.id, txt);
    });

    // /addMedia type file_id name
    bot.onText(/\/addMedia\s(\w+)\s([\w\d]+)\s?(.*)?/, (msg, match) => {
        const chatId = msg.chat.id;
        let doc = {
            type: match[1],
            file_id: match[2],
            name: (match[3]) ? match[3] : ""
        };
        Storage.addMedia(doc, function (res, err) {
            let txt = "";
            if (res) {
                txt = "Success: " + JSON.stringify(res);
                if (!MediaList[doc.type]) {
                    MediaList[doc.type] = [];
                }
                MediaList[doc.type].push(doc);
            } else {
                txt = "Error: " + JSON.stringify(err);
            }
            bot.sendMessage(chatId, txt);
        });
    });


    bot.onText(/\/getMedia/, (msg, match) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, JSON.stringify(MediaList));
    });

    bot.onText(/\/hb\s?(.*)?/, (msg, match) => {
        const chatId = msg.chat.id;
        if (match && match[1]) {
            match = match[1].trim();
            bot.sendVideo(chatId, 'gif/hb.mp4', {caption: match});
        }
    });

    bot.onText(/\/sticker/, (msg, match) => {
        const chatId = msg.chat.id;
        // bot.sendSticker(chatId, getSticker());
        sendSticker(chatId);
    });

    bot.onText(/\/stat/, (msg, match) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, JSON.stringify(State.stat).replace(/{/g, '{\n')
            .replace(/}/g, '\n}').replace(/,/g, ',\n'));
    });

    // let lastImgInBoobs = 0;
    // let lastImgInBoobsCnt = 0;

    const volodymyrId = '207815286';
    const pgrabovetsId = '291218093';
    let vovaCounter = 0;
    let vovaLast = 0;

    bot.onText(/^\/img(@tlg_my_f1rst_bot)?$/, (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        let name = msg.from.username ? msg.from.username : msg.from.first_name;

        let now = Math.floor(Date.now() / 1000);
        let flag = true;

        if ('group' === msg.chat.type) {

            if (State.stat[name]) {
                State.stat[name].total++;
            } else {
                State.stat[name] = {total: 1, guys: 0};
            }

            if (!State.lastBoobImg[chatId]) {
                State.lastBoobImg[chatId] = {time: 0, cnt: 0}
            }
            let lastImgInBoobs = State.lastBoobImg[chatId].time;
            let lastImgInBoobsCnt = State.lastBoobImg[chatId].cnt;

            // if (0 === Math.floor(Math.random() * 7)) {
            //     // chance 1/8
            //     lastImgInBoobsCnt = 0;
            //     flag = false;
            //     postGuys(chatId, name, "#oops 😄");
            // } else
            if (0 === Math.floor(Math.random() * 20)) {
                // chance 1/20
                flag = false;
                sendSticker(chatId);
            }
            // else if ((now - lastImgInBoobs) < 120) {
            //     if (lastImgInBoobsCnt > 3) {
            //         lastImgInBoobsCnt = 0;
            //         flag = false;
            //         postGuys(chatId, name);
            //     } else if (lastImgInBoobsCnt == 3) {
            //         flag = false;
            //         // bot.sendMessage(chatId, name + ', stop fapping 😠');
            //         sendSticker(chatId);
            //         lastImgInBoobsCnt++;
            //     } else {
            //         lastImgInBoobsCnt++;
            //     }
            //
            // }

            State.lastBoobImg[chatId].time = now;
            State.lastBoobImg[chatId].cnt = lastImgInBoobsCnt;
        }

        if (flag) {
            sendBoobs(true, chatId, name);
        }
    });

    function postGuys(chatId, username, comment, ignore) {
        comment = comment ? comment : "";
        bot.sendMessage(chatId, username + ', Геи ушли на карантин 😠');
        // XParser.getImage(function (imgSrc) {
        //     if (imgSrc) {
        //         let tag = "#gays " + comment + ' ' + username + ' Fucked up!';
        //         // bot.sendMessage(chatId, username + ' Fucked up!');
        //         bot.sendPhoto(chatId, imgSrc, {caption: tag}).then((res) => {
        //             gayList.push(res.message_id);
        //             console.log(gayList);
        //         });
        //
        //         if (!ignore) {
        //             if (State.stat[username]) {
        //                 State.stat[username].guys++;
        //             } else {
        //                 State.stat[username] = {total: 0, guys: 1};
        //             }
        //         }
        //     } else {
        //         bot.sendMessage(chatId, username + ', stop fapping 😠');
        //     }
        // });
    }

    function postGm(chatId, username, comment, ignore) {
        comment = comment ? comment : "";
        GmParser.getImage(function (imgSrc) {
            if (imgSrc) {
                // bot.sendMessage(chatId, username + ' Fucked up!');
                let tag = "#img";
                bot.sendPhoto(chatId, imgSrc, {caption: tag});
            } else {
                sendBoobs(true, chatId, username);
            }
        });
    }

    let lastImg = 0;
    // Listen for any kind of message. There are different kinds of messages.
    bot.on('message', (msg) => {
        console.log(JSON.stringify(msg));
        sendBoobsBySchedule();
        // Storage.addUser(msg.from);

        // let time = Math.floor(Date.now() / 1000);
        // // only for boobs chat
        // if ((chatId == boobsChat) && (time - lastImg) > 1800) {
        //     sendBoobs(true, chatId);
        // }
        // send a message to the chat acknowledging receipt of their message
        // bot.sendMessage(chatId, 'Received your message');
    });


    let stateSaveInterval = setInterval(function () {
        Storage.saveState(State);
    }, 60000);


    /*function issuesNotify(err) {
        if(bot) {
            bot.sendMessage(issueChatId, err);
        }
    }*/

    function sendSticker(chatId, caption) {
        let opt = {};
        if (caption) {
            opt.caption = caption
        }
        let image = null;
        if (MediaList && MediaList['sasha_grey'] && MediaList['sasha_grey'].length) {
            let i = Math.floor(Math.random() * MediaList['sasha_grey'].length);
            image = MediaList['sasha_grey'][i].file_id;
        } else {
            // Plan B =)
            let i = Math.floor(Math.random() * 4);
            image = 'stickers/sticker' + i + '.webp'
        }

        bot.sendSticker(chatId, image, opt);
    }

}

let sentImage = [];

function sendBoobs(check, chatId, name = '') {
    // 1/3 chance
    if (0 === Math.floor(Math.random() * 3)) {
        Storage.loadRandomGif((gif, err) => {
            if (gif && gif.src) {
                // callback(gif);
                let tags = (gif.tags) ? gif.tags : "#gif";
                tags = tags + ' ' + name;
                bot.sendVideo(chatId, gif.src, {caption: tags});
            } else {
                // callback(null);
                bot.sendMessage(chatId, 'No new gif');
            }
            if (check) {
                gif.shown = true;
                Storage.updateGif(gif);
            }
        });
    } else {
        Storage.loadRandomImages((img, err) => {
            if (err) {
                console.warn(err);
                // callback(null);
                return;
            }
            if (img && img.src) {
                // callback(img);
                let tags = (img.tags) ? img.tags : "#img";
                tags = tags + ' ' + name;
                bot.sendPhoto(chatId, img.src, {caption: tags});
            } else {
                // callback(null);
                bot.sendMessage(chatId, 'No images');
            }
            if (check) {
                img.shown = true;
                Storage.updateImage(img);
            }
        });
    }
}


function getSticker() {
    let i = Math.floor(Math.random() * 4);
    return 'stickers/sticker' + i + '.webp'
}

function getMediaList() {
    Storage.getMedia(function (result, err) {
        // console.log("Media", result);
        if (result) {
            MediaList = [];
            for (let i in result) {
                let item = result[i];
                if (!MediaList[item.type]) {
                    MediaList[item.type] = [];
                }
                MediaList[item.type].push(item);
            }
            // MediaList = result;
            // console.log("Media", MediaList);
        } else {
            console.warn(err);
        }
    })
}

/*
function insertImages(images, callback) {
    if (images && images.length > 0) {
        let img = images.pop();
        Storage.addImage(img, () => {
            insertImages(images, callback);
        });
    }
}*/
