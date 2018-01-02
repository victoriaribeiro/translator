if (process.argv.length < 4) {
  console.log("node " + process.argv[1] + " fromLang toLang");
  process.exit(1);
}


const MsTranslator = require('mstranslator');
const mongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017'
const key = 'a56ac805d4664a66b5b8313b0329d6be';
const toTranslate = [];
const fromLang = process.argv[2];
const toLangs = [];
const async = require('async')


const client = new MsTranslator({
  api_key: key,
}, true);

const params = {
  texts: '',
  from: fromLang,
  to: '',
};

if (process.argv.length >= 4) {
  for (let i = 3; i < process.argv.length; i += 1) {
    toLangs.push(process.argv[i]);
  }
}

mongoClient.connect(url, (err, db) => {
  if (err) throw err;
  let dbase = db.db('translator');
  let count = 1;

  dbase.createCollection('translations', (err, collection) => {
    if (err) throw err;

    async.each(toLangs, function (lang, callback2) {

      collection.find({
        "lang": fromLang
      }).sort({
        componentN: 1
      }).toArray((err, docs) => {
        async.each(docs, (doc, callback) => {
          let toTranslate = []

          doc.entries.forEach((entries) => {
            toTranslate.push(entries.value)
          });

          const translation = Object.assign({
            to: lang,
            texts: toTranslate
          }, {
            from: params.from,
          });

          doc.lang = lang;

          client.translateArray(translation, function (err, result) {
            if (err) throw err
            let i = 0;
            //console.log(result)
            result.forEach((response) => {
              doc.entries[i].value = response.TranslatedText;
              i++;
            });
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
              if (err) throw err
              //console.log('salvo');
              callback(null)
            });           
          }, (err) => {
            if (err) throw err;
          });
        }, (err) => {
          if (err) throw err;
          callback2(null);
        });
      });
    },(err)=>{
      //console.log('fim')
      db.close();
    });
  });
});