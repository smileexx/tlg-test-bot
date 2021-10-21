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

function wakeup() {
    console.log('Schedule wakeup');
    //           '{"update_id":712713273,"message":{"message_id":55369,"from":{"id":176450805,"is_bot":false,"first_name":"Ihor","username":"smileexx","language_code":"en"},"chat":{"id":-229628223,"title":"Реальный пацанячий чатик","type":"group","all_members_are_administrators":true},"date":1596723235,"text":"/img"}}';
    const data = '{"update_id":712713273,"message":{"message_id":55367,"from":{"id":176450805,"is_bot":false,"first_name":"Ihor","username":"smileexx","language_code":"en"},"chat":{"id":-300743370,"title":"Group with bot","type":"group","all_members_are_administrators":true},"date":1596721875,"text":"!boobs wake up!"}}';

    const options = {
        hostname: 'tlg-test-bot.herokuapp.com',
        port: 443,
        path: '/bot:443/bot647964100:AAELEnB8qwBr1i3fj4qeQ3GTzRVmx6wDqaY',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`);

        res.on('data', (d) => {
            console.log(d);
        })
    });

    req.on('error', (error) => {
        console.error(error)
    });

    req.write(data);
    req.end();
}

wakeup();