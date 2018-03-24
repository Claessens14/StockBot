var restify = require('restify');
var fs = require('fs');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
require('dotenv').config();

var search = require('./search');
var softOut = require('./softOut');
var analysis = require('./analysis');
var socialCard = require('./socialCard');
var portfolio = require('./portfolio');
//var users = require('../assets/users.json');

var users = require('../assets/users.json');


//declare global vars
var workspace=process.env.WATSON_WORKSPACE_ID;

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
  if (process.env.MESSAGE == "TRUE") console.log('________________________________\nMESSAGE : \n' + JSON.stringify(session.message, null, 2) + '\n________________________________\n');;

  session.sendTyping();

  //before sending to watson..
  session.message.text = session.message.text.replace(/^#/, "teach me about ");

   var payload = {
      workspace_id: workspace,
      context: getUser(session.message.user.name),    //should be no context value when program starts
      input: { text: session.message.text}
   };

   if (process.env.PAYLOAD == "TRUE") console.log('________________________________\nPRE CONVO PAYLOAD : \n' + JSON.stringify(payload, null, 2) + '\n________________________________\n');
   conversation.message(payload, function(err, watsonData) {
      if (process.env.WATSONDATA == "TRUE") console.log('________________________________\nWATSONDATA : \n' + JSON.stringify(watsonData, null, 2) + '\n________________________________\n');

      if (err) {
         session.send(err);
      } else {
         //console.log(JSON.stringify(response, null, 2));  //console log the JSON array
      if (watsonData.output.text && watsonData.output.text != "") {
         console.log(watsonData.output.text);
         var i = 0
         watsonData.output.text.forEach(function(element) {
            ///session.send(element)
            var suggest = new builder.Message(session)
              .text(element)
              .suggestedActions(
                builder.SuggestedActions.create(
                    session, [
                      builder.CardAction.imBack(session, "educate", "educate"),
                      builder.CardAction.imBack(session, "portfolio", "portfolio"),
                      builder.CardAction.imBack(session, "market", "market"), 
                      builder.CardAction.imBack(session, "news", "news")
                    ]
                  ));
            session.send(suggest);
         });
      }

      //show marketData!
      if (watsonData.output.hasOwnProperty('action')) {
        function searchMarket(str) {
            search.getMarketData(str, (err, data) => {
              if (process.env.MARKETDATA == "TRUE") console.log('________________________________\nSHOW CARD : \n' + JSON.stringify(data, null, 2) + '\n________________________________\n');
              if (err) {
                callback(err, null)
              } else {
                var card = softOut.buildMarketCard(data);
                var msg = new builder.Message(session)
                  .addAttachment(card)
                  .suggestedActions(
                    builder.SuggestedActions.create(
                      session, [
                        builder.CardAction.imBack(session, "educate", "educate"),
                        builder.CardAction.imBack(session, "portfolio", "portfolio"),
                        builder.CardAction.imBack(session, "market", "market"), 
                        builder.CardAction.imBack(session, "news", "news")
                      ]
                  ));
                 if (process.env.SHOWCARD == "TRUE") console.log('________________________________\nSHOW CARD : \n' + JSON.stringify(card, null, 2) + '\n________________________________\n');
                session.send(msg);
              }
            });
        }
        //send market data!
        if(watsonData.output.action == "showMarket") {
          var str = watsonData.entities[0].value;
          searchMarket(str);
        } else if(watsonData.output.action == "rollout") {
          searchMarket("DJI");
          searchMarket("GSPC");
          searchMarket("IXIC");
        }
      }


      if (watsonData.context.hasOwnProperty('mode')) {
        if(watsonData.context.mode == "stock") {
          var str = getEntity(watsonData, "SP500")
          var stock = {};
          //if a new search then show header
          if (str) {
            search.getStock(str, (err, stockJson) => {
              if (err) {
                console.log(err);
              } else {
                watsonData.context.lastStock = str;
                watsonData.context["stock"] = stockJson;

                if ((session.message.address.channelId === "webchat") || (session.message.address.channelId === "emulator")) {
                  var msg = new builder.Message(session)
                    .addAttachment(softOut.buildStockCard(stockJson));
                  session.send(msg);
                  session.send(analysis.reviewStock(stockJson));
                } else {
                  var msg = new builder.Message(session)
                    .addAttachment(socialCard.makeHeaderCard(stockJson));
                  session.send(msg);

                  if (watsonData.output.action) {
                    sendData(session, stockJson, watsonData.output.action);
                      // var temp = updatePortfolio(session, watsonData, watsonData.output.action);
                      // watsonData.context.portfolio = {};
                      // watsonData.context.portfolio = temp;
                  }                
                  //attach insight
                  var insight = new builder.Message(session)
                    .text(analysis.reviewStock(stockJson))
                    .suggestedActions(
                      builder.SuggestedActions.create(
                          session, [
                            builder.CardAction.imBack(session, "add to portfolio", "add to portfolio"),
                            builder.CardAction.imBack(session, "earnings", "earnings"),
                            builder.CardAction.imBack(session, "ratios", "ratios"),
                            builder.CardAction.imBack(session, "financials", "financials"), 
                            builder.CardAction.imBack(session, "news", "news")
                          ]
                        ));
                  session.send(insight);
                }
              }
            });
          } else if (watsonData.context.lastStock && watsonData.output.action) {
            //if there is a stock to talk about and an action
            if (watsonData.output.action) {
              sendData(session, watsonData.context.stock, watsonData.output.action);
              // var temp = updatePortfolio(session, watsonData, watsonData.output.action);
              // watsonData.context.portfolio = {};
              // watsonData.context.portfolio = temp;
            }
          } else {
            console.log("ERROR : no stock found in entity or context")
          }
        }
      }

      //show portfolio
      if (watsonData.output.hasOwnProperty('action') && watsonData.output.action === "showPortfolio") {
        session.send("Stock \\n hey");
      }

      //if the anything else node is triggered, log it
      if (watsonData.output.hasOwnProperty('action') && watsonData.output.action === "logRequest") {
        fs.appendFile('./log/anythingElse.csv', session.message.user.name + ', ' +  session.message.text + '\n', function (err) {
          if (err) return console.log(err);
        });
      }

      //save user
      watsonData.context["user"] = session.message.address;
      putUser(session.message.user.name, watsonData.context);
      }
   });

});

