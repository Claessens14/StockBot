require('dotenv').config();
var fs = require('fs');
var request = require('request');

var iex = require('../assets/iexList.json');

var industry = {};
var str = "";

function getList() {
    fs.writeFile('./assets/market.json', "", function (err) {
        if (err) return console.log(err);
    });

    for (var obj in iex) {
        if (iex[obj].symbol && iex[obj].symbol && iex[obj].isEnabled && iex[obj].isEnabled == true) {
            str = str + iex[obj].symbol + ',';
            if (str.length > 1000) {
                str = str.replace(/,$/gi, '');
                batchSearch(str, (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        fs.appendFile('./assets/market.json', JSON.stringify(res, null, 2), function (err) {
                            if (err) return console.log(err);
                        });
                    }
                });
                str = "";
            }
        }
    } 
}

function batchSearch(str, callback) {
    var url = 'https://api.iextrading.com/1.0/stock/market/batch?symbols=' + str + '&types=company,quote';
    request(url, function (err, resp, body) {
		if (err) {
			callback("ERROR (batchSearch) request returned a error " + err, null);
		} else {
			try {
				body = JSON.parse(body);
				body["url"] = url;
			} catch (e) {
				return callback("ERROR (batchSearch) JSON.parse failed!" + e, null);
			}
			callback(null, body);
		}
	});
}
getList();




