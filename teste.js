if (process.argv.length < 4) {
  console.log("node " + process.argv[1] + " fromLang toLang");
  process.exit(1);
}


const MsTranslator = require('mstranslator');
const mongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017'
const key = 'a56ac805d4664a66b5b8313b0329d6be';
const toTranslate = ['hi', 'hello','how','are','you','baby','i','love','you','forever'];
const fromLang = process.argv[2];
const toLangs = [];
const async = require('async')


const client = new MsTranslator({
  api_key: key,
}, true);

const params = {
  text: '',
  from: "en",
  to: 'pt',
};

if (process.argv.length >= 4) {
  for (let i = 3; i < process.argv.length; i += 1) {
    toLangs.push(process.argv[i]);
  }
}

async.each(toTranslate, (words,callback)=>{
    const translation = Object.assign({
        text: words
      }, {
        to:'pt',
        from: 'es',
      });


      client.translate(translation, function (err, result) {

        if (err) throw err

        console.log(result);
        callback(null)
        
    });
},(err, result)=>{
    console.log('the end')
})


mongoClient.connect(url, (err, db) => {
  if (err) throw err;
  let dbase = db.db('translator');
  let count = 1;

  dbase.createCollection('translations', (err, collection) => {
    if (err) throw err;

    collection.find({
      "lang": fromLang
    }).sort({componentN:1}).toArray((err, docs) => {
      async.each(docs, (doc, callback) => {
        let toTranslate = []

        doc.entries.forEach((entries) => {
          toTranslate.push(entries.value)
        });

        let originalLang = fromLang;

        async.each(toLangs, function (lang, callback2) {

          const translation = Object.assign({
            to: lang,
            texts: toTranslate
          }, {
            from: params.from,
          });
          //debugger
          doc.lang = lang;
          debugger;
          
          client.translateArray(translation, function (err, result) {
            if (err) throw err
            console.log(result)
            let i = 0;
            result.forEach((response) => {
              doc.entries[i].value = response.TranslatedText;
              i++;
            });
            debugger;
            collection.updateOne({
              "lang": doc.lang,
              "componentN": doc.componentN,
              "toolN": doc.toolN
            }, {
              $set: {
                "lang": doc.lang,
                "componentN": doc.componentN,
                "toolN": doc.toolN,
                "entries": doc.entries
              }
            }, {
              upsert: true
            }, (err, r) => {
              if (err) callback2(err)
              console.log('salvo')
              callback2(null)
            });

          });
        }, (err) => {
          if (err) throw 'err'
          callback(null)
        })


      }, (err) => {
        if (err) throw err;
        console.log('fim')
        db.close()
      });


    });

  });

});