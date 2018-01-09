
const MsTranslator = require('mstranslator');
const mongoClient = require('mongodb').MongoClient;
const async = require('async');

const url = 'mongodb://localhost:27017';
const key = '14fe39b28b79421b847f527e319db16e';
const fromLang = 'pt';
let toLangs = [];

const client = new MsTranslator({
  api_key: key,
}, true);

function updateEntry(doc, text, translationsCollection, toLang, callback3) {
  const translation = Object.assign({
    to: toLang,
    text: text.value,
  }, {
    from: fromLang,
  });

  client.translate(translation, (err, translatedText) => {
    if (err) throw err;

    translationsCollection.updateOne({
      componentN: doc.componentN,
      toolN: doc.toolN,
      lang: toLang,
    }, {
      $push: {
        entries: {
          id: text.id,
          value: translatedText,
        },
      },
      $setOnInsert: {
        lang: toLang,
        componentN: doc.componentN,
        toolN: doc.toolN,
      },
    }, {
      upsert: true,
    }, (err) => {
      if (err) throw err;
      callback3(null);
    });
  });
}


function searchDif(doc, translationsCollection, text, callback2) {
  const projection = {
    lang: true,
    _id: false,
  };

  translationsCollection.find({
    componentN: doc.componentN,
    toolN: doc.toolN,
    'entries.id': text.id,
    'entries.value': {
      $exists: true,
    },
  }).sort({
    lang: 1,
  }).toArray((err, result) => {
    const found = [];
    result.forEach((element) => {
      found.push(element.lang);
    });
    const dif = toLangs.filter(x => !found.includes(x));
    if (dif.length > 0) {
      async.each(dif, updateEntry.bind(null, doc, text, translationsCollection), (err) => {
        if (err) throw err;
        callback2();
      });
    } else {
      callback2();
    }
  });
}

mongoClient.connect(url, (err, db) => {
  if (err) throw err;
  const translationsCollection = db.db('translator').collection('translations');
  const settingsCollection = db.db('translator').collection('settings');

  settingsCollection.find({
    name: 'Helppier',
  }).toArray((err, result) => {
    toLangs = result[0].lang;
  });

  translationsCollection.find({
    lang: fromLang,
  }).sort({
    componentN: 1,
  }).toArray((err, docs) => {
    toLangs.sort();

    async.each(docs, (doc, callback1) => {
      async.each(doc.entries, searchDif.bind(null, doc, translationsCollection), (err) => {
        if (err) throw err;
        callback1();
      });
    }, (err) => {
      if (err) throw err;
      db.close();
    });
  });
});
