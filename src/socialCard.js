var builder = require('botbuilder');
require('dotenv').config();
const roundTo = require('round-to');

var search = require('./search');
var stockCard = require('./stockCard');


function makeHeaderCard(stock) {
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

  	}
  } 
}

function makeStatsCard(stock) {
  return {
    'contentType': 'application/vnd.microsoft.card.adaptive',
    'content': {
        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
        'type': 'AdaptiveCard',
        'version': '1.0',
      	"body": stockCard.makeStatsCard(stock)

  	}
  } 
}  

function makeEarningsCard(stock) {
  return {
    'contentType': 'application/vnd.microsoft.card.adaptive',
    'content': {
        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
        'type': 'AdaptiveCard',
        'version': '1.0',
      	"body": stockCard.makeEarningsCard(stock)
  	}
  } 
}   

function makeNewsCard(stock) {
  return {
    'contentType': 'application/vnd.microsoft.card.adaptive',
    'content': {
        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
        'type': 'AdaptiveCard',
        'version': '1.0',
      	"body": stockCard.makeNewsCard(stock)
  	}
  } 
}


function createNewsCards(session, stock) {
    function checkStr(str) {
      if (str) {
        return str
      } else {
        return " ";
      }
    }
    var array = []; 
    stock.news.forEach(function(element) {
      array.push(new builder.HeroCard(session)
      .title(checkStr(element.headline))
      .text(checkStr(element.summary))
      .buttons([
          builder.CardAction.openUrl(session, checkStr(element.url), 'Open')
      ]));
    });
    return array;
  }


function makeFinCard(stock) {
  return {
    'contentType': 'application/vnd.microsoft.card.adaptive',
    'content': {
        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
        'type': 'AdaptiveCard',
        'version': '1.0',
      	"body": stockCard.makeFinCard(stock)
  	}
  } 
}
/*
function buildPortCard(oldStock, newStock) {
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
              "text": oldStock.name,
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
}*/


module.exports = {
	makeHeaderCard : makeHeaderCard,
	makeStatsCard : makeStatsCard,
	makeEarningsCard : makeEarningsCard,
	makeFinCard : makeFinCard,
	makeNewsCard : makeNewsCard,
  createNewsCards : createNewsCards
}
