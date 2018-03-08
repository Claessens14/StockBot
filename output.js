
var builder = require('botbuilder');
var cloudinary = require('cloudinary');
require('dotenv').config();
const roundTo = require('round-to');

var search = require('./search');
var chart = require('./chart');

cloudinary.config({
    cloud_name: process.env.cloud_id,
    api_key: process.env.cloudinary_api_key,
    api_secret: process.env.cloudinary_app_secret
});


function makeChart(session, str, callback) {
	search.getChartData(str, (err, res) => {
		chart.grapher(str, res.Xarray, res.Yarray, (err, img) => {
            console.log(img);
    //         cloudinary.v2.uploader.upload(img, 
    // function(error, result) {console.log(result)});

            cloudinary.uploader.upload(img, (result) => {
            //console.log(JSON.stringify(result, null, 2));
                url = result.secure_url;

                var card = createHeroCard(session, str, url);
    			var msg = new builder.Message(session).addAttachment(card);
    			// callback(null, msg);
                callback(null, msg);
            });
		});
	});
}


function makeNewsCard(stock) {
    var array = [];
    var i = 0;
    var news = stock.news;
    for (var index in news) {
        var newsLogo = "";
        if (news[index].source === 'CNBC') newsLogo = "https://lh3.googleusercontent.com/z1UDoxRq7-yLISA0gYHYjbxygwTFGQrEe84Tvu9sRi8fA8nmb6MGRu0hU-BJx1i2rdI=w300";
        else if (news[index].source === 'SeekingAlpha') newsLogo = "https://pbs.twimg.com/profile_images/534299535552421888/eHacq8EQ.png";
        else newsLogo = "https://www.exterro.com/legacy/files/2012/04/BREAKING-NEWS.png";
        
        //headlines run off the card
        // function cutStr(str) {
        //     if (str.length)str.slice(0, 30)
        // }

        if (i < 5) {   //number of articles to return
            array.push(
                {
                    "type": "ColumnSet",
                    "separator": true,
                    "columns": [
                        {
                            "type": "Column",
                            "width": "auto",
                            "items": [
                                {
                                    "type": "Image",
                                    "url": newsLogo,
                                    "size": "small",
                                    "spacing": "none"
                                }
                            ]
                        },
                        {
                            "type": "Column",
                            "items": [
                                {
                                    "type": "TextBlock",
                                    "horizontalAlignment": "left",
                                    "text": "   " + news[index].headline,
                                    "weight" : "bolder"
                                },
                                {
                                    "type": "TextBlock",
                                    "horizontalAlignment": "left",
                                    "text": "   " + news[index].datetime
                                }
                            ]
                        }
                    ],
                    "selectAction": {
                    "type": "Action.OpenUrl",
                    "title": "View Friday",
                    "url": news[index].url
                  }
                }
            )
        }
        i++;
    }
    return array;
}

function makeEarningsCard(stock) {

}

function makeFinCard(stock) {
    return [
              {

                "type": "ColumnSet",
                "columns": [
                  {
                    "type": "Container",
                    "items": [
                      {
                        "type": "FactSet",
                        "facts": [
                          {
                            "title": "Revenue",
                            "value": dataToStr(stock.financials.financials[
                              1
                            ].totalRevenue)
                          },
                          {
                            "title": "Net Income:",
                            "value": dataToStr(stock.financials.financials[
                              1
                            ].netIncome)
                          },
                          {
                            "title": "Total Cash",
                            "value": dataToStr(stock.financials.financials[
                              1
                            ].totalCash)
                          },
                          {
                            "title": "Equity:",
                            "value": dataToStr(stock.financials.financials[
                              1
                            ].shareholderEquity)
                          },
                          {
                            "title": "CashFlow:",
                            "value": dataToStr(stock.financials.financials[
                              1
                            ].cashFlow)
                          },
                          {
                            "title": "Report Date:",
                            "value": dataToStr(stock.financials.financials[
                              1
                            ].reportDate)
                          },
                          
                        ]
                      }
                    ]
                  } 
                ]
            }
        ]
}


