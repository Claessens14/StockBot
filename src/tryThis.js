var search = require('./search');
var chart = require('./chart');

search.getVantageChart("AAPL" , "TIME_SERIES_DAILY", 365, "daily", (err, res) => {
	chart.grapher(res, "close", (err, res) => {

	});
})


