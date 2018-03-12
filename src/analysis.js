var rn = require('random-number');



function reviewStock(stock) {
	//@ = company name
	//# = number
	var company = stock.company.companyName;
	var i = 0;

	//only use once per sentence
	var validResp = [];

	//recent earnings
	var q = 0;
	if (!(stock.earnings.earnings[q].EPSSurpriseDollar)) q = 1;
		
	if (stock.earnings.earnings[q].EPSSurpriseDollar > 0) {
		validResp.push(pickStr(responses.upEarnings).replace(/@/g, company).replace(/#/g, String(stock.earnings.earnings[q].EPSSurpriseDollar)));
	} else if (stock.earnings.earnings[q].EPSSurpriseDollar <= 0) {
		validResp.push(pickStr(responses.upEarnings).replace(/@/g, company).replace(/#/g, String(stock.earnings.earnings[q].EPSSurpriseDollar)));
	}

	//todays change
	if (String(stock.quote.change).match("-")) {
        validResp.push(pickStr(responses.downMover).replace(/@/g, company).replace(/#/g, String(stock.quote.change)));
	} else {
	    validResp.push(pickStr(responses.upMover).replace(/@/g, company).replace(/#/g, String(stock.quote.change)));
	}

	return pickStr(validResp);
}

var responses = {
	"upMover" : ["@  did good day gaining # points on the day", "the bulls came out today with # point increase"],
	"downMover" : ["@ was hit, loosing # points on the day", "the bears are out and pulled the stock down # points"],
	"upEarnings" : ["@ has beat its earnings, things are looking good", "With a # earnings beat, I like @"],
	"missEarnings" : ["@ has missed earnings expectations, I am not a fan", "With an earnings miss of #, I am not impressed"]
}


//provide an array
function pickStr(array) {
	var options = {
	  min:  0
	, max:  (array.length - 1)
	, integer: true
	}
	return array[rn(options)];
}

//console.log(pickStr(['hi', 'ok', 'bye']));
module.exports = {
	reviewStock : reviewStock
}