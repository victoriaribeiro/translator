if (process.argv.length < 3) {
    console.log('node' + process.argv[1] + 'filename');
    process.exit(1);
}

var request = require('request');
var fs = require('fs');

var azureClienteSecret = 'a56ac805d4664a66b5b8313b0329d6be';
// var textTranslateUrl = 'http://api.microsofttranslator.com/V2/Http.svc/Translate'
var filename = process.argv[2];
var text = '';
var accessToken;

request.post({
        url: 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken',
        headers: {
            'Ocp-Apim-Subscription-Key': azureClienteSecret
        },
        method: 'POST'
    },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            accessToken = body;
        }
    }
);

fs.readFile(filename, 'utf8', function (err, data) {
    if (err) throw err;
    text = data;
});

setTimeout(function () {
    var to = 'en';
    var from = 'pt';
    var textTranslateUrl = "http://api.microsofttranslator.com/v2/http.svc/translate?text=" + text + "&from=" + from + "&to=" + to;


    var headers = {
        Authorization: 'Bearer ' + accessToken
    }
    var options = {
        url: textTranslateUrl,
        method: 'GET',
        headers: headers,
        // text: 'water',
        // to: 'pt',
        // from: 'en'   
    }


    request(options, function (error, response, body) {
        if (error) {
            console.log(error);
            console.log(response);
        }
        console.log(body)
    });
}, 3000);