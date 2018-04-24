var builder = require('botbuilder');
require('dotenv').config();
const roundTo = require('round-to');

var search = require('./search');
var stockCard = require('./stockCard');

/*--------------------------------------------------------------------------
File is for building all card related to the market
----------------------------------------------------------------------------*/

/*MARKET NEWS
return a hero card*/
function marketNews(session, source, title, text, img) {
  if (!text) text = "";
  function checkStr(str) {
    if (str) {
      return str
    } else {
      return " ";
    }
  }
  var imgUrl = "";
  if (img && (img.indexOf(".gif") == -1)) {
    imgUrl = img;
  } else {
    imgUrl = "https://botw-pd.s3.amazonaws.com/styles/logo-original-577x577/s3/0002/1670/brand.gif?itok=IqyVnz-Z";
  }
  var buttons = [];
  //if (title != "" && title  != " " && title != null && text != "" && text != " " && text != null && text != "No summary available.") buttons.push(buttons.push(builder.CardAction.openUrl(session, checkStr(source), "Open")));
  buttons.push(builder.CardAction.openUrl(session, checkStr(source), "Open"));
  return new builder.HeroCard(session)
    .title(checkStr(title))
    .subtitle(checkStr(text))
    .images([
        builder.CardImage.create(session, imgUrl)
    ])
    .buttons(buttons);
}

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
  var change = roundTo(data.close - data.lastClose, 2);
  var changePercent = roundTo(change * 100/ data.lastClose, 2);
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
  multiMarketCard : multiMarketCard,
  marketNews : marketNews
}