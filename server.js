const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const _ = require('lodash');
const h = require(__dirname + '/lib/helpers');
const rClient = require(__dirname + '/lib/redis-connect');

const PORT = process.env.PORT || 3000;


const searchRouter = express.Router();


// Headers
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:1313');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST');
  next();
});

// Body Parsing
app.use(bodyParser.urlencoded({ extended: true })); 

// Terms to ignore
var termsToIgnore = ['and', 'but', 'with', 'or'];


// Search Route
searchRouter.post('/search', jsonParser, (req, res) => {
  try {

    var query = req.body.query.split(" ");
    // Remove Terms
    query = h.removeFromArray(query, termsToIgnore);

    // Get all keys
    rClient.keys('*', function(err, allItems) {
      // Check for matches 
      var results = _.map(allItems, function(el, key) {
        var toReturn = {
          url: el,
          count: 0
        };

        _.each(query, function(queryItem, queryItemIndex) {
          if (toReturn.url.indexOf(queryItem) > -1) {
            toReturn.count++;
          }
        })

        return toReturn;
      });

      // Filter out zero
      results = _.filter(results, function(item, itemIndex) {
        return (item.count > 0) ? true : false;
      });

      // Sort
      results = results.sort(h.sortByCount);
      // Truncate
      results.length = 10;

      // Send results
      res.status(200).json(results);

    });


  } catch (e) {
    res.status(500).json({
      msg: 'There was an error'
    });
  }

});

app.use('/', searchRouter);

app.listen(PORT, () => {
  console.log('Server live on PORT ' + PORT);
});