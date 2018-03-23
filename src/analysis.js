var rn = require('random-number');
const roundTo = require('round-to');

//query must be array thats a max of 2
function reviewStock(stock, query) {
	//@ = company name
	//# = number
	var company = stripName(stock.company.companyName);
	var i = 0;

	if (query) {
		if (query.length > 1) {
			query[2] = query[0] + " " + query[1];
		}
	}
	

	//only use once per sentence
	var validResp = [];	//responses that are valid
	var queryResp = [];  //responses for query
	var overResp = [];  //response that specific to multiple entities



	function addResp(tag, str) {
		console.log("Tag: " + tag + " Adding: " + str);
		if (query) {
			var index = query.indexOf(tag);
			if ((index != -1) && (query[index] === tag)) {
				//if the tag is a match
				if (tag.match("&")) {
					//override match, double tag custom response
					overResp.push(str);
					queryResp.push(str);
					validResp.push(str);
				} else {
					queryResp.push(str);
					validResp.push(str);
				}
			} else {
				//found a word thats in a query tag, but not exact match
				validResp.push(str);
			}
		} else {
			//if tag is not found in query
			validResp.push(str);
		}
	}

	console.log(JSON.stringify(stock, null, 2));

	//EPS surprise		
	if ((stock.earnings.earnings[0].EPSSurpriseDollar) && (stock.earnings.earnings[0].EPSSurpriseDollar > 0)) {
		addResp("epsSurpriseUp", pickStr(responses.epsSurpriseUp).replace(/@/g, company).replace(/#/g, toStr(stock.earnings.earnings[0].EPSSurpriseDollar)));
	} else if ((stock.earnings.earnings[0].EPSSurpriseDollar) && (stock.earnings.earnings[0].EPSSurpriseDollar <= 0)) {
		addResp("epsSurpriseMiss", pickStr(responses.epsSurpriseMiss).replace(/@/g, company).replace(/#/g, toStr(stock.earnings.earnings[0].EPSSurpriseDollar)));
	}

	//todays dollar change
	if (String(stock.quote.change).match("-")) {
        addResp("downMover", pickStr(responses.downMover).replace(/@/g, company).replace(/#/g, toStr(stock.quote.change)));
	} else {
	    addResp("upMover", pickStr(responses.upMover).replace(/@/g, company).replace(/#/g, toStr(stock.quote.change)));
	}

	//52 week high
	if ((stock.quote.week52High * 0.9) < stock.quote.latestPrice) {
		addResp("week52High", pickStr(responses.week52High).replace(/@/g, company).replace(/#/g, toStr(stock.quote.latestPrice)));
	}
	//52 week low
	if ((stock.quote.week52Low * 1.1) > stock.quote.latestPrice) {
		addResp("week52Low", pickStr(responses.week52Low).replace(/@/g, company).replace(/#/g, toStr(stock.quote.latestPrice)));
	}

	//low volume
	if (stock.quote.avgTotalVolume && stock.quote.avgTotalVolume < 10000) {
		addResp("lowVolume", pickStr(responses.lowVolume).replace(/@/g, company).replace(/#/g, toStr(stock.quote.avgTotalVolume)));
		addResp("lowVolume", pickStr(responses.lowVolume).replace(/@/g, company).replace(/#/g, toStr(stock.quote.avgTotalVolume)));
	}

	//high dividend
	if (stock.stats.dividendYield && stock.stats.dividendYield > 4) {
		addResp("highDividend", pickStr(responses.highDividend).replace(/@/g, company).replace(/#/g, toStr(stock.stats.dividendYield)));
		addResp("highDividend", pickStr(responses.highDividend).replace(/@/g, company).replace(/#/g, toStr(stock.stats.dividendYield)));
	}

	//good dividend
	if (stock.stats.dividendYield && stock.stats.dividendYield <= 4 && stock.stats.dividendYield >= 2) {
		addResp("goodDividend", pickStr(responses.goodDividend).replace(/@/g, company).replace(/#/g, toStr(stock.stats.dividendYield)));
	}

	//pe of ratio value
	if ((stock.quote.peRatio) && (stock.quote.peRatio < 15)) {
		addResp("peValue", pickStr(responses.peValue).replace(/@/g, company).replace(/#/g, toStr(stock.stats.dividendYield)));
	}

	if (overResp[0]) {
		return overResp;
	} else if (queryResp[0]){
		return queryResp;
	} else if (validResp[0]){
		return [pickStr(validResp)];
	} else {
		console.log("ERROR (reviewStock) validResp[] is empty");
		return null;
	}
}
/*TODO - tagging system
-52weak/3month/14day week high/low
-the pulled back version
-anything compare to others
-earnings more
-return on equity (effictive management)
-thinly traded
-low volume
-a sector blurbs
-revinue growth
-earnings growth
-short ratio
-high low beta
-pe below 15
-net sales and revinue growth!
-p/b below 15
-MC above 200
-current ratio (assets / libilities) (the two extreme)
-share price above 2.00$
-forward p/e
-dividend yield of over 5%
-aware of bond yeilds rising
-2.5 - 4% dividen\
-debt to total captal of more than 5
*push onto portfolio!
*///MUST USE UP OR DOWN
var responses = {
	"upMover" : ["@  had a good day gaining # points on the day", "The bulls are pushing on @ with a # point increase on the day"],
	"downMover" : ["@ was hit, losing # points on the day", "The bears are pulling on @ with a # point decrease on the day"],
	"week52High" : ["@ is around its 52 week high, I like it", "At a price of $#, @ is at a 52 week high!"],
	"week52Low" : ["@ is close to its 52 week low!, may want to stay away", "Things aren't looking good for @, with its stock price approaching a 52 Week Low!"],
	"lowVolume" : ["@ has an average trading volume below 10 000 shares, beware of getting in and out of this stock!", "Warning! @ has an average trading volume below 10 000 shares, it could be difficult to get in and out of this stock"],
	"highDividend" : ["A dividend yield of # very high, look at out for the dividend yield trap!", "The dividend yield is quite high at #, you may want to check the fundimentals to make sure @ can support it"],
	"highDividend" : ["A dividend yield of # very high, look at out for the dividend yield trap!", "The dividend yield is quite high at #, you may want to check the fundimentals to make sure @ can support it"],
	"goodDividend" : ["@ offers a nice dividend at #%"],
	"peValue" : ["With a P/E Ratio of #, this could be a decent value play", "Could be a potential value stock as it's P/E ratio is only #"],
	"epsSurpriseUp" : ["@ beat its earnings estimates, things are looking good", "With a # earnings beat, I am liking @"],
	"epsSurpriseDown" : ["@ missed earnings expectations, I am not a fan", "With an earnings miss of #, I am not impressed"]
}



var stock = {"company":{"symbol":"VTR","companyName":"Ventas Inc.","exchange":"New York Stock Exchange","industry":"REITs","website":"http://www.ventasreit.com","description":"Ventas Inc is a real estate investment trust. It holds a diversified portfolio of seniors housing communities, skilled nursing facilities, medical office buildings, life science buildings, and hospitals.","CEO":"Debra A. Cafaro","issueType":"cs","sector":"Real Estate"},"logo":{"url":"https://storage.googleapis.com/iex/api/logos/VTR.png"},"quote":{"symbol":"VTR","companyName":"Ventas Inc.","primaryExchange":"New York Stock Exchange","sector":"Real Estate","calculationPrice":"close","open":48.5,"openTime":1521725400804,"close":49.32,"closeTime":1521749072003,"high":49.985,"low":48.42,"latestPrice":49.32,"latestSource":"Close","latestTime":"March 22, 2018","latestUpdate":1521749072003,"latestVolume":4226474,"iexRealtimePrice":49.32,"iexRealtimeSize":100,"iexLastUpdated":1521748795840,"delayedPrice":49.32,"delayedPriceTime":1521751067000,"previousClose":48.46,"change":0.86,"changePercent":0.01775,"iexMarketPercent":0.03732,"iexVolume":157732,"avgTotalVolume":3288441,"iexBidPrice":0,"iexBidSize":0,"iexAskPrice":0,"iexAskSize":0,"marketCap":17567092583,"peRatio":11.83,"week52High":72.36,"week52Low":47.9712,"ytdChange":-0.18908969210174026},"stats":{"consensusEPS":1.03,"numberOfEstimates":10,"EPSSurpriseDollar":null,"EPSSurprisePercent":0,"symbol":"VTR","EBITDA":1932041000,"revenue":3574149000,"grossProfit":2087686000,"cash":361055000,"debt":0,"ttmEPS":4.17,"revenuePerShare":10,"revenuePerEmployee":7249795,"returnOnEquity":11.9,"peRatioHigh":64.9,"peRatioLow":28.6,"companyName":"Ventas Inc.","marketcap":17260772639,"beta":0.328271,"week52high":72.36,"week52low":47.9712,"week52change":-17.3307,"shortInterest":7706288,"shortDate":"2018-02-28","dividendRate":3.16,"dividendYield":6.520842,"exDividendDate":"2018-03-29 00:00:00.0","latestEPS":3.77,"latestEPSDate":"2017-12-31","sharesOutstanding":356185981,"float":353826359,"returnOnAssets":5.38,"returnOnCapital":null,"profitMargin":37.61,"priceToSales":4.8914104,"priceToBook":1.59,"day200MovingAvg":61.38004,"day50MovingAvg":52.1736,"institutionPercent":45.5,"insiderPercent":null,"shortRatio":2.4627857,"year5ChangePercent":-0.14686402991433428,"year2ChangePercent":-0.14354236955634217,"year1ChangePercent":-0.17330699379553766,"ytdChangePercent":-0.18908969210174026,"month6ChangePercent":-0.2727796594399833,"month3ChangePercent":-0.17944654126388254,"month1ChangePercent":-0.017835427644912902,"day5ChangePercent":-0.020218358269308533,"day30ChangePercent":-0.08514253350953366},"earnings":{"symbol":"VTR","earnings":[{"actualEPS":1.03,"consensusEPS":1.03,"estimatedEPS":1.03,"announceTime":"BTO","numberOfEstimates":10,"EPSSurpriseDollar":null,"EPSReportDate":"2018-02-09","fiscalPeriod":"Q4 2017","fiscalEndDate":"2017-12-31"},{"actualEPS":1.04,"consensusEPS":1.04,"estimatedEPS":1.04,"announceTime":"BTO","numberOfEstimates":11,"EPSSurpriseDollar":null,"EPSReportDate":"2017-10-27","fiscalPeriod":"Q3 2017","fiscalEndDate":"2017-09-30"},{"actualEPS":1.06,"consensusEPS":1.05,"estimatedEPS":1.05,"announceTime":"BTO","numberOfEstimates":8,"EPSSurpriseDollar":0.01,"EPSReportDate":"2017-07-28","fiscalPeriod":"Q2 2017","fiscalEndDate":"2017-06-30"},{"actualEPS":1.04,"consensusEPS":1.02,"estimatedEPS":1.02,"announceTime":"BTO","numberOfEstimates":8,"EPSSurpriseDollar":0.02,"EPSReportDate":"2017-04-28","fiscalPeriod":"Q1 2017","fiscalEndDate":"2017-03-31"}]}};


console.log(reviewStock(stock, ["peValue"]));



// var array = [];
// if (array) {
// 	if(array[0]) {
// 		console.log("full");
// 	}
	
// } else {
// 	console.log("empty");
// }

//console.log()

// var voice = [
// 	[["tag"], ["resp"]], 
// 	[["tags"], ["response"]]
// ]


// function insight(stock, query, callback) {
// 	var output = [];
// 	if (query) {

// 	} else {
// 		var tags = evaluate();
// 	}
// }

// function evaluate() {
// 	voice.forEach(function (line) {
// 		line[0].forEach(function (tag)) {
// 			//if ((stock.earnings.earnings[0].EPSSurpriseDollar) && stock.earnings.earnings[0].EPSSurpriseDollar > 0) tag
// 		}
// 	});
// }

// function generateTags(stock) {

// }

// var array = ["hey", "hi", "waths"];
// console.log(array.indexOf() != -1);




function stripName(str) {
	str = str.replace(/\./g, "");
    str = str.replace(/,/g, "");
    str = str.replace(/!/g, "");
    str = str.replace(/\?/g, "");
    str = str.replace(/\'/g, "");
    str = str.replace(/The/gi, "the");
	str = str.replace(/ company$/gi, "");
    str = str.replace(/ corporation$/gi, "");
    str = str.replace(/ corp$/gi, "");
    str = str.replace(/ co$/gi, "");
    str = str.replace(/ inc/gi, "");
    str = str.replace(/.com$/gi, "");
    str = str.replace(/ Ltd$/gi, "");
    str = str.replace(/ group$/gi, "");
    return str;
}


//provide an array
function pickStr(array) {
	if(array) {
		if (typeof array != "string") {
		var options = {
			  min:  0
			, max:  (array.length - 1)
			, integer: true
			}
			return array[rn(options)];
		} else {
			return array;
		}
	} else {
		console.log("ERROR : (pickStr) array is null");
		return "";
	}
}

function toStr(val) {
	if (typeof val != "string") {
		return String(roundTo(val, 2));
	} else {
		return val;
	}
}

//console.log(pickStr(['hi', 'ok', 'bye']));
module.exports = {
	reviewStock : reviewStock
}