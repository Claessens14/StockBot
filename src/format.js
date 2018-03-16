const roundTo = require('round-to');

function dataToStr(value) {
    var str = "";
    if (typeof value == "number") {
        //console.log('This is a number ' + value);
        value = roundTo(value, 2);
        str = String(value);
        str = str.replace(/\"/g, "");
        str = str.replace(/\'/g, "");
        if (str.match("000")) {
            str = str.replace(/000000000/g, 'B');
            str = str.replace(/000000/g, 'M');
            str = str.replace(/000/g, 'K');
        }
        if (str.length > 9) {
            str = str.replace(/[0-9][0-9][0-9][0-9][0-9][0-9]$/g, 'M');
        } else if (str.length > 7) {
            str = str.replace(/[0-9][0-9][0-9]$/g, 'K');
        }
        if (str == "" || str == null) {
            str = "N/A";
        }
    } else {
        str = JSON.stringify(value, null, 2);
        if (str == null || str == "null") {
            str = "N/A";
        }
    }

    return str;
}

module.exports = {
	dataToStr : dataToStr
}