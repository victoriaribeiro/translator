if (process.argv.length < 5) {
    console.log('node ' + process.argv[1] + ' filename fromLang toLang');
    process.exit(1);
}

//async = require('async');
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
// else{
//     params.to = process.argv[4];
// }

var total = 0;




var rawdata = fs.readFileSync(filename);
var data = JSON.parse(rawdata);
fs.appendFileSync('/home/victoria/entries.json', JSON.stringify(data));


// function getTexts(index) {
//     // for (k = 0; k < toLangs.length;) {
//     while (index < toLangs.length) {
//         index++;
//         getTexts(index);
//         console.log(index);
//         params.to = toLangs[index];
//         for (i = 0; i < data.length; i++) {
//             if (data[i].lang == fromLang) {
//                 for (j in data[i].entries) {
//                     total += data[i].entries[j].value.length;
//                     toTranslate.push(data[i].entries[j].value);
//                     //console.log(data[i].entries[j].value)
//                 }
//             }
//         }
//         params.texts = toTranslate;
//         console.log(params.to)

//         client.translateArray(params, function (err, data) {
//             console.log(err);
//             console.log(data)
//             // index++;
//         })
//     }

//     // }
// }





entries = 0;
for (k = 0; k < toLangs.length; k++) {
    total = 0;
    entries  = 0;
    params.to = toLangs[k];
    console.log(params.to)
    for (i = 0; i < data.length; i++) {
        if (data[i].lang == fromLang) {
            entries++;
            for (j in data[i].entries) {               
                total += data[i].entries[j].value.length;
                toTranslate.push(data[i].entries[j].value);
                // console.log(data[i].entries[j].value)
            }
        }
    }
    params.texts = toTranslate;
    debugger;
    client.translateArray(params, function (err, response) {
        debugger;
        if (err) throw err
        
        //fs.appendFileSync('/home/victoria/response.json', JSON.stringify(response));
        //console.log(data);
    })
}

console.log(entries);

// client.translateArray(params, function (err, response) {
//     if (err) throw err;

//     fs.writeFileSync('/home/victoria/response.json', JSON.stringify(response));

//     // for (i in response) {
//     //     console.log(response[i].TranslatedText);
//     // }
// });