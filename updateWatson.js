var watson = require('watson-developer-cloud');
require('dotenv').config();

var conversation = new watson.ConversationV1({
   username: process.env.WATSON_USERNAME,
   password: process.env.WATSON_PASSWORD,
   url: 'https://gateway.watsonplatform.net/conversation/api',  //idk what this is for
   version_date: process.env.WATSON_VERSION
});

var params = {
  workspace_id: process.env.WATSON_WORKSPACE_ID,
  entity: 'TSLA',
  values: [
    {
      value: 'Tesla'
    },
    {
      value: 'TESLAS'
    },
    {
      value: 'Tesla Motors'
    }
  ]
};

conversation.createEntity(params, function(err, response) {
  if (err) {
    console.error(err);
  } else {
    console.log(JSON.stringify(response, null, 2));
  }

});