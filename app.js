if (process.argv.length < 3) {
    console.log('node' + process.argv[1] + 'filename');
    process.exit(1);
}

var request = require('request');
var wsClient = require('websocket').client;
var fs = require('fs');

var azureClienteSecret = 'a56ac805d4664a66b5b8313b0329d6be';
var textTranslateUrl = 'https://api.microsofttranslator.com/V2/Http.svc/Translate';
var filename = process.argv[2];

var xmlRequest = '<TranslateArrayRequest> <AppId/> <From>language-code</From> <Texts>  <string xmlns="http://schemas.microsoft.com/2003/10/Serialization/Arrays">string-value</string>   <string xmlns="http://schemas.microsoft.com/2003/10/Serialization/Arrays">string-value</string> </Texts> <To>language-code</To> </TranslateArrayRequest>'

request.post({
        url: 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken',
        headers: {
            'Ocp-Apim-Subscription-Key': azureClienteSecret
        },
        method: 'POST'
    },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var accessToken = body;

            console.log(accessToken);
        }
    }
);

request.post

fs.readFile(filename, 'utf8', function (err, data) {
    if (err) throw err;
  //  console.log('File ' + filename);
    //console.log(data);

});