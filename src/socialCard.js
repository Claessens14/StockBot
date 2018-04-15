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
//          "backgroundImage": "https://www.samys.com/imagesproc/L2ltYWdlcy9wcm9kdWN0L21haW4vUy0wMDg2MDh4MTAwMC5qcGc=_H_SH400_MW400.jpg",
//"backgroundImage": "http://messagecardplayground.azurewebsites.net/assets/Mostly%20Cloudy-Background-Dark.jpg",
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

    function stripName(str) {
        str = str.replace(/\./g, "");
        str = str.replace(/,/g, "");
        str = str.replace(/!/g, "");
        str = str.replace(/\?/g, "");
        str = str.replace(/\'/g, "");
        str = str.replace(/The/gi, "the");
        str = str.replace(/ company$/gi, "");
        str = str.replace(/ corporation$/gi, "");
        str = str.replace(/ corp$/gi, "");
        str = str.replace(/ co$/gi, "");
        str = str.replace(/ inc/gi, "");
        str = str.replace(/.com$/gi, "");
        str = str.replace(/ Ltd$/gi, "");
        str = str.replace(/ group$/gi, "");
        str = str.replace(/(the)/gi, "");
        str = str.replace(/ /gi, "");
        return str;
    }

    var relevant = []; 
    var irrelevant = []
    var company = stripName(stock.company.companyName);
    stock.news.forEach(function(element) {
      var head = element.headline.toLowerCase().replace(/ /g, "");
      var sum = element.headline.toLowerCase().replace(/ /g, "");
      //var prioritize news that is about the company
      if ((head.indexOf(company) != -1) || (sum.indexOf(company) != -1)) {
      relevant.push(new builder.HeroCard(session)
        .title(checkStr(element.headline))
        .text(checkStr(element.summary))
        .buttons([
            builder.CardAction.openUrl(session, checkStr(element.url), 'Open')
        ]));
      } else {
      irrelevant.push(new builder.HeroCard(session)
        .title(checkStr(element.headline))
        .text(checkStr(element.summary))
        .buttons([
            builder.CardAction.openUrl(session, checkStr(element.url), 'Open')
        ]));
      }
    });
    if (relevant.length > 3) {
      return relevant;
    } else {
      return relevant.concat(irrelevant);
    }
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

function makeChartCard(session, stock, url, title, text) {
  if (!text) text = "";
  return new builder.HeroCard(session)
    .title(title)
    .subtitle(text)
    .images([
        builder.CardImage.create(session, url)
    ])
    .buttons([
        builder.CardAction.openUrl(session, url, "open")
    ]);
}

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
  return new builder.HeroCard(session)
    .title(checkStr(title))
    .subtitle(checkStr(text))
    .images([
        builder.CardImage.create(session, imgUrl)
    ])
    .buttons([
        builder.CardAction.openUrl(session, checkStr(source), "Open")
    ]);
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
  createNewsCards : createNewsCards,
  makeChartCard : makeChartCard,
  marketNews : marketNews
}
