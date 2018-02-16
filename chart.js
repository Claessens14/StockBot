require('dotenv').config();
var plotly = require('plotly')('Claessens14','MkCocRcO2xGZEiGHhNLf');




function grapher(x_data, y_data, callback) {
	var data = [
	  {
	    x: x_data,
	    y: y_data ,
	    type: "scatter"
	  }
	];
	var graphOptions = {filename: "date-axes", fileopt: "overwrite"};
	plotly.plot(data, graphOptions, function (err, msg) {
	    if (err) {
	    	callback(err, null);
	    } else {
	    	callback(err, msg.url);
	    }
	});
}


module.exports = {
	grapher : grapher
}