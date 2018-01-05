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

function searchDif(doc, collection, text, callback2) {
  let projection = {
    lang: true,
    _id: false
  };
  // debugger;
  collection.find({
    componentN: doc.componentN,
    'entries.id': text.id,
    'entries.value': {
      $exists: true
    }
  }).project(projection).sort({
    lang: 1
  }).toArray((err, result) => {
    debugger
    let found = []

    result.forEach(element => {
      found.push(element.lang);
    });

    let dif = toLangs.filter(x => !found.includes(x));

    async.each(dif, updateEntry.bind(null, doc, text, collection), (err) => {
      if (err) throw err;
    })


    callback2();
  });
}

function updateEntry(doc, text, collection, toLang, callback3) {
  


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
      async.each(doc.entries, searchDif.bind(null, doc, collection), (err) => {
        if (err) throw err;
        callback1();
      });


    }, (err) => {
      if (err) throw err;
      db.close();


    }, (err) => {
      if (err) throw err;
    });

  });
});