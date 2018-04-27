const roundTo = require('round-to');


//provide an array
function pickStr(array) {
	if(array) {
		if (typeof array != "string") {
		var options = {
			  min:  0
			, max:  (array.length - 1)
			, integer: true
			}
			return array[rn(options)];
		} else {
			return array;
		}
	} else {
		console.log("ERROR : (pickStr) array is null");
		return "";
	}
}

function toStr(val) {
	if (typeof val != "string") {
		return String(roundTo(val, 2));
	} else {
		return val;
	}
}

/*COVERT NUMBERS TO STRINGS, 
    and the engineering notation
    TODO : value is number, and na_on is for when a number of 0 should be turned to N/A instead (like for dividend). 
        doesnt work because it results in showing N/A%  */
function dataToStr(value, na_on) {
    var str = "";
    if (typeof value == "number") {
        //console.log('This is a number ' + value);
        value = roundTo(value, 2);
        str = String(value);
        str = str.replace(/\"/g, "");
        str = str.replace(/\'/g, "");
        var sign = "";
        if (str.match("-")) {
            str = str.replace(/-/g, "");
            sign = "-";
        }
        //str = str.slice(0, str.indexOf(".") + 2);  //round to 2

        if (str.length > 9) {
            str = str.replace(/[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]$/, " B");
        } else if (str.length > 6) {
            str = str.replace(/[0-9][0-9][0-9][0-9][0-9][0-9]$/, ' M');
        } else if (str.length > 3) {
            str = str.replace(/[0-9][0-9][0-9]$/, ' K');
        }
        str = sign + str;
        if ((str == "" || str == null) || (str == "0" && na_on == true)){
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
    dataToStr : dataToStr,
    pickStr : pickStr,
    toStr : toStr
}