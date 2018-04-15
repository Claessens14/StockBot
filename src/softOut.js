var builder = require('botbuilder');
require('dotenv').config();
const roundTo = require('round-to');

var search = require('./search');
var stockCard = require('./stockCard');

/*--------------------------------------------------------------------------
----------------------------------------------------------------------------*/


/* build a card that shows multiple markets
*/
function multiMarketCard(array) {
  var body = [];
  array.forEach(function(line) {
    var arr = buildMarketCardSlip(line);
    arr.forEach(function(obj) {
      body.push(obj);
    })
  })

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
  var name = data.name   //.replace(/index/gi, "");
  if (name.match(/Dow Jones Industrial Average/gi) != -1) name = name.replace(/index/gi, "");
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
          "spacing": "large",
          "items": [
            {
              "type": "ColumnSet",
              "spacing": "none",
              "columns": [
                {
                  "type": "Column",
                  "width": "stretch",
                  "items": [
                    {
                      "type": "TextBlock",
                      "text": name,
                      "size": "medium",
                      "isSubtle": true,
                    },
                    {
                      "type": "TextBlock",
                      "text": String(roundTo(Number(data.close), 2)),
                      "size": "extraLarge",
                      "spacing": "none"   
                                    
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
                      "type": "TextBlock",
                      "text": data.dateStr,
                      "isSubtle": true
                    },
                    {
                      "type": "FactSet",
                      "spacing": "none",
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
  singleMarketCard : singleMarketCard,
  multiMarketCard : multiMarketCard
}