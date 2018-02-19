var watson = require('watson-developer-cloud');
require('dotenv').config();

var sp500 = require('./assets/sp500names.js');

var conversation = new watson.ConversationV1({
   username: process.env.WATSON_USERNAME,
   password: process.env.WATSON_PASSWORD,
   url: 'https://gateway.watsonplatform.net/conversation/api',  //idk what this is for
   version_date: process.env.WATSON_VERSION
});

var entities = []



for (var i = 0; i < 500; i++) {
  entities.push({
      type: "synonyms",
      value: sp500.array[i].Symbol,
      synonyms: [sp500.array[i].Name]
  });
}



var params = {
  workspace_id: process.env.WATSON_WORKSPACE_ID,
  entity: 'SP500',
  values: entities
}


conversation.createEntity(params, function(err, response) {
  if (err) {
    console.error(err);
  } else {
    console.log(JSON.stringify(response, null, 2));
  }

});