
var builder = require('botbuilder');
var cloudinary = require('cloudinary');
require('dotenv').config();

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
return {
            'contentType': 'application/vnd.microsoft.card.adaptive',
            'content': {
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": [
                {
                    "type": "Container",
                    "items": [
                        {
                            "type": "TextBlock",
                            "text": stock[name].quote.companyName,
                            "weight": "bolder",
                            "size": "medium"
                        },
                        {
                            "type": "Image",
                            "url": "https://cdn.thesimpledollar.com/wp-content/uploads/2008/10/goog.jpg",
                            "width":"strech",
                            "size": "large"
                        },
                        {
                            "type": "ColumnSet",
                            "columns": [
                                
                                {
                                    "type": "Column",
                                    "width": "stretch",
                                    "items": [
                                        {
                                            "type": "TextBlock",
                                            "text": "$" + stock[name].quote.latestPrice,
                                            "weight": "bolder",
                                            "wrap": true
                                        },
                                        {
                                            "type": "TextBlock",
                                            "spacing": "none",
                                            "text": stock[name].quote.primaryExchange + " ("+ stock[name].quote.ticker + ")",
                                            "isSubtle": true,
                                            "wrap": true
                                        },
                                        {
                                            "type": "TextBlock",
                                            "spacing": "noe",
                                            "text": "An Electric car company founded in California, makers of the famous modul S, model X, and model 3.",
                                            "isSubtle": false,
                                            "wrap": true
                                        }
                                        
                                    ]
                                },
                                {
                                    "type": "Column",
                                    "width": "auto",
                                    "items": [
                                        {
                                            "type": "Image",
                                            "url": "http://www.carlogos.org/logo/Tesla-logo-2003-2500x2500.png",
                                            "size": "small",
                                            "style": ""
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            "actions": [
                {
                    "type": "Action.ShowCard",
                    "title" : "Ratios",
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
                                                "title": "P/E:",
                                                "value": "23"
                                            },
                                            {
                                                "title": "EPS:",
                                                "value": "$2.75"
                                            },
                                            {
                                                "title": "DY:",
                                                "value": "3.12%"
                                            },
                                            {
                                                "title": "Beta:",
                                                "value": "1.3"
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
                                "text": "Responding to a recent event involving a Tesla Model 3 crash, CEO Elon Musk announced that the electric car maker would be rolling out a software update to address observations about the car’s glove box that were shared by the ill-fated vehicle’s driver online. Musk also teased an addition to the glass 15-inch center touchscreen of the electric car, which would make the Model 3 even safer in the event of an accident."
                            }
                        ]
                    }
                },
                {
                    "type": "Action.ShowCard",
                    "title" : "Fundimentals",
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
                                                "title": "Revinue:",
                                                "value": "5 183 million"
                                            },
                                            {
                                                "title": "Gross Profit:",
                                                "value": "543 million"
                                            },
                                            {
                                                "title": "Net Profit",
                                                "value": "142 million"
                                            },
                                            {
                                                "title": "Net Assets:",
                                                "value": "6 943 million"
                                            },
                                            {
                                                "title": "Long Term Debt:",
                                                "value": "8 972 million"
                                            },
                                            {
                                                "title": "Short Term Debt:",
                                                "value": "972 million"
                                            }
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