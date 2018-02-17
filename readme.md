# StockZia

## Run 

1. Type in `node app.js`

2. Open the microsoft bot emulator and enter url with local host

3. Only trained to pickup company names ford and tesla so far

## Repo

* output.js is mostly for making cards, call functions that get data needed
* chart.js makes the graphs, calls the search function to get the data
* app.js is where the program is run and controlled from
* search.js is where the stock market api is called and json is returned

## Resources

Open the [bot card editor](http://adaptivecards.io/visualizer/index.html?hostApp=Facebook%20(Bot%20Framework)) and copy the example json into the editor to make card that can be displayed to the user.


The [Stock market API](https://iextrading.com/developer/docs/#batch-requests) is called via http request, and returns a json



