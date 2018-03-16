var watson = require('watson-developer-cloud');
require('dotenv').config();

var sp500 = require('./assets/sp500names.js').array;
var iex = require('./assets/iexList.json');

var conversation = new watson.ConversationV1({
   username: process.env.WATSON_USERNAME,
   password: process.env.WATSON_PASSWORD,
   url: 'https://gateway.watsonplatform.net/conversation/api',  //idk what this is for
   version_date: process.env.WATSON_VERSION
});

var entities = []

function sp500Load() {
    for (var index in sp500) {
    if ((sp500[index].Name != null) && (sp500[index].Symbol != null)) {
      entities.push({
          type: "synonyms",
          value: sp500[index].Symbol,
          synonyms: synonyms(sp500[index].Name, sp500[index].Symbol)
      });
    }
  }
}
const fs = require('fs');
function iexLoad() {
  if (iex) {
    for (var index in iex) {
      if ((iex[index].name != null) && (iex[index].symbol != null)) {
        var syn = synonyms(iex[index].name, iex[index].symbol)
        entities.push({
            type: "synonyms",
            value: iex[index].symbol,
            synonyms: syn
        });
        
        fs.appendFile('./assets/names.csv', syn[0] + ', ' + syn[syn.length -1] + '\n', function (err) {
          if (err) throw err;
          //console.log('Saved!');
        });
      }
    }
  } else {
    console.log("ERROR : (iexLoad) iex is null");
  }
}

iexLoad()
console.log(entities);


function synonyms(str, symbol) {
    if (str == null) {
      console.log("(synonyms) ERROR str is null, returning null");
      return null;
    }
    if (symbol == null) {
      console.log("(synonyms) ERROR symbol is null, returning null");
      return null;
    }
    var newStr = str;

    //add to array, but dont allow duplicates
    function addTo(array, addStr) {
        function check(checkArray, checkStr) {
            try {
              checkArray.forEach(function(el) {
                if (el.toLowerCase() == checkStr.toLowerCase()) {
                    throw el;
                }
              });
              return true;
            } catch (e) {
              return false;
            }
        }
        if (check(array, addStr)) {
            array.push(addStr);
            newStr = addStr;
            return array;
        } else {
            return array;
        }
    }
    var list = [symbol, str];

    //if b shares then, remove tags and treat them as default
    if (symbol.match(/-B$/g) || symbol.match(/.B$/g)) {
      newStr = newStr.split('(The)')[0]
      //console.log("SPLIT newStr = " + newStr);
    }

    list = addTo(list, newStr.replace(/\./g, ""));
    list = addTo(list, newStr.replace(/,/g, ""));
    list = addTo(list, newStr.replace(/!/g, ""));
    list = addTo(list, newStr.replace(/\?/g, ""));
    list = addTo(list, newStr.replace(/\'/g, ""));
    list = addTo(list, newStr.replace(/-/g, ""));
    list = addTo(list, newStr.replace(/&/g, "and"));
    list = addTo(list, newStr.replace(/ company$/gi, ""));
    list = addTo(list, newStr.replace(/ corporation$/gi, ""));
    list = addTo(list, newStr.replace(/ corp$/gi, ""));
    list = addTo(list, newStr.replace(/ co$/gi, ""));
    list = addTo(list, newStr.replace(/ inc/gi, ""));
    list = addTo(list, newStr.replace(/.com$/gi, ""));
    list = addTo(list, newStr.replace(/ Ltd$/gi, ""));
    list = addTo(list, newStr.replace(/ group$/gi, ""));
    list = addTo(list, newStr.replace(/^the /gi, ""));
    list = addTo(list, newStr.replace(/ $/gi, ""));
    list = addTo(list, newStr.replace(/s$/gi, ""));
    list = addTo(list, str.replace(/ies/gi, "ys"));
    list = addTo(list, newStr.replace(/ys/gi, "ies"));
    list = addTo(list, newStr.replace(/s$/gi, ""));

    //check for valid upload
    // for (i in list) {
    //   //if minimum length is to short
    //   if (list[i].length <= 0) {
    //     list.splice(i, 1);
    //   }

    //   if (list)

    //   //if more than 64 chars

    // }

    return list;
}


var params = {
  workspace_id: process.env.WATSON_WORKSPACE_ID,
  entity: 'iexV1',
  values: entities
}

//console.log(entities);


// conversation.createEntity(params, function(err, response) {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log(JSON.stringify(response, null, 2));
//   }

// });
