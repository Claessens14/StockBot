var watson = require('watson-developer-cloud');
const fs = require('fs');
var request = require('request');
require('dotenv').config();

var sp500 = require('../assets/sp500names.js').array;
var iex = require('../assets/iexList.json');

var conversation = new watson.ConversationV1({
   username: process.env.WATSON_USERNAME,
   password: process.env.WATSON_PASSWORD,
   url: 'https://gateway.watsonplatform.net/conversation/api',  //idk what this is for
   version_date: process.env.WATSON_VERSION
});


//params for watson conversation
var params = {
  workspace_id: process.env.WATSON_WORKSPACE_ID,
}
var entities = []


/* Load the S & P 500 
*data in a format that is friendly to watsons entity field?*/
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
  params.entity= 'sp500',
  params.values= entities  
}



/*Load all the iex data
Load the data in a format that is friendly to the watson entity*/
function iexLoad() {
  if (iex) {
    for (var index in iex) {
      if ((iex[index].name != null) && (iex[index].symbol != null)) {
        if ((iex[index].type == "cs") && (iex[index].isEnabled == true)) {
          var syn = synonyms(iex[index].name, iex[index].symbol)
          entities.push({
              type: "synonyms",
              value: iex[index].symbol,
              synonyms: syn
          });
          
          fs.appendFile('./assets/namesv1.csv', syn[0] + ', ' + syn[syn.length -1] + '\n', function (err) {
            if (err) throw err;
            //console.log('Saved!');
          });
        }
      }
    }
  params.entity= 'iexStock',
  params.values= entities  
} else {
    console.log("ERROR : (iexLoad) iex is null");
  }
}

iexLoad()
console.log(entities);

/* DATA GATHER
  -does NOT upload to watson
  this function is meant to find reference data from iex, 
  such as sector and industry labels*/
function gatherData() {
  var sector = [];
  var industry = [];
  var res = {};
  var tickers = "";
  if (sp500) {
  for (var index in sp500) {
    if ((sp500[index].Name != null) && (sp500[index].Symbol != null)) {
        ///tickers = tickers + sp500[index].Symbol + ',';
        //tickers = tickers.replace(/,$/, "");
    var url = 'https://api.iextrading.com/1.0/stock/' + sp500[index].Symbol + '/batch?types=company';
          request(url, function (err, resp, body) {
            if (err) {
              console.log("ERROR" + sp500[index].Symbol)
            } else {
              //res = JSON.parse(body);
              try {
                var temp = JSON.parse(body)
                console.log(JSON.stringify(temp.company.sector, null, 2));
                sector = addTo(sector, temp.company.sector)
                industry = addTo(industry, temp.company.industry)
                console.log('$$$$$$$' + sector +  '$$$$$$$$');
                console.log('==========' + industry +  '============');
              } catch (e) {
                console.log(sp500[index].Symbol)
              }
              
              // if (body.company.sector && body.company.sector != "") sector.push(body.company.sector);
              // if (body.company.industry && body.company.industry != "") industry.pus(body.company.industry);
            }
        });
      }
    }
    tickers = tickers.replace(/,$/, "");
    var url = 'https://api.iextrading.com/1.0/stock/' + tickers + '/batch?types=company';
          request(url, function (err, resp, body) {
            if (err) {
              callback(err, null);
            } else {
              res = JSON.parse(body);
              console.log(res);
              // if (body.company.sector && body.company.sector != "") sector.push(body.company.sector);
              // if (body.company.industry && body.company.industry != "") industry.pus(body.company.industry);
            }
        });
  }
}


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
    addStr = addStr.slice(0, 63);  
    array.push(addStr);
      newStr = addStr;
      return array;
  } else {
      return array;
  }
}

//DERIVE SYNONYMS
//returns an array of words to use
function synonyms(str, symbol) {
    if (str == null) {
      console.log("(synonyms) ERROR str is null, returning null");
      return null;
    }
    if (symbol == null) {
      console.log("(synonyms) ERROR symbol is null, returning null");
      return null;
    }
    str = str.slice(0, 63);
    var newStr = str;
    var list = [symbol];
    if (str != symbol) list.push(str);

    // //if b shares then, remove tags and treat them as default
    // if (symbol.match(/-B$/g) || symbol.match(/.B$/g)) {
    //   newStr = newStr.split('(The)')[0]
    //   //console.log("SPLIT newStr = " + newStr);
    // }
    list = addTo(list, newStr.replace(/.com/gi, ""));
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
    list = addTo(list, newStr.replace(/ Ltd$/gi, ""));
    list = addTo(list, newStr.replace(/ group$/gi, ""));
    list = addTo(list, newStr.replace(/^the /gi, ""));
    list = addTo(list, newStr.replace(/(the)/gi, ""));
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



//console.log(entities);


conversation.createEntity(params, function(err, response) {
  if (err) {
    console.error(err);
  } else {
    console.log(JSON.stringify(response, null, 2));
  }
});

