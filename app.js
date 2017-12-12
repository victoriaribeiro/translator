if (process.argv.length < 3) {
    console.log('node' + process.argv[1] + 'filename');
    process.exit(1);
}

var fs = require('fs');
var MsTranslator = require('mstranslator');
var key = 'a56ac805d4664a66b5b8313b0329d6be';
var filename = process.argv[2];
var toTranslate = [];
var fromLang = 'en';
var toLang = 'pt';
var total = 0;


var rawdata = fs.readFileSync(filename);
var data = JSON.parse(rawdata);

var client = new MsTranslator({
    api_key: key
}, true);

var params = {
    texts: toTranslate,
    from: fromLang,
    to: toLang,
}


for (i in data) {
    if (data[i].lang == fromLang) {
        for (j in data[i].entries) {
            total += data[i].entries[j].value.length;
            toTranslate.push(data[i].entries[j].value);

            //console.log(data[i].entries[j].value);
        }
        params.texts = toTranslate;
        console.log(toTranslate);
        client.translateArray(params, function (err, response) {
            console.log(toTranslate);
            
            console.log(response)
            //fs.appendFileSync('/home/victoria/response.json', JSON.stringify(response));
            
        });

         //fs.writeFileSync('/home/victoria/response.json', JSON.stringify(response));
    }
    toTranslate = []
    //console.log(data[i].entries);
}
console.log(total);




// client.translateArray(params, function (err, response) {
//     if (err) throw err;

//     fs.writeFileSync('/home/victoria/response.json', JSON.stringify(response));

//     for (i in response) {
//         console.log(response[i].TranslatedText);
//     }
// });