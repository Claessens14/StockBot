



function addStock(portfolio, stock, callback) {
	if (stock) {
		if (portfolio && portfolio.hasOwnProperty(stock.quote.symbol)) {
			callback("This stock is already in your portfolio", portfolio);
		} else if (portfolio) {
			portfolio[stock.quote.symbol] = {
				"ticker" : stock.quote.symbol,
				"name" : stock.quote.companyName,
				"priceAdded" : stock.quote.latestPrice,
				"sector" : stock.quote.sector
			}
			callback("Added!", portfolio);
		} else {
			var portfolio = {};
			portfolio[stock.quote.symbol] = {
				"ticker" : stock.quote.symbol,
				"name" : stock.quote.companyName,
				"priceAdded" : stock.quote.latestPrice,
				"sector" : stock.quote.sector
			}
			callback("Added!", portfolio);
		}
	} else {
		callback("Specificy what stock please..", portfolio);
	}
}

function removeStock(portfolio, symbol, callback) {
	if (symbol) {
		if (portfolio && portfolio.hasOwnProperty(symbol)) {
			var newJson = {}
			for (var key in portfolio) {
				if (key != symbol) {
					newJson[key] = portfolio[key];
				} else {
					console.log("removed " + key + " from portfolio");
				}
			}
			callback(symbol + " was removed from you portfolio", newJson);
		} else if (portfolio) {
			
			callback("Sorry but I did not find " + symbol + " in you portfolio", portfolio);
		} else {
			callback("Sorry but your portfolio is currently empty..", portfolio);
		}
		
	} else {
		callback("Sorry but you must specificy a symbol..", portfolio)
	}
}

module.exports = {
	addStock : addStock,
	removeStock : removeStock

}

// addStock({}, stock, (msg, portfolio) => {
// 	console.log(msg)
// 	console.log(portfolio);
// })






