
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
var toLang = [];

if(process.argv.length > 5){
    for(i=4;i<process.argv.length;i++){
        toLang.push(process.argv[i]);
    }
}
console.log(toLang);

var total = 0;
 
 
var rawdata = fs.readFileSync(filename);
var data = JSON.parse(rawdata);
 
for (i in data) {
    if (data[i].lang == fromLang) {
        for (j in data[i].entries) {
            total += data[i].entries[j].value.length;
            toTranslate.push(data[i].entries[j].value);
 
            //console.log(data[i].entries[j].value);
        }
    }
        //console.log(data[i].entries);
}
console.log(total);
 
var client = new MsTranslator({
    api_key: key
}, true);
 
var params = {
    texts: toTranslate,
    from: fromLang,
    to: toLang,
}
 

client.translateArray(params, function (err, response) {
    if (err) throw err;
 
    fs.writeFileSync('/home/victoria/response.json', JSON.stringify(response));
 
    // for (i in response) {
    //     console.log(response[i].TranslatedText);
    // }
});