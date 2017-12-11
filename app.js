if (process.argv.length < 3) {
    console.log('node' + process.argv[1] + 'filename');
    process.exit(1);
}

var fs = require('fs');
var MsTranslator = require('mstranslator');
var key = 'a56ac805d4664a66b5b8313b0329d6be';
var filename = process.argv[2];


var rawdata = fs.readFileSync(filename);
var data = JSON.parse(rawdata);

for (i in data){
    if(data[i].lang == 'en')
        console.log(data[i].entries);
}




// var client = new MsTranslator({
//     api_key = 'a56ac805d4664a66b5b8313b0329d6be'
// }, true);


