
var builder = require('botbuilder');
var cloudinary = require('cloudinary');
require('dotenv').config();

var search = require('./search');
var chart = require('./chart');

cloudinary.config({
    cloud_name: process.env.cloud_id,
    api_key: process.env.cloudinary_api_key,
    api_secret: process.env.cloudinary_app_secret
});


function makeChart(session, str, callback) {
	search.getChartData(str, (err, res) => {
		chart.grapher(str, res.Xarray, res.Yarray, (err, img) => {
            console.log(img);
    //         cloudinary.v2.uploader.upload(img, 
    // function(error, result) {console.log(result)});

            cloudinary.uploader.upload(img, (result) => {
            //console.log(JSON.stringify(result, null, 2));
                url = result.secure_url;

                var card = createHeroCard(session, str, url);
    			var msg = new builder.Message(session).addAttachment(card);
    			// callback(null, msg);
                callback(null, msg);
            });
		});
	});
}





function createHeroCard(session, str, url) {
    return new builder.HeroCard(session)
        .title(str)
        .subtitle('A quick look')
        .text('There is more to come from this company')
        .images([
            builder.CardImage.create(session, url)
        ])
        .buttons([
            builder.CardAction.openUrl(session, url, 'More')
        ]);
}


module.exports = {

	makeChart : makeChart
}