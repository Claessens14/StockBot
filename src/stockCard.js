var builder = require('botbuilder');
require('dotenv').config();
const roundTo = require('round-to');

var dataToStr = require('./format.js').dataToStr;

/*----------------------------------------------------------------------------------
Build all the adaptive card items for a stock
----------------------------------------------------------------------------------*/

function makeHeaderCard(stock, todaysMove, todaysMovePercent, todaysColor) {
  var companyName = stock.company.companyName.replace(/\(the\)/gi, "");
  return [
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
                      "text": companyName,
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
                      "text": todaysMove+stock.quote.change+" ("+ todaysMovePercent +"%)",
                      "size": "medium",
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
                      "spacing": "none",
                      "text": stock.quote.latestTime,
                      "isSubtle": true
                    },
                    {
                      "type": "TextBlock",
                      "text": stock.company.sector,
                      "isSubtle": true
                    },
                    {
                      "type": "TextBlock",
                      "spacing": "none",
                      "text": stock.company.industry,
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
                      "style": "default"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "Container",
          "spacing": "none",
          "items": [
            {
              "type": "ColumnSet",
              "separator": true,
              "columns": [
                {
                  "type": "Column",
                  "width": "auto",
                  "items": [
                    {
                      "type": "FactSet",
                      "facts": [
                        {
                            "title": "Volume:",
                            "value": dataToStr(stock.quote.latestVolume)
                          },
                          {
                            "title": "Dividend",
                            "value": dataToStr(stock.stats.dividendYield) + '%'
                          },
                          {
                            "title": "Profit Margin",
                            "value": dataToStr(stock.stats.profitMargin)  + '%'
                          },
                      ]
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
                            "title": "Market Cap:",
                            "value": dataToStr(stock.stats.marketcap)
                          }, 
                          {
                            "title": "P/E:",
                            "value": dataToStr(stock.quote.peRatio)
                          },
                          {
                            "title": "EPS:",
                            "value": dataToStr(stock.stats.latestEPS)
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

function makeStatsCard(stock) {
	return [
			{
          "type": "Container",
          "spacing": "none",
          "items": [
            {
              "type": "TextBlock",
              "text": "Stats",
              "size": "extraLarge"
            },
            {
              "type": "ColumnSet",
              "columns": [
                {
                  "type": "Column",
                  "width": "auto",
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
                            "value": dataToStr(stock.stats.dividendYield) + '%'
                          },
                          {
                            "title": "Profit Margin",
                            "value": dataToStr(stock.stats.profitMargin)  + '%'
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
                  "type": "Column",
                  "width": "auto",
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
    ];
}


function makeFinCard(stock) {
    fin = stock.financials.financials;
    var i = getBestIndex(fin);
    return [
      {
        "type": "Container",
        "items": [
          {
            "type": "TextBlock",
            "text": "Financials",
            "size": "extraLarge"
          },
          {
            "type": "FactSet",
            "facts": [ 
              {
                "title": "Total Revinue:",
                "value": dataToStr(fin[i].totalRevenue)
              },
              {
                "title": "Operating Revinue:",
                "value": dataToStr(fin[i].operatingRevenue)
              },
              {
                "title": "Cost of Revinue:",
                "value": dataToStr(fin[i].costOfRevenue)
              },
              {
                "title": "Gross Profit:",
                "value": dataToStr(fin[i].grossProfit)
              },
              {
                "title": "Operating Income:",
                "value": dataToStr(fin[i].operatingIncome)
              },
              {
                "title": "Operating Expenses:",
                "value": dataToStr(fin[i].operatingExpense)
              },
              {
                "title": "R & D:",
                "value": dataToStr(fin[i].researchAndDevelopment)
              },
              {
                "title": "Net Income:",
                "value": dataToStr(fin[i].netIncome)
              },
              {
                "title": "____________________",
                "value": " "
              },
              {
                "title": "Total Assets:",
                "value": dataToStr(fin[i].totalAssets)
              },
              {
                "title": "Current Assets:",
                "value": dataToStr(fin[i].totalLiabilities)
              },
              {
                "title": "Total Liabilities:",
                "value": dataToStr(fin[i].totalLiabilities)
              },
              {
                "title": "Current Cash:",
                "value": dataToStr(fin[i].currentCash)
              },
              {
                "title": "Current Debt:",
                "value": dataToStr(fin[i].currentDebt)
              },
              {
                "title": "Total Cash:",
                "value": dataToStr(fin[i].totalCash)
              },
              {
                "title": "Total Debt:",
                "value": dataToStr(fin[i].totalDebt)
              },
              {
                "title": "ShareHolder Equity:",
                "value": dataToStr(fin[i].shareholderEquity)
              },
              {
                "title": "____________________",
                "value": ""
              },
              {
                "title": "Cash Change:",
                "value": dataToStr(fin[i].cashChange)
              },
              {
                "title": "Cash Flow:",
                "value": dataToStr(fin[i].cashFlow)
              },
              {
                "title": "Operating G & L:",
                "value": dataToStr(fin[i].operatingGainsLosses)
              },
              {
                "title": "Report Date:",
                "value": dataToStr(fin[i].reportDate)
              }                          
            ]
          }
        ]
      }
    ]
}


function makeEarningsCard(stock) {
  if (!(stock && stock.earnings && stock.earnings.earnings)) {
    return null;
  }
  earn = stock.earnings.earnings;
  var i = 0;
  if (typeof earn[0].EPSSurpriseDollar == "number") {
    i = 0;
  } else if (typeof earn[1].EPSSurpriseDollar == "number") {
    i = 1;
  }
    return [
      {
        "type": "Container",
        "items": [
          {
            "type": "ColumnSet",
            "columns": [
              {
                "type": "Column",
                "items": [
                  {
                    "type": "TextBlock",
                    "text": "Earnings:   " + earn[i].fiscalPeriod,
                    "size": "extraLarge",
                    "horizontalAlignment": "left"
                  }
                ]
              }
            ]
          },
          {
            "type": "FactSet",
            "facts": [ 
              {
                "title": "Actual EPS:",
                "value": dataToStr(earn[i].actualEPS)
              },
              {
                "title": "Consenus EPS:",
                "value": dataToStr(earn[i].consensusEPS)
              },
              {
                "title": "Estimated EPS:",
                "value": dataToStr(earn[i].estimatedEPS)
              },
              {
                "title": "EPS Surprise:",
                "value": dataToStr(earn[i].EPSSurpriseDollar)
              },
              {
                "title": "Number of Est:",
                "value": dataToStr(earn[i].announceTime)
              },
              {
                "title": "EPS Suprise:",
                "value": dataToStr(earn[i].numberOfEstimates)
              },
              {
                "title": "EPS Report Date:",
                "value": dataToStr(earn[i].EPSReportDate)
              },
              {
                "title": "Fiscal Period:",
                "value": dataToStr(earn[i].fiscalPeriod)
              },
              {
                "title": "Fiscal End Date:",
                "value": dataToStr(earn[i].fiscalEndData)
              }                     
            ]
          }
        ]
      }
    ]
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
        function cutStr(str) {
            if (str.length > 30) return str.slice(0, 30) + "..."
        }
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
                                    "text": "   " + cutStr(news[index].headline),
                                    "weight" : "bolder"
                                },
                                {
                                    "type": "TextBlock",
                                    "horizontalAlignment": "left",
                                    "text": "   " + news[index].datetime
                                }
                            ]
                        }
                    ]
                }
            )
        }
        i++;
    }
    return array;
}

//takes in array of json, if the object has most things filled then it will return the first in the array
function getBestIndex(array) {
  var empty = 0;
  for (key in array[0]) {
    if (key == "" || key == null) {
      empty++;
    }
  }
  if (array.length > 0) {
    if ((empty / array.length) > 0.5) {
      return 0;  //use the zero index
    } else {
      return 1;  //use the data in the next index
    }
  }
}

module.exports = {
	makeHeaderCard : makeHeaderCard,
	makeStatsCard : makeStatsCard,
	makeEarningsCard : makeEarningsCard,
	makeFinCard : makeFinCard,
	makeNewsCard : makeNewsCard
}
