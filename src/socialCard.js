var builder = require('botbuilder');
require('dotenv').config();
const roundTo = require('round-to');

var search = require('./search');
var stockCard = require('./stockCard');

/*----------------------------------------------------------------------
Wrap around the contents of the adaptive card
-the adaptive card was originally planned to be different between facebook
and webchat, but now everything is compatable in facebook, so this is a 
bit redundant
----------------------------------------------------------------------*/

/*The first card a user see when the found a stock
  return an adaptive card */
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
/*the statistics card
  return adaptive card */
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

/*earnings card
  return adaptive card */
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

/*news card (DEPRECIRATED?)
  return adaptive card */
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

/* STOCK NEWS
  return an array of hero cards*/
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

/* Stock finicials
  return an adaptive card*/
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

/*STOCK CHART
  return an hero card with the stock chart*/
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
