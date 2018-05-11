require('dotenv').config();
var fs = require('fs');
var request = require('request');

var iex = require('../assets/data/iexList.json');
var market = require('../assets/data/market.json');
var sp500 = require('../assets/data/sp500names.js').array;

var str = "";
var dir = './assets/data/';

if (process.argv.length > 1) {
    if (process.argv[2] == "getList") {
        getList();
    } else if (process.argv[2] == "getIndustry") {
        getIndustry();
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