function buildStockCard(name, stock, chart) {
  console.log("name : ", name);
  console.log(JSON.stringify(stock, null, 2));

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
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "type": "AdaptiveCard",
      "version": "1.0",
      "body": [
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
                      "text": stock.company.companyName,
                      "weight": "bolder",
                      "size": "medium"
                    },
                    {
                      "type": "TextBlock",
                      "text": "$"+stock.quote.latestPrice,
                      "size": "extraLarge"
                    },
                    {
                      "type": "TextBlock",
                      "text": todaysMove+stock.quote.change+" ("+stock.quote.changePercent+"%)",
                      "size": "small",
                      "color": todaysColor,
                      "spacing": "none"
                    },
                    {
                      "type": "TextBlock",
                      "spacing": "none",
                      "text": stock.company.exchange+" ("+stock.company.symbol+")",
                      "isSubtle": true,
                      "wrap": true
                    },
                    {
                      "type": "TextBlock",
                      "text": stock.quote.latestTime,
                      "isSubtle": true
                    }
                  ],
                  
                },
                {
                  "type": "Column",
                  "width": "auto",
                  "items": [
                    {
                      "type": "Image",
                      "url": stock.logo.url,
                      "size": "large",
                      "style": ""
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "Container",
          "items": [
            {
              "type": "ColumnSet",
              "spacing": "large",
              "separator": true,
              "columns": [
                {
                  "type": "Column",
                  "width": "stretch",
                  "items": [
                    {
                      "type": "TextBlock",
                      "text": stock.company.description,
                      "isSubtle": false,
                      "wrap": true
                    }
                  ]
                },
                
              ]
            }
          ]
        }
      ],
      "actions": [
        {
          "type": "Action.ShowCard",
          "title": "Stats",
          "size": "large",
          "card": {
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": [
              {

                "type": "ColumnSet",
                "columns": [
                  {
                    "type": "Container",
                    "items": [
                      {
                        "type": "FactSet",
                        "facts": [
                          {
                            "title": "Volume:",
                            "value": dataToStr(stock.quote.latestVolume)
                          },
                          {
                            "title": "Avg Volume",
                            "value": dataToStr(stock.quote.avgTotalVolume)
                          },
                          {
                            "title": "52 Low",
                            "value": dataToStr(stock.stats.week52low)
                          },
                          {
                            "title": "52 High",
                            "value": dataToStr(stock.stats.week52high)
                          },
                          {
                            "title": "Dividend",
                            "value": dataToStr(stock.stats.dividendYield)
                          },
                          {
                            "title": "Profit Margin",
                            "value": dataToStr(stock.stats.profitMargin)
                          },
                          {
                            "title": "EBITA",
                            "value": dataToStr(stock.stats.EBITDA)
                          },
                          {
                            "title": "50 dayMV",
                            "value": dataToStr(stock.stats.day50MovingAvg)
                          }                       
                        ]
                      }
                    ]
                  },
                  {
                    "type": "Container",
                    "items": [
                      {
                        "type": "FactSet",
                        "facts": [
                          {
                            "title": "Market Cap:",
                            "value": dataToStr(stock.stats.marketcap)
                          },
                          {
                            "title": "EPS:",
                            "value": dataToStr(stock.stats.latestEPS)
                          }, 
                          {
                            "title": "P/E:",
                            "value": dataToStr(stock.quote.peRatio)
                          },
                          {
                            "title": "P/Book:",
                            "value": dataToStr(stock.stats.priceToBook)
                          },
                          {
                            "title": "P/Sales:",
                            "value": dataToStr(stock.stats.priceToSales)
                          },
                          {
                            "title": "Beta:",
                            "value": dataToStr(stock.stats.beta)
                          },
                          {
                            "title": "ShortRatio",
                            "value": dataToStr(stock.stats.shortRatio)
                          },
                          {
                            "title": "200 dayMV",
                            "value": dataToStr(stock.stats.day200MovingAvg)
                          }     
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        },
        {
          "type": "Action.ShowCard",
          "title": "News",
          "card": {
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": makeNewsCard(stock)
          }
        },
        {
          "type": "Action.ShowCard",
          "title": "Earnings",
          "card": {
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": [
              {
                "type": "Container",
                "items": [
                  {
                    "type": "TextBlock",
                    "text": "Publish Adaptive Card schema",
                    "weight": "bolder",
                    "size": "medium"
                  }
                ]
              }
            ]
          }
        },
        {
          "type": "Action.ShowCard",
          "title": "Financials",
          "size": "large",
          "card": {
            "type": "AdaptiveCard",
            "body": makeFinCard(stock)
          }
        }
      ]
    }
  }
}

function buildMarketCard(str) {
  
}

function dataToStr(value) {
    var str = "";
    if (typeof value == "number") {
        console.log('This is a number ' + value);
        value = roundTo(value, 2);
        str = String(value);
        str = str.replace(/\"/g, "");
        str = str.replace(/\'/g, "");
        if (str.match("000")) {
            str = str.replace(/000000000/g, 'B');
            str = str.replace(/000000/g, 'M');
            str = str.replace(/000/g, 'K');
        }
        if (str.length > 9) {
            str = str.replace(/[0-9][0-9][0-9][0-9][0-9][0-9]$/g, 'M');
        } else if (str.length > 7) {
            str = str.replace(/[0-9][0-9][0-9]$/g, 'K');
        }
        if (str == "" || str == null) {
            str = "N/A";
        }
    } else {
        str = JSON.stringify(value, null, 2);
        if (str == null || str == "null") {
            str = "";
        }
    }

    return str;
}

function createHeroCard(session, str, url) {
    return new builder.HeroCard(session)
        .title(str)
        .subtitle('A quick look')
        .text('There is more to come from this company')
        .images([
            builder.CardImage.create(session, url)
        ])
        .buttons([
            builder.CardAction.openUrl(session, url, 'More')
        ]);
}


module.exports = {
    buildStockCard: buildStockCard,
	makeChart : makeChart
}