function sendData(session, stock, action) {
  if (stock) {
    var card = {};
    if (action == "wantStats") {
      var msg = new builder.Message(session);
      card = socialCard.makeStatsCard(stock);
      msg.addAttachment(card);
      session.send(msg);
    } else if (action == "wantEarnings") {
      var msg = new builder.Message(session);
      card = socialCard.makeEarningsCard(stock);
      msg.addAttachment(card);
      session.send(msg);
    } else if (action == "wantNews") {
        var cards = socialCard.createNewsCards(session, stock);
        var reply = new builder.Message(session)
          .attachmentLayout(builder.AttachmentLayout.carousel)
          .attachments(cards);
        session.send(reply);
    } else if (action == "wantFin") {
      var msg = new builder.Message(session);
      card = socialCard.makeFinCard(stock)
      msg.addAttachment(card);
      session.send(msg);
    } else {
      console.log("(sendData) Does not know of this action : " + action);
    }
  }
  if (process.env.SHOWCARD == "TRUE") console.log('________________________________\nSHOW CARD : \n' + JSON.stringify(card, null, 2) + '\n________________________________\n');
}

// function updatePortfolio(session, watsonData, action) {
//   if (watsonData.output.hasOwnProperty('action') && watsonData.output.action === "addToPortfolio") {
//         portfolio.addStock(watsonData.context.portfolio, watsonData.context.stock, (msg, portfolio) => {
//           session.send(msg);
//           return portfolio;
//         });
//       }    
//   if (watsonData.output.hasOwnProperty('action') && watsonData.output.action === "removeFromPortfolio") {
//     portfolio.removeStock(watsonData.context.portfolio, watsonData.context.lastStock, (msg, portfolio) => {
//       session.send(msg);
//       return portfolio;
//     });
//   }  
// }


 function getEntity(watsonData, entity) {
  if (watsonData.entities) {
    for (var i in watsonData.entities) {
      if (watsonData.entities[i].entity == entity) {
        return watsonData.entities[i].value;
      }
    }
    return null;
  }
}

function getUser(name) {
  return users[name]
}

function putUser(name, data) {
  users[name] = data;
  fs.writeFile('./assets/users.json', JSON.stringify(users, null, 2), function (err) {
    if (err) return console.log(err);
  });
}


//bot.set('storage', tableStorage);
