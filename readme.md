# StockZia

## App
The lastest stable version of the app can be tested [here](https://webchat.botframework.com/embed/StockBro?s=cl1X6EqYpG8.cwA.Ch0.ccequknZJSzEVkIKbNfH3bmeWzYE7gLki4BXRQEnwv8).

## Run 

1. Type in `node app.js`

2. Open the microsoft bot emulator and enter url with local host (may need to plug in credentials from .env)

3. Only trained to pickup company names ford and tesla so far

## About Repo

* output.js is mostly for making cards, call functions that get data needed
* chart.js makes the graphs, calls the search function to get the data
* app.js is where the program is run and controlled from
* search.js is where the stock market api is called and json is returned

## Resources

Open the [bot card editor](http://adaptivecards.io/visualizer/index.html?hostApp=Facebook%20(Bot%20Framework)) and copy the example json into the editor to make card that can be displayed to the user.


The [Stock market API](https://iextrading.com/developer/docs/#batch-requests) is called via http request, and returns a json

List of [companies](https://api.iextrading.com/1.0/ref-data/symbols)
-remove -B and -b from ticker then split at (the). replace 'e' wit 'a'

Example Stock [Data](https://api.iextrading.com/1.0/stock/aap/batch?types=company,logo,quote,stats,financials,news,chart,earnings)

upload the xml map to https://draw.io
