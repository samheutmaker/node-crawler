var redis = require('redis');
const _ = require('lodash');

var rClient = redis.createClient();

// Connect to Redis
rClient.on('connect', function() {
  console.log('Connected to Redis');
});


var term = 'agent'

const urlToIndex = 'https://www.distelli.com/docs';


rClient.hgetall(urlToIndex, function(err, reply) {
  console.log(err);

  var searchResults = [];
  // Iterate through each page
  _.each(reply, function(el, i) {
  	console.log(i)

  	var matchingCount = 0;

  	// Iterate through each word
    el.split(" ").forEach(function(word, wIndex) {
      if (word.toLowerCase() == term.toLowerCase()) {
        matchingCount++;
      }
    });

    searchResults.push({
      url: i,
      count: matchingCount
    });

  });


  console.log(searchResults);
});