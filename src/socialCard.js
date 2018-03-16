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


module.exports = {
	makeHeaderCard : makeHeaderCard,
	makeStatsCard : makeStatsCard,
	makeEarningsCard : makeEarningsCard,
	makeFinCard : makeFinCard,
	makeNewsCard : makeNewsCard,
  createNewsCards : createNewsCards
}
