if (process.argv.length < 3){
    console.log('node' + process.argv[1] + 'filename'  );
    process.exit(1);
}

var fs = require('fs');
var filename = process.argv[2];
fs.readFile(filename,'utf8',function(err, data){
    if (err) throw err;
    console.log('File ' + filename);
    console.log(data);

});