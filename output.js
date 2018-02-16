var builder = require('botbuilder');

var search = require('./search');
var chart = require('./chart');



function makeChart(session, str, callback) {
	search.getChartData(str, (err, res) => {
		chart.grapher(res.Xarray, res.Yarray, (err, url) => {
			var card = createHeroCard(session, str, url);
			var msg = new builder.Message(session).addAttachment(card);
			callback(null, msg);
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

function makeCard(session) {

    // create the card based on selection

    var card = createHeroCard(session);

    // attach the card to the reply message
    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);
}


module.exports = {
	makeCard : makeCard,
	makeChart : makeChart
}