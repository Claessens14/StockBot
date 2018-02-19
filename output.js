
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
                                                "text": "$" + stock.quote.latestPrice,
                                                "size": "extraLarge"
                                            },
                                            {
                                                "type": "TextBlock",
                                                "text": todaysMove + stock.quote.change + " (" + stock.quote.changePercent + "%)",
                                                "size": "small",
                                                "color": todaysColor,
                                                "spacing": "none"
                                            },
                                            {
                                                "type": "TextBlock",
                                                "spacing": "none",
                                                "text": stock.company.exchange + " ("+ stock.company.symbol + ")",
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
/*
                            {
                                "type": "Image",
                                "url": "https://cdn.thesimpledollar.com/wp-content/uploads/2008/10/goog.jpg",
                                "width":"strech",
                                "size": "large"
                            },*/
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
                        "title" : "Stats",
                        "size" : "large",
                        "card": {
                            "type":"AdaptiveCard",
                            "body" :[
                                {   
                                    "type": "Container",
                                    "items": [
                                        {
                                            "type": "FactSet",
                                            "facts": [
                                                {
                                                    "title": "Market Cap:",
                                                    "value": dataToStr(stock.stats.marketCap)
                                                },
                                                {
                                                    "title": "P/E:",
                                                    "value": dataToStr(stock.quote.peRatio)
                                                },
                                                {
                                                    "title": "EPS(ttm):",
                                                    "value": dataToStr(stock.stats.ttmEPS)
                                                },
                                                {
                                                    "title": "Divident Yield",
                                                    "value": dataToStr(stock.stats.dividendYield)
                                                },
                                                {
                                                    "title": "Beta:",
                                                    "value": dataToStr(stock.stats.beta)
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
                            "type": "AdaptiveCard",
                            
                            "body": [
                                {
                                    "type": "TextBlock",
                                    "id": "dueDate",
                                    "wrap": "true",
                                    "text": dataToStr(stock.news[0].headline)
                                },
                                {
                                    "type": "TextBlock",
                                    "id": "dueDate",
                                    "wrap": "true",
                                    "text": dataToStr(stock.news[1].headline)
                                }
                            ]
                        }
                    },
                    {
                        "type": "Action.ShowCard",
                        "title" : "Financials",
                        "size" : "large",
                        "card": {
                            "type":"AdaptiveCard",
                            "body" :[
                                {   
                                    "type": "Container",
                                    "items": [
                                        {
                                            "type": "FactSet",
                                            "facts": [
                                                {
                                                    "title": "Revenue",
                                                    "value": dataToStr(stock.financials.financials[1].totalRevenue)
                                                },
                                                {
                                                    "title": "Net Income:",
                                                    "value": dataToStr(stock.financials.financials[1].netIncome)
                                                },
                                                {
                                                    "title": "Total Cash",
                                                    "value": dataToStr(stock.financials.financials[1].totalCash)
                                                },
                                                {
                                                    "title": "Equity:",
                                                    "value": dataToStr(stock.financials.financials[1].shareholderEquity)
                                                },
                                                {
                                                    "title": "CashFlow:",
                                                    "value": dataToStr(stock.financials.financials[1].cashFlow)
                                                },
                                                {
                                                    "title": "Report Date:",
                                                    "value": dataToStr(stock.financials.financials[1].reportDate)
                                                },
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }      
                    }
                ]
            }
        }
}

function dataToStr(value) {
    var str = "";
    if (typeof value == "number") {
        console.log('This is a number ' + value);
        value = roundTo(value, 2);
        str = String(value);
        if (str.match("000")) {
            str = str.replace(/000000000/g, 'B          ');
            str = str.replace(/000000/g, 'M          ');
            str = str.replace(/000/g, 'K         ');
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