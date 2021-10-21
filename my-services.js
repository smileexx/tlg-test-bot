let MyServices = {};
const https = require('https');

function PB () {
    this.currencyExchange = function( inCurrency, callback ) {
        let url = 'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5';

        https.get(url, (resp) => {
            let strData = '';
            // A chunk of strData has been recieved.
            resp.on('data', (chunk) => {
                strData += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                let data = JSON.parse(strData);
                console.log(strData);
                for( let i in data ) {
                    let rate = data[i];
                    if (rate && rate.ccy && (inCurrency === rate.ccy.toLowerCase())) {
                        callback( this.format( rate ) );
                    }
                }
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
            callback(null);
        });
    };
    let icons = {
        'USD':"\uD83D\uDCB2",
        'EUR':"\uD83D\uDCB6",
    };
    this.format = function( rateObj ) {
        let icon = icons[rateObj.ccy] || "\uD83D\uDCB0";
        return `${rateObj.ccy} ${icon}\nSale:\t\t${rateObj.sale}\nBuy:\t\t${rateObj.buy}`;
    }
};


function Weather() {
    let thunder = "\u26A1",         // Code: 200's, 900, 901, 902, 905
    dash = "\uD83D\uDCA8",          // wind
    drizzle = "\uD83D\uDCA6",       // "\uD83D\uDCA7",       // Code: 300's
    rain = "\uD83C\uDF27",          //'\u26C6'        ,// Code: 500's
    snowflake = "\u2744"   ,        // Code: 600's snowflake
    snowman = "\u26C4"     ,        // Code: 600's snowman, 903, 906
    atmosphere = "\uD83C\uDF01"  ,  // Code: 700's foogy
    clearSky = "\u2600"    ,        // Code: 800 clear sky
    moon = "\uD83C\uDF19"    ,        // Code: 800 clear sky
    fewClouds = "\u26C5"   ,        // Code: 801 sun behind clouds
    clouds = "\u2601"     ,         // Code: 802-803-804 clouds general
    hot = '\u2668'         ,        // Code: 904
    defaultEmoji = "\uD83C\uDF00",  // default emojis
    degree_sign = '\u00B0',
    degree_celsium = "\u2103";
let all = thunder + dash + drizzle + rain + snowflake + snowman + atmosphere + clearSky + moon + fewClouds+ clouds+ hot+ defaultEmoji;
    // let url = 'https://api.openweathermap.org/data/2.5/weather?appid=04f9cff3a5fbb8c457e31444bae05328&units=metric&q=Chernihiv';
    let url = 'https://api.openweathermap.org/data/2.5/weather?appid=04f9cff3a5fbb8c457e31444bae05328&units=metric&id=710735';

    this.getWeather = function (callback) {
        https.get(url, (resp) => {
            let strData = '';
            // A chunk of strData has been recieved.
            resp.on('data', (chunk) => {
                strData += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                callback( this.format( JSON.parse(strData) ) );
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
            callback(null);
        });
    };
    
    
    this.format = function(response) {
        let cityName = response.name,
        countryName = response.sys.country,
        temp_current = response.main.temp,
        temp_max = response.main.temp_max,
        temp_min = response.main.temp_min,
        description = response.weather[0].description,
        description_brief = response.weather[0].main,
        emoji = this.getEmoji(response.weather[0]);

        return cityName + ', ' + countryName + ":\t\t" + temp_current + '' + degree_celsium + '\n'
            + "Min:\t\t" + temp_min + '' + degree_celsium + '\n'
            + "Max:\t\t" + temp_max + '' + degree_sign + 'C\n'
            + description_brief + ' - ' + description + emoji + "\n" + all;
    };

    this.getEmoji = function (weather) {
        let weatherID = weather.id,
            icon = weather.icon;
        if (weatherID) {
            if (weatherID[0] == '2' || weatherID == 900 || weatherID == 901 || weatherID == 902 || weatherID == 905) {
                return rain + ' ' + thunder + ' ' + dash
            } else if ( weatherID[0] == '3' ) {
                return drizzle
            } else if (weatherID[0] == '5' ) {
                return rain
            } else if (weatherID[0] == '6' || weatherID == 903 || weatherID == 906 ) {
                return snowflake + ' ' + snowman
            } else if ( weatherID[0] == '7' ) {
                return atmosphere``
            } else if ( weatherID == 800 ) {
                return (icon == '01n') ? moon : clearSky
            } else if ( weatherID == 801 ) {
                return fewClouds
            } else if ( weatherID >= 802 && weatherID < 900 ) {
                return clouds
            } else if ( weatherID == 904 ) {
                return hot
            } else {
                return defaultEmoji
            }
        } else {
            return defaultEmoji;
        }
    }
}

MyServices.PB = new PB();
MyServices.Weather = new Weather();

module.exports.MyServices = MyServices;