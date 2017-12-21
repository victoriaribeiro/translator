if (process.argv.length < 5) {
    console.log('node ' + process.argv[1] + ' filename fromLang toLang');
    process.exit(1);
}

var fs = require('fs');
var MsTranslator = require('mstranslator');
var key = 'a56ac805d4664a66b5b8313b0329d6be';
var filename = process.argv[2];
var toTranslate = [];
var fromLang = process.argv[3];
var toLangs = [];

var client = new MsTranslator({
    api_key: key
}, true);

var params = {
    texts: '',
    from: fromLang,
    to: '',
}

if (process.argv.length >= 5) {
    for (i = 4; i < process.argv.length; i++) {
        toLangs.push(process.argv[i]);
    }
}

var rawdata = fs.readFileSync(filename);
var data = JSON.parse(rawdata);

for (i = 0; i < data.length; i++) {
    if (data[i].lang == fromLang) {
        for (j in data[i].entries) {
            toTranslate.push(data[i].entries[j].value);
        }
    }
}
params.texts = toTranslate;

toLangs.forEach(function(lang){
    let translation = Object.assign({
        to: lang
    }, {
        texts: params.texts,
        from: params.from
    });

    client.translateArray(translation, (err, result) => {
        console.log(err);
        console.log(result);
    });
})