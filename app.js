if (process.argv.length < 4) {
  console.log('node ' + process.argv[1] + ' fromLang toLang');
  process.exit(1);
}
const start = Date.now();
const MsTranslator = require('mstranslator');
const mongoClient = require('mongodb').MongoClient;
const async = require('async');

const url = 'mongodb://localhost:27017';
const key = '14fe39b28b79421b847f527e319db16e';
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
  const collection = db.db('translator').collection('translations');

  collection.find({
    lang: fromLang,
  }).sort({
    componentN: 1,
  }).toArray((err, docs) => {
    toLangs.sort();


    async.each(docs, (doc, callback1) => {
      if (err) throw err;
      async.each(docs.entries, (texts, callback2) => {
        debugger;
        collection.find({
          componentN: 'quickEditFeedbackDelete',
          'entries.id': 'title',
          'entries.value': {
            $exists: true
          }
        }, {
          lang: true,
          _id: false
        }).sort({
          lang: 1
        }).toArray((err, result) => {
          console.log(result)
          callback2();
        });




      }, (err, ));


      // client.translateArray(translation, (err, result) => {
      //   if (err) throw err;

      //   let i = 0;

      //   result.forEach((response) => {
      //     doc.entries[i].value = response.TranslatedText;
      //     i += 1;
      //   });

      //   collection.updateOne({
      //     lang: doc.lang,
      //     componentN: doc.componentN,
      //     toolN: doc.toolN,
      //   }, {
      //     $set: {
      //       lang: doc.lang,
      //       componentN: doc.componentN,
      //       toolN: doc.toolN,
      //       entries: doc.entries,
      //     },
      //   }, {
      //     upsert: true,
      //   }, (err) => {
      //     if (err) throw err;
      //     callback1(null);
      //   });
      // });
    }, (err) => {
      if (err) throw err;
      callback2(null);
    });

  });
});