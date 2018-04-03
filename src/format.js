const roundTo = require('round-to');

function dataToStr(value) {
    var str = "";
    if (typeof value == "number") {
        //console.log('This is a number ' + value);
        value = roundTo(value, 2);
        str = String(value);
        str = str.replace(/\"/g, "");
        str = str.replace(/\'/g, "");
        //str = str.slice(0, str.indexOf(".") + 2);  //round to 2

        if (str.length > 9) {
            str = str.replace(/[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]$/, "B");
        } else if (str.length > 6) {
            str = str.replace(/[0-9][0-9][0-9][0-9][0-9][0-9]$/, 'M');
        } else if (str.length > 3) {
            str = str.replace(/[0-9][0-9][0-9]$/, 'K');
        }
        if (str == "" || str == null) {
            str = "N/A";
        }
    } else {
        str = JSON.stringify(value, null, 2);
        if (str == null || str == "null") {
            str = "N/A";
        } else {
            str = str.replace(/\"/g, "");
            str = str.replace(/\'/g, "");
            str = str.replace(/BTO/g, "N/A");
        }
    } 
    return str;
}

//[WAT -> WAT1]
//[A -> nothing, use name]
// function explicitTicker(input) {
//     var ticker = input.indexOf([" WAT "])
//     if (input.indexOf([" WAT "]) != -1) {
//         ticker
//     }
// }

module.exports = {
	dataToStr : dataToStr
}