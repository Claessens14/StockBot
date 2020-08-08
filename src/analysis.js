const roundTo = require('round-to');

var pickStr = require('./format').pickStr;
var toStr = require('./format').toStr;

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
	var fallback = [];
	var validResp = [];	//responses that are valid
	var queryResp = [];  //responses for query
	var overResp = [];  //response that specific to multiple entities

	function addResp(tag, str) {
		console.log("Tag: " + tag + " Adding: " + str);
		if (query) {
			var index = query.indexOf(tag.toLowerCase().replace(/up/gi, "").replace(/down/gi, ""));
			if (index != -1) {
				//if the tag is a match
				// if (tag.match("&")) {
				// 	//override match, double tag custom response
				// 	overResp.push(str);
					queryResp.push(str);
					validResp.push(str);
				// // } else {
				// 	queryResp.push(str);
				// 	validResp.push(str);
				// }
			} else {
				//found a word thats in a query tag, but not exact match
				validResp.push(str);
			}
		} else {
			//if tag is not found in query
			if (["mover", "epssurprise"].indexOf(tag.toLowerCase().replace(/up/gi, "").replace(/down/gi, "")) == -1) {
				console.log("placing in fallback " + tag)
				validResp.push(str);
			} else {
				console.log("placing in fallback " + tag)
				fallback.push(str);
			}
			
		}
	}

	console.log(JSON.stringify(stock, null, 2));

	//EPS surprise		
	if ((stock && stock.earnings && stock.earnings && stock.earnings.earnings && stock.earnings.earnings[0].EPSSurpriseDollar) && (stock.earnings.earnings[0].EPSSurpriseDollar > 0)) {
		addResp("epsSurpriseUp", pickStr(responses.epsSurpriseUp).replace(/@/g, company).replace(/#/g, toStr(stock.earnings.earnings[0].EPSSurpriseDollar)));
	} else if ((stock && stock.earnings && stock.earnings && stock.earnings.earnings && stock.earnings.earnings[0].EPSSurpriseDollar) && (stock.earnings.earnings[0].EPSSurpriseDollar < 0)) {
		addResp("epsSurpriseMiss", pickStr(responses.epsSurpriseMiss).replace(/@/g, company).replace(/#/g, toStr(stock.earnings.earnings[0].EPSSurpriseDollar)));
	}

	if (stock.financials && stock.financials.financials[0].totalRevinue && stock.financials.financials[0].netIncome) {
		var rev = true;
		var earn = true;
		var eps = true;
		for (var i = 0; i <= i; i++) {
			if  (stock.financials.financials[i].totalRevinue < stock.financials.financials[i + 1].totalRevinue) {
				rev  = false;
			}
			if (stock.financials.financials[i].netIncome < stock.financials.financials[i + 1].netIncome) {
				earn = false;
			}
			if ((stock.earnings.earnings[i].EPSSurpriseDollar) < 0) {
				eps = false;
			}
		}
		if ((stock.earnings.earnings[4].EPSSurpriseDollar) < 0) {
			eps = false;
		}

		if (eps && earn && rev) {
			addResp("first", pickStr(responses.winner).replace(/@/g, company));
		} else if (earn && rev) {
			addResp("second", pickStr(responses.second).replace(/@/g, company))
		} else if (rev) {
			addResp("third", pickStr(responses.third).replace(/@/g, company))
		}
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

	if (stock.quote.latestPrice && stock.quote.latestPrice < 2) {
		addResp("penny", pickStr(responses.penny).replace(/@/g, company).replace(/#/g, toStr(stock.quote.latestPrice)));
		//addResp("lowVolume", pickStr(responses.lowVolume).replace(/@/g, company).replace(/#/g, toStr(stock.quote.avgTotalVolume)));
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
		addResp("peValue", pickStr(responses.peValue).replace(/@/g, company).replace(/#/g, toStr(stock.quote.peRatio)));
	}

	// //pb of ratio value
	// if ((stock.quote.priceToBook) && (stock.quote.priceToBook < 15)) {
	// 	addResp("peValue", pickStr(responses.peValue).replace(/@/g, company).replace(/#/g, toStr(stock.quote.peRatio)));
	// }

	//highBeta
	if (stock.stats.beta && stock.stats.beta > 1.2) {
		addResp("highBeta", pickStr(responses.highBeta).replace(/@/g, company).replace(/#/g, toStr(stock.stats.beta)));
		//addResp("highDividend", pickStr(responses.highDividend).replace(/@/g, company).replace(/#/g, toStr(stock.stats.dividendYield)));
	}


	//low Beta - idk what to say
	// if (stock.stats.beta && stock.stats.beta < 0.8) {
	// 	addResp("lowBeta", pickStr(responses.lowBeta).replace(/@/g, company).replace(/#/g, toStr(stock.stats.beta)));
	// 	//addResp("highDividend", pickStr(responses.highDividend).replace(/@/g, company).replace(/#/g, toStr(stock.stats.dividendYield)));
	// }

	if (stock.stats.shortInterest && stock.stats.sharesOutstanding) {
		var shortPercent = stock.stats.shortInterest / stock.stats.sharesOutstanding;
		//short squeeze
		if ((shortPercent > 0.25) && (shortPercent < 0.4)){
			addResp("short", pickStr(responses.short).replace(/@/g, company).replace(/#/g, toStr(shortPercent*100)));
		}
		//short squeeze
		if ((shortPercent > 0.4) && (shortPercent < 1)){
			addResp("squeeze", pickStr(responses.squeeze).replace(/@/g, company).replace(/#/g, toStr(shortPercent*100)));
		}
	}
	
	if (overResp[0]) {
		return overResp;
	} else if (queryResp[0]){
		return queryResp;
	} else if (validResp[0]){
		return [pickStr(validResp)];
	} else if (fallback[0]){
		return [pickStr(fallback)];
	} else {
		console.log("ERROR (reviewStock) validResp[] is empty");
		return null;
	}
}

///MUST USE UP OR DOWN
var responses = {
	"upMover" : ["@ had a good day gaining # points on the day", "The bulls are pushing on @ with a # point increase on the day"],
	"downMover" : ["@ was hit, losing # points on the day", "The bears are pulling down @ with a # point decrease on the day"],
	"week52High" : ["@ is around its 52 week high, I like it", "At a price of $#, @ is at a 52 week high!"],
	"week52Low" : ["@ is close to its 52 week low!, may want to stay away", "Things aren't looking good for @, with its stock price approaching a 52 Week Low!"],
	"lowVolume" : ["@ has an average trading volume below 10 000 shares, beware of getting in and out of this stock!", "Warning! @ has an average trading volume below 10 000 shares, it could be difficult to get in and out of this stock"],
	"penny" : ["With a share price of #, @ is getting close to penny stock cata", "I am not a fan of penny stocks, and with a share price of $#, @ still needs to prove itself"],
	"highDividend" : ["A dividend yield of # very high, look at out for the dividend yield trap!", "The dividend yield is quite high at #, you may want to check the fundimentals and payout ratio to make sure @ can support it"],
	"goodDividend" : ["@ offers a nice dividend at #%"],
	"peValue" : ["With a P/E Ratio of #, this could be a decent value play", "Could be a potential value stock as it's P/E ratio is only #"],
	"highBeta" : ["With a beta of #, @ may be of higher risk in the sector", "The beta of @ is quite high at #, it could be quite volitile compared to its peers"],
	"short" : ["Currently, @ has #% of the shares are shorted, this may not be the best entry point", "With #% of the shares shorted, this does not look like a god time to buy"],
	"squeeze" : ["#% of the shares are shorted, if stock price raises in value, there could be a short squeeze", "With #% of shares shorted, there could be the potential of a short squeeze!"],
	"epsSurpriseUp" : ["@ beat its earnings estimates, things are looking good", "With a # earnings beat, I am liking @"],
	"epsSurpriseDown" : ["@ missed earnings expectations, I am not a fan", "With an earnings miss of #, I am not impressed"],
	"first" : ["@ has beat analysist expectations, grew revinue and increased earnings for the last 4 quarter!!"],
	"second" : ["@ has grew revinue over the past 4 quarter while increasing earnings, thats impressive!", "With a revinue and earnings increase for the last 4 quarters, I can say @ is a winner"],
	"third" : ["Wallstreet loves growth stocks, and with increasing revinue over the past 4 quarters, @ looks good", "@ has grew revinue for each of its past 4 quarters, thats what I like to see"]
}



// var stock = {"company":{"symbol":"AAP","companyName":"Advance Auto Parts Inc W/I","exchange":"New York Stock Exchange","industry":"Retail - Apparel & Specialty","website":"https://shop.advanceautoparts.com","description":"Advance Auto Parts Inc is an automotive aftermarket parts provider serving professional installers, DIY (do-it-yourself) customer and independently-owned operators.","CEO":"Thomas R. Greco","issueType":"cs","sector":"Consumer Cyclical"},"logo":{"url":"https://storage.googleapis.com/iex/api/logos/AAP.png"},"quote":{"symbol":"AAP","companyName":"Advance Auto Parts Inc W/I","primaryExchange":"New York Stock Exchange","sector":"Consumer Cyclical","calculationPrice":"close","open":112.41,"openTime":1521811800003,"close":110.84,"closeTime":1521835321115,"high":113.26,"low":110.34,"latestPrice":110.84,"latestSource":"Close","latestTime":"March 23, 2018","latestUpdate":1521835321115,"latestVolume":1085853,"iexRealtimePrice":110.89,"iexRealtimeSize":5,"iexLastUpdated":1521835195063,"delayedPrice":110.84,"delayedPriceTime":1521835893110,"previousClose":111.71,"change":-0.87,"changePercent":-0.00779,"iexMarketPercent":0.01647,"iexVolume":17884,"avgTotalVolume":1354916,"iexBidPrice":0,"iexBidSize":0,"iexAskPrice":0,"iexAskSize":0,"marketCap":8199734821,"peRatio":20.6,"week52High":152.38,"week52Low":78.81,"ytdChange":0.05352304481457478},"stats":{"companyName":"Advance Auto Parts Inc W/I","marketcap":8264095785,"beta":1.089604,"week52high":152.38,"week52low":78.81,"week52change":-25.9856,"shortInterest":6543661,"shortDate":"2018-02-28","dividendRate":0.24,"dividendYield":5.1,"exDividendDate":"2018-03-22 00:00:00.0","latestEPS":6.42,"latestEPSDate":"2017-12-31","sharesOutstanding":73978120,"float":70672553,"returnOnEquity":15.02,"consensusEPS":0.65,"numberOfEstimates":10,"EPSSurpriseDollar":null,"EPSSurprisePercent":18.4615,"symbol":"AAP","EBITDA":684540000,"revenue":7336798000,"grossProfit":3211480000,"cash":746619000,"debt":1073892000,"ttmEPS":5.380000000000001,"revenuePerShare":99,"revenuePerEmployee":103335,"peRatioHigh":0,"peRatioLow":0,"returnOnAssets":5.66,"returnOnCapital":null,"profitMargin":5.07,"priceToSales":0.90900326,"priceToBook":2.42,"day200MovingAvg":104.14474,"day50MovingAvg":114.66939,"institutionPercent":78.6,"insiderPercent":4.5,"shortRatio":3.972247,"year5ChangePercent":0.4004064199815217,"year2ChangePercent":-0.2930171920042783,"year1ChangePercent":-0.26524512766949654,"ytdChangePercent":0.05352304481457478,"month6ChangePercent":0.17983289485218545,"month3ChangePercent":0.12139156552124976,"month1ChangePercent":0.06092306289656393,"day5ChangePercent":-0.04168511064672316,"day30ChangePercent":0.01950391018217086},"financials":{"symbol":"AAP","financials":[{"reportDate":"2017-09-30","grossProfit":947708000,"costOfRevenue":1234525000,"operatingRevenue":2182233000,"totalRevenue":2182233000,"operatingIncome":156569000,"netIncome":95996000,"researchAndDevelopment":null,"operatingExpense":791139000,"currentAssets":5367952000,"totalAssets":8468224000,"totalLiabilities":5237437000,"currentCash":363302000,"currentDebt":null,"totalCash":363302000,"totalDebt":null,"shareholderEquity":3230787000,"cashChange":106072000,"cashFlow":133656000,"operatingGainsLosses":331000},{"reportDate":"2017-06-30","grossProfit":993088000,"costOfRevenue":1270639000,"operatingRevenue":2263727000,"totalRevenue":2263727000,"operatingIncome":146711000,"netIncome":87049000,"researchAndDevelopment":null,"operatingExpense":846377000,"currentAssets":5326215000,"totalAssets":8437413000,"totalLiabilities":5309136000,"currentCash":257230000,"currentDebt":null,"totalCash":257230000,"totalDebt":null,"shareholderEquity":3128277000,"cashChange":131143000,"cashFlow":232268000,"operatingGainsLosses":4086000},{"reportDate":"2017-03-31","grossProfit":1270684000,"costOfRevenue":1620154000,"operatingRevenue":2890838000,"totalRevenue":2890838000,"operatingIncome":179780000,"netIncome":107960000,"researchAndDevelopment":null,"operatingExpense":1090904000,"currentAssets":5306693000,"totalAssets":8428657000,"totalLiabilities":5404982000,"currentCash":126087000,"currentDebt":520000,"totalCash":126087000,"totalDebt":1073892000,"shareholderEquity":3023675000,"cashChange":-9091000,"cashFlow":35081000,"operatingGainsLosses":275000},{"reportDate":"2016-12-31","grossProfit":907564000,"costOfRevenue":1175327000,"operatingRevenue":2082891000,"totalRevenue":2082891000,"operatingIncome":106147000,"netIncome":62365000,"researchAndDevelopment":null,"operatingExpense":801417000,"currentAssets":5172764000,"totalAssets":8315033000,"totalLiabilities":5398841000,"currentCash":135178000,"currentDebt":306000,"totalCash":135178000,"totalDebt":1043255000,"shareholderEquity":2916192000,"cashChange":15684000,"cashFlow":73842000,"operatingGainsLosses":1397000}]},"news":[{"datetime":"2018-03-16T14:27:00-04:00","headline":"ADVANCE AUTO PARTS INVESTOR ALERT: Faruqi & Faruqi, LLP Encourages Investors Who Suffered Losses Exceeding $100,000 In Advance Auto Parts, Inc. To Contact The Firm","source":"Business Wire","url":"https://api.iextrading.com/1.0/stock/aap/article/6538806539799633","summary":"     Faruqi &amp; Faruqi, LLP, a leading national securities law firm, is investigating potential claims against Advance Auto Parts, Inc. (Advance Auto Parts or the Company) (NYSE:AAP).      If you invested in Advance Auto Parts stock or options  and would like to …","related":"AAP,Economy Business and Finance,CON102,LEGALLAW,Market,Non-Company,NYSE0001,RET10217,SPECRTIL"},{"datetime":"2018-03-13T14:16:00-04:00","headline":"DEADLINE ALERT: Brower Piven Reminds Investors of Upcoming Deadline in Class Action Lawsuit and Encourages Shareholders Who Have Losses in Excess of $100,000 from Investment in Advance Auto Parts, Inc. to Contact the Firm","source":"Business Wire","url":"https://api.iextrading.com/1.0/stock/aap/article/7826955698897196","summary":"     The securities litigation law firm of Brower Piven, A Professional Corporation, announces that a class action lawsuit has been commenced in the United States District Court for the District of Delaware on behalf of purchasers of Advance Auto Parts, Inc. (NYSE: AAP) (Advance Auto Part…","related":"AAP,Economy Business and Finance,CON102,DELAWARE,Market,MARYLAND,Non-Company,NYSE0001,RET10217,SPECRTIL"},{"datetime":"2018-03-09T16:51:00-05:00","headline":"ADVANCE AUTO PARTS LEAD PLAINTIFF ALERT: Faruqi & Faruqi, LLP Encourages Investors Who Suffered Losses Exceeding $100,000 In Advance Auto Parts, Inc. To Contact The Firm","source":"Business Wire","url":"https://api.iextrading.com/1.0/stock/aap/article/7956040785321689","summary":"     Faruqi &amp; Faruqi, LLP, a leading national securities law firm, reminds investors in Advance Auto Parts, Inc. (Advance Auto Parts or the Company) (NYSE:AAP) of the April 9, 2018 deadline to seek the role of lead plaintiff in a federal securities class action…","related":"AAP,Automotive,Economy Business and Finance,CON102,DELAWARE,LEGALLAW,Market,Non-Company,NYSE0001,RET10217,SPECRTIL"},{"datetime":"2018-03-06T20:10:59-05:00","headline":"How Can This Be The Best-Performing Industry Group In The S&P 500?","source":"SeekingAlpha","url":"https://api.iextrading.com/1.0/stock/aap/article/7568904332850035","summary":"   In an earlier  post  looking at breadth among the different industry groups in the S&amp;P 500, we noted that Retailing was the top-performing group in the S&amp;P 500 YTD with a gain of over 15%. Looking at the table below, however, you would have hardly guessed by looking at the performance …","related":"AAP,AMZN,AZO,BBY,BKNG,CNDF:BZX,DG,DLTR,EMTY,EXPE,FDIS,FL,FTXD,FXD,GPC,GPS,HD,JHMC,JWN,KMX,KSS,LB,LKQ,LOW,M,Market,NASDAQ01,NFLX,ORLY,PEZ,PMR,PSCD,RCD,RETL,ROST,RTH,SIG,TGT,TIF,TJX,TRIP,TSCO,ULTA,VCR,XD:BZX,XLY,XRT"},{"datetime":"2018-02-27T15:44:00-05:00","headline":"The Klein Law Firm Reminds Investors of a Class Action Filed on Behalf of Advance Auto Parts, Inc. Shareholders and a Lead Plaintiff Deadline of April 9, 2018","source":"Business Wire","url":"https://api.iextrading.com/1.0/stock/aap/article/5867256980398800","summary":"     The Klein Law Firm announces that a class action complaint has been filed on behalf of shareholders of Advance Auto Parts, Inc. (NYSE:AAP) who purchased shares between  November 14, 2016 and August 15, 2017 . The action, which was filed in the United States District Court for the District of…","related":"AAP,Economy Business and Finance,CON102,DELAWARE,LEGALLAW,Market,Non-Company,NYSE0001,RET10217,SPECRTIL"},{"datetime":"2018-02-25T08:51:26-05:00","headline":"Tracking Stephen Mandel's Lone Pine Capital Portfolio - Q4 2017 Update","source":"SeekingAlpha","url":"https://api.iextrading.com/1.0/stock/aap/article/6341296530771467","summary":"   This article is part of a series that provides an ongoing analysis of the changes made to Stephen Mandels 13F portfolio on a quarterly basis. It is based on Mandels regulatory  13F Form  filed on 02/14/2018. Please visit our  Tracking Stephen Mandels Lone Pine Capital P…","related":"A,AAP,ADBE,AMZN,ATVI,AVGO,BABA,BLK,BUD,CHTR,CMCSA,CRM,CSX,DIA20640091,EA,EQIX,EXPE,FB,FLT,GOOG,Healthcare,ICE,IQV,MA,MED20640,MELI,MSFT,NASDAQ01,NOW,PCLN,PYPL,SE,STZ,TDG,TMUS,TRU,TV,UNH,VXX,WYNN"},{"datetime":"2018-02-23T16:10:54-05:00","headline":"Advance Auto Parts Whiffs Again","source":"SeekingAlpha","url":"https://api.iextrading.com/1.0/stock/aap/article/8633495576167168","summary":"    Image credit    Advance Auto Parts ( AAP ) reported earnings on Wednesday and the stock not only was sent flying higher, but it dragged its competitors along with it. The auto parts retailers were beaten mercilessly last year but since that time, sentiment has done a complete 180 and at this …","related":"AAP,CON102,NASDAQ01,ORLY,RET10217,SPECRTIL,WOMPOLIX"},{"datetime":"2018-02-23T15:00:00-05:00","headline":"AAP EQUITY ALERT: The Law Offices of Vincent Wong Reminds Investors of a Class Action Involving Advance Auto Parts, Inc. and a Lead Plaintiff Deadline of April 9, 2018","source":"Business Wire","url":"https://api.iextrading.com/1.0/stock/aap/article/5875930031625768","summary":"     The Law Offices of Vincent Wong announce that a class action lawsuit has been commenced in the United States District Court for the District of Delaware on behalf of investors who purchased Advance Auto Parts, Inc. (\"Advance Auto Parts\") (NYSE: AAP) securities between  November 14, 2016  and…","related":"AAP,Economy Business and Finance,CON102,DELAWARE,LEGALLAW,Market,Non-Company,NYSE0001,RET10217,SPECRTIL"},{"datetime":"2018-02-23T13:15:37-05:00","headline":"Advance Auto Parts: Am I Fighting The Tape?","source":"SeekingAlpha","url":"https://api.iextrading.com/1.0/stock/aap/article/6120798599071685","summary":"   I am a bit puzzled by the string of sell side upgrades to Advance Auto Parts ( AAP ) after its Q4 2017 earnings print. I would argue that the sell side is conveniently ignoring the fact AAP's management has consistently over promised and under delivered. In my view, this stock trades based lar…","related":"AAP,AZO,CON102,GPC,NASDAQ01,ORLY,RET10217,SPECRTIL"},{"datetime":"2018-02-23T11:00:00-05:00","headline":"ADVANCE AUTO PARTS LEAD PLAINTIFF ALERT: Faruqi & Faruqi, LLP Encourages Investors Who Suffered Losses Exceeding $100,000 In Advance Auto Parts, Inc. To Contact The Firm","source":"Business Wire","url":"https://api.iextrading.com/1.0/stock/aap/article/8147498204000334","summary":"     Faruqi &amp; Faruqi, LLP, a leading national securities law firm, reminds investors in Advance Auto Parts, Inc. (Advance Auto Parts or the Company) (NYSE:AAP) of the April 9, 2018 deadline to seek the role of lead plaintiff in a federal securities class action…","related":"AAP,Automotive,Economy Business and Finance,CON102,DELAWARE,LEGALLAW,Market,Non-Company,NYSE0001,RET10217,SPECRTIL"}],"earnings":{"symbol":"AAP","earnings":[{"actualEPS":0.77,"consensusEPS":0.65,"estimatedEPS":0.65,"announceTime":"BTO","numberOfEstimates":10,"EPSSurpriseDollar":0.12,"EPSReportDate":"2018-02-21","fiscalPeriod":"Q4 2017","fiscalEndDate":"2017-12-31"},{"actualEPS":1.43,"consensusEPS":1.2,"estimatedEPS":1.2,"announceTime":"BTO","numberOfEstimates":12,"EPSSurpriseDollar":0.23,"EPSReportDate":"2017-11-14","fiscalPeriod":"Q3 2017","fiscalEndDate":"2017-09-30"},{"actualEPS":1.58,"consensusEPS":1.65,"estimatedEPS":1.65,"announceTime":"BTO","numberOfEstimates":11,"EPSSurpriseDollar":-0.07,"EPSReportDate":"2017-08-15","fiscalPeriod":"Q2 2017","fiscalEndDate":"2017-06-30"},{"actualEPS":1.6,"consensusEPS":2.12,"estimatedEPS":2.12,"announceTime":"BTO","numberOfEstimates":11,"EPSSurpriseDollar":-0.52,"EPSReportDate":"2017-05-24","fiscalPeriod":"Q1 2017","fiscalEndDate":"2017-03-31"}]}};

// console.log(reviewStock(stock, "mover"));

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
    str = str.replace(/\(the\)/gi, "");
    return str;
}



//console.log(pickStr(['hi', 'ok', 'bye']));
module.exports = {
	reviewStock : reviewStock
}