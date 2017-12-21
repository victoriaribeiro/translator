if (process.argv.length < 5) {
  // console.log(`node${  process.argv[1]  }filename fromLang toLang`);
  process.exit(1);
}

const MsTranslator = require('mstranslator');

const key = 'a56ac805d4664a66b5b8313b0329d6be';
const filename = process.argv[2];
const toTranslate = [];
const fromLang = process.argv[3];
const toLangs = [];

const client = new MsTranslator({
  api_key: key,
}, true);

const params = {
  texts: '',
  from: fromLang,
  to: '',
};
const fileData = require(filename);


if (process.argv.length >= 5) {
  for (let i = 4; i < process.argv.length; i += 1) {
    toLangs.push(process.argv[i]);
  }
}

fileData.forEach((dataEntry) => {
  if (dataEntry.lang === fromLang) {
    for (i in dataEntry.entries) {
      toTranslate.push(dataEntry.entries[i].value);
    }
  }
});

params.texts = toTranslate;

toLangs.forEach((lang) => {
  const translation = Object.assign({
    to: lang,
  }, {
    texts: params.texts,
    from: params.from,
  });

  client.translateArray(translation, (err, result) => {
    console.log(err);
    console.log(result);
  });
});
