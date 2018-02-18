var request = require('request');



// function getPrice(str) {
// 	getQuote(str, (err, quote) => {
// 		if (quote.hasOwnProperty('body')) {
// 			return JSON.stringify(quote.body, null, 2);
// 		}
// 	});
// }

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
	request('https://api.iextrading.com/1.0/stock/' + str + '/batch?types=company,logo,quote,stats,financials,news,chart', function (err, resp, body) {
		if (err) {
			callback(err, null);
		} else {
			body = JSON.parse(body);
			callback(null, body);
		}
	});
}





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