var request = require('request');



// function getPrice(str) {
// 	getQuote(str, (err, quote) => {
// 		if (quote.hasOwnProperty('body')) {
// 			return JSON.stringify(quote.body, null, 2);
// 		}
// 	});
// }

function getPrice(str, callback) {
	getQuote(str, (err, quote) => {
		if (err) {
			callback(err, null);
		} else {
			var json = JSON.parse(quote);
			callback(null, json[str].quote.latestPrice);
		}
	});
}


function getQuote(str, callback) {
	request('https://api.iextrading.com/1.0/stock/market/batch?symbols=' + str + '&types=quote', function (err, response, body) {
		if (err) {
			callback(err, null);
		} else {
			callback(null, body);
		}
	});
}

module.exports = {
	getPrice : getPrice
}

/*
request('https://api.iextrading.com/1.0/stock/market/batch?symbols=aapl&types=quote', function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  console.log('body:', body); // Print the HTML for the Google homepage.
}); */