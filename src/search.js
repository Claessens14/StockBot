var request = require('request');


function getPrice(str, callback) {
	getStock(str, (err, quote) => {
		if (err) {
			callback(err, null);
		} else {
			var json = quote;
			callback(null, json[str].quote.latestPrice);
		}
	});
}



function getChartData(str, callback) {
	getStock(str, (err, stock) => {
		if (err) {
			callback(err, null);
		} else {
			var json = stock;
			//console.log(stock);
			var Xarray = [];
			var Yarray = [];
			json[str].chart.forEach(function(element) {
				//console.log(element.close);
				Xarray.push(element.date);
				Yarray.push(element.close);
			});
			callback(null, {Xarray, Yarray});
		}
	});
}

function getStock(str, callback) {
	console.log(str);
	request('https://api.iextrading.com/1.0/stock/' + str + '/batch?types=company,logo,quote,stats,financials,news,chart,earnings', function (err, resp, body) {
		if (err) {
			callback(err, null);
		} else {
			body = JSON.parse(body);
			callback(null, body);
		}
	});
}

function getIndex(symbol, series,  callback) {
	request("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + symbol +  "&interval=" + series + "min&apikey=your_api_key&outputsize=full", function (err, resp, body) {
		if (err) {
			callback(err, null);
		} else {
			body = JSON.parse(body);
			function findData(body, cb) {
			
			var openNum = 0;
			var closeNum = 0;
			var mostRecent = true
			var today = "";
			var hold = "";
			//console.log(body["Time Series (60min)"]);
			var data = body["Time Series (" + series + "min)"]
				try {
					for (var line in data) {
						//console.log(data[line]);
						if (mostRecent) {
							mostRecent = false;
							data[line]["4. close"]
							closeNum = data[line]["4. close"];
							//console.log(line.split() );
							today = line.split(" ")[0];
							//console.log(today);

						} else {
							if (line.match(today)) {
								hold = line;
							} else {
								openNum = data[hold]["1. open"];
								throw "Got Index Data";
							}
						}
					}
				} catch (e) {
					console.log(e);
					cb(today, openNum, closeNum)
				}
				
				
			}

			var log = function (day, open, close) {
				console.log("day: " + day + ", Open " + open + ", close: " + close);
			}
			findData(body, log);


			// console.log(today);
			// console.log("open: " +  openNum + ", close: " + closeNum);
			//callback(null, body);

		}
	});
}

getIndex('^GSPC', "1");

module.exports = {
	getPrice : getPrice,
	getChartData : getChartData,
	getStock : getStock
}

/*
request('https://api.iextrading.com/1.0/stock/market/batch?symbols=aapl&types=quote', function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  console.log('body:', body); // Print the HTML for the Google homepage.
}); */