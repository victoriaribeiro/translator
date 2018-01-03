if (process.argv.length < 4) {
  console.log('node ' + process.argv[1] + ' fromLang toLang');
  process.exit(1);
}
const MsTranslator = require('mstranslator');
const mongoClient = require('mongodb').MongoClient;
const async = require('async');

const url = 'mongodb://localhost:27017';
const key = 'a56ac805d4664a66b5b8313b0329d6be';
const fromLang = process.argv[2];
const toLangs = [];

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
  const dbase = db.db('translator');

  dbase.createCollection('translations', (err, collection) => {
    if (err) throw err;

    async.each(toLangs, (lang, callback2) => {
      collection.find({
        lang: fromLang,
      }).sort({
        componentN: 1,
      }).toArray((err, docs) => {
        async.each(docs, (doc, callback) => {
          const toTranslate = [];
          doc.entries.forEach((entries) => {
            toTranslate.push(entries.value);
          });

          const translation = Object.assign({
            to: lang,
            texts: toTranslate,
          }, {
            from: params.from,
          });
          doc.lang = lang;

          client.translateArray(translation, (err, result) => {
            if (err) throw err;
            let i = 0;

            result.forEach((response) => {
              doc.entries[i].value = response.TranslatedText;
              i += 1;
            });

            collection.updateOne({
              lang: doc.lang,
              componentN: doc.componentN,
              toolN: doc.toolN,
            }, {
              $set: {
                lang: doc.lang,
                componentN: doc.componentN,
                toolN: doc.toolN,
                entries: doc.entries,
              },
            }, {
              upsert: true,
            }, (err) => {
              if (err) throw err;
              callback(null);
            });
          });
        }, (err) => {
          if (err) throw err;
          callback2(null);
        });
      });
    }, (err) => {
      if (err) throw err;
      db.close();
    });
  });
});
