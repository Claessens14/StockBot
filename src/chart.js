require('dotenv').config();
var plotly = require('plotly')('Claessens14','MkCocRcO2xGZEiGHhNLf');
var fs = require('fs');



function grapher(str, x_data, y_data, callback) {
	var data = [
	  {
	    x: x_data,
	    y: y_data ,
	    type: "scatter"
	  }
	];/*
	var graphOptions = {filename: "date-axes", fileopt: "overwrite"};
	plotly.plot(data, graphOptions, function (err, msg) {
	    if (err) {
	    	callback(err, null);
	    } else {
	    	callback(err, msg.url);
	    }
	});*/


	var figure = {data};

	var imgOpts = {
	    format: 'png',
	    width: 1000,
	    height: 500
	};



	plotly.getImage(figure, imgOpts, function (error, imageStream) {
	    if (error) return console.log (error);
	    var name = str + '.png';
	    var fileStream = fs.createWriteStream(name);
	    imageStream.pipe(fileStream);
	    callback(null, name);
	});
	    
}


module.exports = {
	grapher : grapher
}