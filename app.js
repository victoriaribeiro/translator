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




if (process.argv.length > 5) {
    for (i = 4; i < process.argv.length; i++) {
        toLangs.push(process.argv[i]);
    }
}

var total = 0;

var params = {
    text: 'The step you’re trying to delete is the only step of the guide. You should delete the guide in the guide settings.',
    from: 'en',
    to: 'pt',
}


var rawdata = fs.readFileSync(filename);
var data = JSON.parse(rawdata);

// for (k = 4; k < process.argv.length; k++) {
//     params.to = toLangs[k];
    

// }

// client.translate(params, function (err, data) {
//     console.log(data);
// });

for (i = 0; i < data.length;) {
    if (data[i].lang == fromLang) {
        for (j in data[i].entries) {
            total += data[i].entries[j].value.length;
            params.text = data[i].entries[j].value;
            //console.log(params.text);
            client.translate(params, function (err, data) {
                console.log(data);
                i++;
            });


            //toTranslate.push(data[i].entries[j].value);

            //console.log(data[i].entries[j].value);
        }
    }
    //console.log(i);
    //console.log(data[i].entries);
}





console.log(data.length + "teste");
console.log(total);







// client.translateArray(params, function (err, response) {
//     if (err) throw err;

//     fs.writeFileSync('/home/victoria/response.json', JSON.stringify(response));

//     // for (i in response) {
//     //     console.log(response[i].TranslatedText);
//     // }
// });