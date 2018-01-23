
const MsTranslator = require('mstranslator');
const mongoClient = require('mongodb').MongoClient;
const async = require('async');

const url = 'mongodb://localhost:27017';
const key = '9c257e4bf93e4daf956f49f4719f98ff';
const fromLang = 'pt';

const regex = new RegExp("\<t class\=\'notranslate\'\>.*\<\/t\>");
const client = new MsTranslator({
  api_key: key,
}, true);

let index = 0;
let arrToTranslate = [];
let toLangs = [];
let charCount = 0;


function translateAndUpdate(toLang, translationsCollection, toTranslate, callback3) {
  const translation = Object.assign({
    to: toLang,
    texts: toTranslate,
    options: '{"ContentType":"text/html"}',
  }, {
    from: fromLang,
  });

  client.translateArray(translation, (err, data) => {
    if (err) throw err;

    // update each translated entry
    async.each(data, (response, callback4) => {
      const translatePrevention = (response.TranslatedText).match(regex)[0];
      const str = translatePrevention.replace("\<t class\=\'notranslate\'\>", '').replace('</t>', '');
      const keys = str.split('_');
      const textValue = response.TranslatedText.split('/t>')[1];

      translationsCollection.updateOne({
        componentN: keys[0],
        toolN: keys[1],
        lang: toLang,
      }, {
        $push: {
          entries: {
            id: keys[2],
            value: textValue,
          },
        },
        $setOnInsert: {
          lang: toLang,
          componentN: keys[0],
          toolN: keys[1],
        },
      }, {
        upsert: true,
      }, (err) => {
        if (err) throw err;
        callback4(null);
      });
    }, (err) => {
      if (err) throw err;
      callback3();
    });
  });
  // clean arrToTranslate and index
  arrToTranslate = [];
  index = 0;
}

function searchDif(lang, doc, translationsCollection, text, callback2) {
  // check if entry exists in the database
  translationsCollection.find({
    componentN: doc.componentN,
    toolN: doc.toolN,
    lang: lang,
    'entries.id': text.id,
    'entries.value': {
      $exists: true,
    },
  }).toArray((err, result) => {
    // if it is not in the DB, it is added to be translated
    if (result.length == 0) {
      const textValue =
        "<t class='notranslate'>" +
        doc.componentN +
        "_" +
        doc.toolN +
        "_" +
        text.id +
        "</t>" +
        text.value;

      if (arrToTranslate.length == 0) { // if it is the first entry in arrToTranslate
        arrToTranslate.push(new Array(textValue));
        charCount = textValue.length;
      } else if (((charCount + textValue.length) >= 10000) || ((arrToTranslate[index].length) >= 2000)) {
        arrToTranslate.push(new Array(textValue));
        charCount = textValue.length;
        index += 1;
      } else {
        arrToTranslate[index].push(textValue);
        charCount += textValue.length;
      }
    }
    callback2();
  });
}

mongoClient.connect(url, (err, db) => {
  if (err) throw err;
  const translationsCollection = db.db('translator').collection('translations');
  const settingsCollection = db.db('translator').collection('settings');

  // get all available languages for Helppier UI
  settingsCollection.find({
    name: 'Helppier',
  }).toArray((err, result) => {
    toLangs = result[0].lang;
  });

  // get all documents where lang == fromLang (default: PT)
  translationsCollection.find({
    lang: fromLang,
  }).sort({
    componentN: 1,
  }).toArray((err, docs) => {
    // for each lang that Helppier should be available
    async.eachSeries(toLangs, (lang, callback) => {
      // for each document 
      async.each(docs, (doc, callback1) => {
        // iterate over each entry in a doc e execute searchDif for all of them
        async.each(doc.entries, searchDif.bind(null, lang, doc, translationsCollection), (err) => {
          if (err) throw err;
          callback1();
        });
      }, (err) => {
        if (err) throw err;
        // check if there is anything to translate
        if (arrToTranslate.length != 0) {
          // call translateAndUpdate for each array in arrToTranslate
          async.each(arrToTranslate, translateAndUpdate.bind(null, lang, translationsCollection), (err) => {
            if (err) throw err;
            callback(err);
          });
        } else {
          callback();
        }
      });
    }, (err) => {
      if (err) throw err;
      db.close();
    });
  });
});
