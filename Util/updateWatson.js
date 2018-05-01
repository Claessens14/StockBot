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
  fuzzy_match: true
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
          var symbol = iex[index].symbol;
          var common = ["ARES", "SIR", "TSG", "IF", "QUOT", "INS", "FOR", "P", "S", "ISCA", "VALU", "ANDE", "MEI", "EDUC", "HYI", "HEI", "THST", "ALL", "tat", "tkat", "SO", "NOW", "OUT", "GTES", "NWS", "NWSA", "NWS", "TUES", "GES", "COOL", "BRO", "MANT", "CANT", "CART", "CGNT", "CANF", "CAMT", "CENT", "CRNT", "CAMT", "E", "A", "ANS", "ONS", "TRUE", "ANDE", "IN", "PE", "OFS", "BEAT", "EARN", "ANY", "COT", "GTT", "ARE", "DO", "WAT", "UPS", "HI", "ON", "GOOD", "SEE", "AT", "TELL", "IAM", "SUP", "MAN", "A", "I", "ACM"];
          if (common.indexOf(symbol) != -1) symbol = symbol + "111";
          var syn = synonyms(iex[index].name, symbol)
          entities.push({
              type: "synonyms",
              value: symbol,
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

    var exceptions = ["NWS", "NWSA"];
    symbol = symbol.replace(/1$/g, "");
    symbol = symbol.replace(/1$/g, "");
    symbol = symbol.replace(/1$/g, "");
    if (exceptions.indexOf(symbol) != -1) return [newStr];
    // //if b shares then, remove tags and treat them as default
    // if (symbol.match(/-B$/g) || symbol.match(/.B$/g)) {
    //   newStr = newStr.split('(The)')[0]
    //   //console.log("SPLIT newStr = " + newStr);
    // }
    list = addTo(list, newStr.replace(/.com/gi, ""));
    list = addTo(list, newStr.replace(/.com Inc/gi, ""));
    list = addTo(list, newStr.replace(/\./g, ""));
    list = addTo(list, newStr.replace(/,/g, ""));
    list = addTo(list, newStr.replace(/!/g, ""));
    list = addTo(list, newStr.replace(/\?/g, ""));
    list = addTo(list, newStr.replace(/\'/g, ""));
    list = addTo(list, newStr.replace(/-/g, ""));
    newStr = newStr.replace(/\.com/gi, "");
    newStr = newStr.replace(/\./g, "");
    newStr = newStr.replace(/\,/g, "");
    newStr = newStr.replace(/\?/g, "");
    newStr = newStr.replace(/\'/g, "");
    newStr = newStr.replace(/\-/g, "");
    newStr = newStr.replace(/\(the\)/gi, "");
    newStr = newStr.replace(/\(new\)/gi, "");
    newStr = newStr.replace(/\(\)/gi, "");
    list = addTo(list, newStr.replace(/&/g, "and"));
    list = addTo(list, newStr.replace(/ company/gi, ""));
    list = addTo(list, newStr.replace(/ corporation/gi, ""));
    list = addTo(list, newStr.replace(/ corp$/gi, ""));
    list = addTo(list, newStr.replace(/ co$/gi, ""));
    list = addTo(list, newStr.replace(/ inc/gi, ""));
    list = addTo(list, newStr.replace(/ Ltd$/gi, ""));
    list = addTo(list, newStr.replace(/ group$/gi, ""));
    list = addTo(list, newStr.replace(/technologys/gi, ""));
    list = addTo(list, newStr.replace(/technologies/gi, ""));
    list = addTo(list, newStr.replace(/technology/gi, ""));
    list = addTo(list, newStr.replace(/holdings/gi, ""));
    list = addTo(list, newStr.replace(/alliance/gi, ""));
    list = addTo(list, newStr.replace(/assets/gi, ""));
    list = addTo(list, newStr.replace(/asset/gi, ""));
    list = addTo(list, newStr.replace(/trust/gi, ""));
    list = addTo(list, newStr.replace(/worldwide/gi, ""));
    list = addTo(list, newStr.replace(/enterprise/gi, ""));
    list = addTo(list, newStr.replace(/group/gi, ""));
    list = addTo(list, newStr.replace(/groups/gi, ""));
    list = addTo(list, newStr.replace(/stores/gi, ""));
    list = addTo(list, newStr.replace(/stores/gi, ""));
    list = addTo(list, newStr.replace(/markets/gi, ""));
    list = addTo(list, newStr.replace(/markets/gi, ""));
    list = addTo(list, newStr.replace(/automitive/gi, ""));
    list = addTo(list, newStr.replace(/realty/gi, ""));
    list = addTo(list, newStr.replace(/laboratorys/gi, ""));
    list = addTo(list, newStr.replace(/laboratories/gi, ""));
    list = addTo(list, newStr.replace(/laboratory/gi, ""));
    list = addTo(list, newStr.replace(/lab/gi, ""));
    list = addTo(list, newStr.replace(/gold/gi, ""));
    list = addTo(list, newStr.replace(/capital/gi, ""));
    list = addTo(list, newStr.replace(/Pharmaceuticals/gi, ""));
    list = addTo(list, newStr.replace(/Pharmaceutical/gi, ""));
    list = addTo(list, newStr.replace(/pharma/gi, ""));
    list = addTo(list, newStr.replace(/communitys/gi, ""));
    list = addTo(list, newStr.replace(/communities/gi, ""));
    list = addTo(list, newStr.replace(/brands/gi, ""));
    list = addTo(list, newStr.replace(/Financial/gi, ""));
    list = addTo(list, newStr.replace(/limited/gi, ""));
    list = addTo(list, newStr.replace(/healthcare/gi, ""));
    list = addTo(list, newStr.replace(/sciences/gi, ""));
    list = addTo(list, newStr.replace(/science/gi, ""));
    list = addTo(list, newStr.replace(/Sponsored/gi, ""));
    list = addTo(list, newStr.replace(/research/gi, ""));
    list = addTo(list, newStr.replace(/biologics/gi, ""));
    list = addTo(list, newStr.replace(/biotech/gi, ""));
    list = addTo(list, newStr.replace(/equity/gi, ""));
    list = addTo(list, newStr.replace(/fund/gi, ""));
    list = addTo(list, newStr.replace(/International/gi, ""));
    list = addTo(list, newStr.replace(/Investment/gi, ""));
    list = addTo(list, newStr.replace(/Class A/gi, ""));
    list = addTo(list, newStr.replace(/Class B/gi, ""));
    list = addTo(list, newStr.replace(/Limited Partner Interest/gi, ""));
    list = addTo(list, newStr.replace(/Services/gi, ""));
    list = addTo(list, newStr.replace(/engineering/gi, ""));
    list = addTo(list, newStr.replace(/common stock/gi, ""));
    list = addTo(list, newStr.replace(/bank/gi, ""));
    list = addTo(list, newStr.replace(/Entertainment/gi, ""));
    list = addTo(list, newStr.replace(/co./gi, ""));
    list = addTo(list, newStr.replace(/lab/gi, ""));
    list = addTo(list, newStr.replace(/select/gi, ""));
    list = addTo(list, newStr.replace(/plc/gi, ""));
    list = addTo(list, newStr.replace(/rapeutics/gi, ""));
    list = addTo(list, newStr.replace(/\(\)/gi, ""));
    list = addTo(list, newStr.replace(/\(New\)/gi, ""));
    list = addTo(list, newStr.replace(/communications/gi, ""));
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

