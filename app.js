if (process.argv.length < 5) {
  // console.log(`node${  process.argv[1]  }filename fromLang toLang`);
  process.exit(1);
}


const MsTranslator = require('mstranslator');
const mongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017'
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
//var dbase = null;




if (process.argv.length >= 5) {
  for (let i = 4; i < process.argv.length; i += 1) {
    toLangs.push(process.argv[i]);
  }
}

mongoClient.connect(url, (err, db) => {
  if (err) throw err;
  dbase = db.db('translator');
 console.log('teste')
  dbase.createCollection('translations', (err, collection) => {
    console.log('Collection created');


    collection.find({"lang": "en"}).forEach((doc) => {  
      let toTranslate = []
      doc.entries.forEach((entries)=>{
        toTranslate.push(entries.value)

      })


toLangs.forEach((lang) => {
  const translation = Object.assign({
    to: lang,
          texts: toTranslate
  }, {
          
    from: params.from,
  });
        
        client.translateArray(translation, (err, result) => {
          //debugger
          if (err) throw err
          // console.log(translation.texts)
          // console.log(result);
          result.forEach((response) => {
            let newDoc = doc
           // let obj = new ObjectID();
            debugger;
            // newDoc.lang
            //collection.updateOne(newDoc,)
          })
        });
      });
      //console.log('oi')
      db.close()

    });
    //db.close()
    

  });
  debugger;
  //db.close();
});
       
// fileData.forEach((dataEntry) => {
//   if (dataEntry.lang === fromLang) {
//     for (i in dataEntry.entries) {
//       toTranslate.push(dataEntry.entries[i].value);
//     }
//   }
// });

//params.texts = toTranslate;

// toLangs.forEach((lang) => {
//   const translation = Object.assign({
//     to: lang,
//   }, {
//     texts: params.texts,
//     from: params.from,
//   });

//   client.translateArray(translation, (err, result) => {
//     console.log(err);
//     console.log(result[1]);
//   });
// });