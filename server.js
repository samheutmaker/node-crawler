const express = require('express');
const app = express();
const jsonParser = require('body-parser').json();
const _ = require('lodash');
const rClient = require(__dirname + '/lib/redis-connect');

const PORT = process.env.PORT || 3000;


const searchRouter = express.Router();




searchRouter.post('/search', jsonParser, (req, res) => {
  try {
    var query = req.body.query;

    rClient.keys('*', function(err, allItems) {

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

      results = _.filter(results, function(item, itemIndex) {
        return (item.count > 0) ? true : false;
      });

      function sortByCount(a, b) {
        if (a.count < b.count)
          return 1;
        else if (a.count > b.count)
          return -1;
        else
          return 0;
      };

      results = results.sort(sortByCount);
      results.length = 10;

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