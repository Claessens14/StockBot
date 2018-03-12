var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
require('dotenv').config();

var search = require('./search');
var output = require('./output');
var analysis = require('./analysis');

//declare global vars
var workspace=process.env.WATSON_WORKSPACE_ID;
var userHolder = {};   //hold the json object about the user..generated by watson after first call

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create the service wrapper
var conversation = new Conversation({
   username: process.env.WATSON_USERNAME,
   password: process.env.WATSON_PASSWORD,
   url: 'https://gateway.watsonplatform.net/conversation/api',  //idk what this is for
   version_date: Conversation.VERSION_DATE_2017_04_21
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.BOT_APP_ID,
    appPassword: process.env.BOT_PASSWORD,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

// var tableName = 'botdata';
// var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
// var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector, function (session) {

  //console.log("ID client "+ session.message.address.conversation.id);
  //console.log(JSON.stringify(session.message, null, 2));

   var payload = {
      workspace_id: workspace,
      context: userHolder,    //should be no context value when program starts
      input: { text: session.message.text}
   };

   //console.log('________________________________\nPRE CONVO PAYLOAD : \n' + JSON.stringify(payload, null, 2) + '\n________________________________\n');

   conversation.message(payload, function(err, watsonData) {
      if (process.env.WATSONDATA) console.log(JSON.stringify(watsonData));
      if (err) {
         session.send(err);
      } else {
         //console.log(JSON.stringify(response, null, 2));  //console log the JSON array
      if (watsonData.output.text != "") {
         session.send(watsonData.output.text);
      }


      if (watsonData.output.hasOwnProperty('action')) {
        if(watsonData.output.action == "showMarket") {
          var str = watsonData.entities[0].value;
          search.getMarketData(str, (err, data) => {
            console.log(data);
            if (err) {
              callback(err, null)
            } else {
              var card = output.buildMarketCard(data);
              var msg = new builder.Message(session)
                .addAttachment(card);
              console.log(JSON.stringify(card, null, 2));
              session.send(msg);
            }
          });
        }
      }

      if (watsonData.output.hasOwnProperty('action')) {
        if(watsonData.output.action == "findStock") {
          var str = watsonData.entities[0].value;
          var stock = {};
          search.getStock(str, (err, stockJson) => {
            if (err) {
              console.log(err);
            } else {
              
              var msg = new builder.Message(session)
                .addAttachment(output.buildStockCard(str, stockJson, null));
              //console.log(JSON.stringify(msg, null, 2));
              session.send(msg);

              session.send(analysis.reviewStock(stockJson));
            }
          });
          //console.log("(app.js->searchAction)" + stock);
        }
      }



         userHolder = {};
         userHolder = watsonData.context;

         ///console.log('________________________________\nPOST CONVO CONTEXT : ' + JSON.stringify(userHolder, null, 2) + '\n________________________________\n');
      }
   });

});
//bot.set('storage', tableStorage);
