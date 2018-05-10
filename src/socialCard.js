var builder = require('botbuilder');
require('dotenv').config();
const roundTo = require('round-to');

var search = require('./search');
var stockCard = require('./stockCard');
var format = require('./format');

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
  if (stock == null || stock == {}) return null;  //I shouldnt need this
  var todaysSign = "";
  var todaysColor = "";
  var todaysMovePercent = roundTo(stock.quote.changePercent * 100, 2)
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
      	"body": stockCard.makeHeaderCard(stock, todaysMove, todaysMovePercent, todaysColor) 
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

/* STOCK NEWS
  return an json with an array of hero cards
  and a array of quick reads */
function createNewsCards(session, stock) {
  if (!session || !stock) return null;
  if (stock.news) {
    var array = [];  //an array of session objects
    var news = [];   //array of quick read data
    stock.news.forEach(function(el) {
      el.headline = format.checkStr(el.headline);
      el.summary = format.checkStr(el.summary);
      el.url = format.checkStr(el.url);
      if (el.headline == null) el.headline = "";
      if (el.summary == null) el.summary = "";
      if (el.url == null) el.url = "";

      if (el.headline != "") {
        array.push(new builder.HeroCard(session)
          .title(format.checkStr(el.headline))
          .text(format.checkStr(el.summary))
          .buttons([
            builder.CardAction.imBack(session, el.headline, "Quick Read"),
            builder.CardAction.openUrl(session, format.checkStr(el.url), 'Open')
          ])
        );
      
        var title = el.headline;
        var sum = el.summary;
        if (sum != "") {
          news.push({"title" : title, "sum" : sum});
        } else {
          news.push({"title" : title, sum : "Sorry but there is no summary Availble"});
        }
      }
    });
    return {"cards" : array, "news" : news};
  } else {
    return null;
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

/*STOCK PEERS
  return an hero card with stock chart*/
function makePeersCards(session, stocks) {
  if (!stocks) return null;
  var cards = [];
  for (var sym in stocks) {
    if (stocks[sym].quote && stocks[sym].quote.companyName != "") {
      var logo = "";
      if (stocks[sym].logo && stocks[sym].logo.url) {
        logo = stocks[sym].logo.url;
      } else {
        logo = "https://www.ledr.com/colours/white.jpg";
      }
      console.log(stocks[sym].quote.companyName + ',  ' + sym +  ',  ' + logo);
      
      cards.push(new builder.HeroCard(session)
        .title(stocks[sym].quote.companyName)
        .images([
            builder.CardImage.create(session, logo)
        ])
        .buttons([
            builder.CardAction.imBack(session, sym, sym)
        ])
      )
    }
  }
  if (cards.length > 0) {
    return cards;
  } else {
    return null;
  }
  
}



module.exports = {
	makeHeaderCard : makeHeaderCard,
	makeStatsCard : makeStatsCard,
	makeEarningsCard : makeEarningsCard,
	makeFinCard : makeFinCard,
	// makeNewsCard : makeNewsCard,
  createNewsCards : createNewsCards,
  makeChartCard : makeChartCard,
  makePeersCards : makePeersCards

}
