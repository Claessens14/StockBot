require('dotenv').config();
var fs = require('fs');
var request = require('request');

var iex = require('../assets/data/iexList.json');
var industry = require('../assets/data/industry.json');
var sector = require('../assets/data/sector.json');
var market = require('../assets/data/market.json');
var outlook = require('../assets/data/outlook.json');
var sp500 = require('../assets/data/sp500names.js').array;

var str = "";
var dir = './assets/data/';

/*--------------------------------------------------------
This File is for deriving static stock market information
----------------------------------------------------------*/

if (process.argv.length > 1) {
    if (process.argv[2] == "getList") {
        getList();
    } else if (process.argv[2] == "getIndustry") {
        getIndustry();
    } else if (process.argv[2] == "getSectors") {
        getSectors();
    } else if (process.argv[2] == "bestIndex") {
        bestIndex(process.argv[3]);
    } else {
        console.log("No command line argv was given");
        //getIndustry();
    }
}


function getList() {
    fs.writeFile(dir + 'market.json', "", function (err) {
        if (err) return console.log(err);
    });

    for (var obj in iex) {
        if (iex[obj].symbol && iex[obj].symbol && iex[obj].isEnabled && iex[obj].isEnabled == true) {
            str = str + iex[obj].symbol + ',';
            if (str.length > 1000) {
                str = str.replace(/,$/gi, '');
                batchSearch(str, (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        fs.appendFile(dir + 'market.json', JSON.stringify(res, null, 2) + ',', function (err) {
                            if (err) return console.log(err);
                        });
                    }
                });
                str = "";
            }
        }
    } 
}

function getIndustry() {
    if (!market || market == {}) return console.log("ERROR: market is not set right");
    var industry = {};
    var spIndustry = {};
    for (var i in market) {
        if (market[i]) {
            for (var j in market[i]) {
                var stock = market[i][j];
                if (stock && stock.company && stock.company.industry && stock.company.industry != "") {
                    if (industry[stock.company.industry]) {
                        industry[stock.company.industry].push(stock);
                    } else {
                        industry[stock.company.industry] = [stock];
                    }
                    for (var k in sp500) {
                        if (sp500[k] && sp500[k].Symbol && sp500[k].Symbol == stock.company.symbol) {
                            console.log(stock.company.symbol)
                            if (spIndustry[stock.company.industry]) {
                                spIndustry[stock.company.industry].push(stock);
                            } else {
                                spIndustry[stock.company.industry] = [stock];
                            }
                        }
                    }
                    console.log("SP500 length : " + sp500.length);
                }
            }
        }
    }
    fs.writeFile(dir + 'industry.json', JSON.stringify(industry, null, 2), function (err) {
        if (err) return console.log(err);
    });
    fs.writeFile(dir + 'spIndustry.json', JSON.stringify(spIndustry, null, 2), function (err) {
        if (err) return console.log(err);
    });

}

function getSectors() {
    if (!market || market == {}) {
        console.log('ERROR (getSectors) getSectors is not set correctly');
        return;
    }

    var sector = {};
    var spSector = {};
    for (var i in market) {
        if (market[i]) {
            for (var j in market[i]) {
                var stock = market[i][j];
                if (stock && stock.company && stock.company.sector && stock.company.sector != "") {
                    if (sector[stock.company.sector]) {
                        sector[stock.company.sector].push(stock);
                    } else {
                        sector[stock.company.sector] = [stock];
                    }
                    for (var k in sp500) {
                        if (sp500[k] && sp500[k].Symbol && sp500[k].Symbol == stock.company.symbol) {
                            //console.log(stock.company.symbol)
                            if (spSector[stock.company.sector]) {
                                spSector[stock.company.sector].push(stock);
                            } else {
                                spSector[stock.company.sector] = [stock];
                            }
                        }
                    }
                    // console.log("SP500 length : " + sp500.length);
                }
            }
        }
    }
    fs.writeFile(dir + 'sector.json', JSON.stringify(sector, null, 2), function (err) {
        if (err) return console.log(err);
    });
    fs.writeFile(dir + 'spSector.json', JSON.stringify(spSector, null, 2), function (err) {
        if (err) return console.log(err);
    });
}

function bestIndex(build) {
    if (!sector || sector == {} || !industry || industry == {}) {
        console.log("ERROR (bestIndex) something is set to null");
        return;
    }
    if (build) {  
        outlook = {};
        for (var sec in sector) {
            var maxm = 0;
            for(var i in sector[sec]) {
                var stock = sector[sec][i];
                if (stock && stock.company && stock.company.sector && stock.company.sector != "" && stock.company.issueType && stock.company.issueType == 'et') {
                    if (stock.quote && stock.quote.marketCap && stock.quote.marketCap > maxm) {
                        outlook[stock.company.sector] = stock;
                        maxm = stock.quote.marketCap;
                    }
                }
            }
        }
        for (var ind in industry) {
            var maxm = 0;
            for(var i in industry[ind]) {
                var stock = industry[ind][i];

                if(stock && stock.company && stock.company.industry && stock.company.industry != "" && stock.company.issueType && stock.company.issueType == 'et') {
                    
                    if (stock.quote && stock.quote.marketCap && stock.quote.marketCap > maxm) {
                        
                        outlook[stock.company.industry] = stock;
                        maxm = stock.quote.marketCap;
                        // console.log(' MAX ' + maxm)
                    }
                }
            }
        }
        console.log(outlook)
            fs.writeFile(dir + 'outlook.json', JSON.stringify(outlook, null, 2), function (err) {
                    if (err) return console.log(err);
                });
        
        // var list = {};
        // for (var sec in sector) {
        //     var indArray = [];
        //     for (i in sector[sec]) {
        //         var stock = sector[sec][i];
        //         if(stock && stock.company && stock.company.industry && stock.company.industry != "" && stock.company.sector && stock.company.sector != "") {
        //             var newInd = true;
        //             var tempArray = indArray;
        //             for (var ind in indArray) {
        //                 //indArray is the object
        //                 if (stock.company.industry == ind) {
        //                     newInd = false;
        //                     indArray[ind].push(stock);
        //                 }
        //             }
        //             if (newInd == true) {
        //                 indArray[stock.company.industry] = [stock];
        //             }
        //         }
        //     }
        //     list[sec] = indArray;
        // }
        // outlook = list;
        // fs.writeFile(dir + 'outlook.json', JSON.stringify(outlook, null, 2), function (err) {
        //     if (err) return console.log(err);
        // });
    }

    // for (i in market) {
    //     var stock = market[i];
    //     if (stock.company && stock.company.issueType && stock.company.issueType == "et" && stock.company.companyName && stock.company.issueType != "") {
    //         if (outlook[stock.company.sector][stock.company.industry]) {
    //             outlook[stock.company.sector][stock.company.industry] = [stock.company.companyName].concat(outlook[stock.company.sector][stock.company.industry]);
    //         }
    //     }
    // }
    // console.log(outlook)




    
}

function batchSearch(str, callback) {
    var url = 'https://api.iextrading.com/1.0/stock/market/batch?symbols=' + str + '&types=company,quote';
    request(url, function (err, resp, body) {
		if (err) {
			callback("ERROR (batchSearch) request returned a error " + err, null);
		} else {
			try {
				body = JSON.parse(body);
				body["url"] = url;
			} catch (e) {
				return callback("ERROR (batchSearch) JSON.parse failed!" + e, null);
			}
			callback(null, body);
		}
	});
}




