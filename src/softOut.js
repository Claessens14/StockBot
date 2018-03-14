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

function buildMarketCard(data) {
  var change = roundTo(data.close - data.open, 2);
  var changePercent = roundTo(change / data.open, 2);

  var todaysSign = "";
  var todaysColor = "";
  if (String(change).match("-")) {
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
      "body": [
        {
          "type": "Container",
          "items": [
            {
              "type": "TextBlock",
              "text": data.name,
              "size": "medium",
              "isSubtle": true
            },
            {
              "type": "TextBlock",
              "text": data.dateStr,
              "isSubtle": true
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
                      "text": data.close,
                      "size": "extraLarge"
                    },
                    {
                      "type": "TextBlock",
                      "text": todaysMove+change+" ("+changePercent+"%)",
                      "size": "small",
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
                          "value": data.open
                        },
                        {
                          "title": "High",
                          "value": data.high
                        },
                        {
                          "title": "Low",
                          "value": data.low
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
  }
}







module.exports = {
  buildStockCard: buildStockCard,
  buildMarketCard : buildMarketCard
}