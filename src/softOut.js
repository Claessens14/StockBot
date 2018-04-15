var builder = require('botbuilder');
require('dotenv').config();
const roundTo = require('round-to');

var search = require('./search');
var stockCard = require('./stockCard');

function buildStockCard(stock) {
  if (process.env.STOCKDATA) console.log(JSON.stringify(stock, null, 2));

  var todaysSign = "";
  var todaysColor = "";
  
  if (String(stock.quote.change).match("-")) {
      todaysMove = "▼";
      todaysColor = "attention";
  } else {
      todaysMove = "▲";
      todaysColor = "good";
  }

  return {
    'contentType': 'application/vnd.microsoft.card.adaptive',
    'content': {
        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
        'type': 'AdaptiveCard',
        'version': '1.0',
      "body": stockCard.makeHeaderCard(stock, todaysMove, todaysColor)
        
      ,
      "actions": [
        {
          "type": "Action.ShowCard",
          "title": "Stats",
          "size": "large",
          "card": {
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": stockCard.makeStatsCard(stock)
          }
        },
        {
          "type": "Action.ShowCard",
          "title": "News",
          "card": {
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": stockCard.makeNewsCard(stock)
          }
        },
        {
          "type": "Action.ShowCard",
          "title": "Earnings",
          "card": {
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": stockCard.makeEarningsCard(stock)
          }
        },
        {
          "type": "Action.ShowCard",
          "title": "Financials",
          "size": "large",
          "card": {
            "type": "AdaptiveCard",
            "body": stockCard.makeFinCard(stock)
          }
        }
      ]
    }
  }
}

/* build a card that shows multiple markets
*/
function multiMarketCard(array) {
  var body = [];
  array.forEach(function(line) {
    console.log(line);
    var arr = buildMarketCardSlip(line);
    console.log(arr)
    arr.forEach(function(obj) {
      body.push(obj);
    })
  })
  // buildMarketCardSlip(array[0]).forEach(function(el) {
  //   body.push(el);
  // });

  return {    
    'contentType': 'application/vnd.microsoft.card.adaptive',
    'content': {
        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
        'type': 'AdaptiveCard',
        'version': '1.0',
      "body": body
    }
  }
}

/*Build a single card for the market index of choice
*/
function singleMarketCard(data) {
  
  return {    
    'contentType': 'application/vnd.microsoft.card.adaptive',
    'content': {
        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
        'type': 'AdaptiveCard',
        'version': '1.0',
      "body": buildMarketCardSlip(data)
    }
  }
}

/*build the body of the card
*/
function buildMarketCardSlip(data) {
  var change = roundTo(data.close - data.open, 2);
  var changePercent = roundTo(change / data.open, 2);
  var name = data.name.replace(/index/gi, "");

  var todaysSign = "";
  var todaysColor = "";
  if (String(change).match("-")) {
      todaysMove = "▼";
      todaysColor = "attention";
  } else {
      todaysMove = "▲";
      todaysColor = "good";
  }
  return [
        {
          "type": "Container",
          "items": [
            {
              "type": "TextBlock",
              "text": name,
              "size": "medium",
              "isSubtle": true
            },
            {
              "type": "TextBlock",
              "text": data.dateStr,
              "isSubtle": true,
              "spacing": "none"
            }
          ]
        },
        {
          "type": "Container",
          "spacing": "none",
          "items": [
            {
              "type": "ColumnSet",
              "columns": [
                {
                  "type": "Column",
                  "width": "stretch",
                  "items": [
                    {
                      "type": "TextBlock",
                      "text": String(roundTo(Number(data.close), 2)),
                      "separator": true,
                      "size": "extraLarge",
                      "spacing": "large"                      
                    },
                    {
                      "type": "TextBlock",
                      "text": todaysMove+change+" ("+changePercent+"%)",
                      "size": "medium",
                      "color": todaysColor,
                      "spacing": "none"
                    }
                  ]
                },
                {
                  "type": "Column",
                  "width": "auto",
                  "items": [
                    {
                      "type": "FactSet",
                      "facts": [
                        {
                          "title": "Open",
                          "value": String(roundTo(Number(data.open), 2))
                        },
                        {
                          "title": "High",
                          "value": String(roundTo(Number(data.high), 2))
                        },
                        {
                          "title": "Low",
                          "value": String(roundTo(Number(data.low), 2))
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
      
}






module.exports = {
  buildStockCard: buildStockCard,
  singleMarketCard : singleMarketCard,
  multiMarketCard : multiMarketCard
}