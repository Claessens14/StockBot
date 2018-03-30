require('dotenv').config();
var plotly = require('plotly')('Claessens14','MkCocRcO2xGZEiGHhNLf');
var cloudinary = require('cloudinary');
var fs = require('fs');
const rn = require('random-number');

cloudinary.config({ 
  cloud_name: process.env.cloud_id, 
  api_key: process.env.cloudinary_api_key, 
  api_secret: process.env.cloudinary_app_secret
});


var trace1 = {
  x: [3, 6, 1, 8, 4],
  y: [1, 2, 3, 4, 5],
  type: "scatter"
};

var figure = { 'data': [trace1] };

var imgOpts = {
    format: 'png',
    width: 1000,
    height: 500
};

plotly.getImage(figure, imgOpts, function (error, imageStream) {
    if (error) return console.log (error);
	var options = {
	  min:  1
	, max:  980
	, integer: true
	}
	var name = "./bin/" + rn(options) + ".png";
    var fileStream = fs.createWriteStream(name)
    	.on('finish', () => upload());
    imageStream.pipe(fileStream);

    function upload() {
    	cloudinary.uploader.upload(name, function(result) { 
		  console.log(result) 
		});
    }
    // cloudinary.uploader.upload("HERE.png", function(result) { 
//   console.log(result) 
// });
});





// module.exports = {
// 	grapher : grapher
// }