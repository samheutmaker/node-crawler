const fs = require('fs');
const xray = require('x-ray')();
const s = require('staff');
const _ = require('lodash');



// var redis = require('redis');

// var rClient = redis.createClient();

// // Connect to Redis
// rClient.on('connect', function() {
//   console.log('Connected to Redis');
// });



const urlToIndex = 'https://www.distelli.com/docs';

var query = "agent";


var promiseHolder = [];
var urlHolder = [];

function crawlForLinks(startingUrl, limit) {
  // For tracking recursion
  var called = 0;
  // Add one url as seed
  urlHolder.push(startingUrl);
  // Initialize
  crawlHeldLinks();


  function crawlHeldLinks() {
  	// Track call
    called++
      // Record length
    var currentLen = urlHolder.length;


	// Scrape links
    waitAndFire(0, urlHolder.length, function(x) {
      xray(urlHolder[x], ['a @href'])(function(err, content) {
      	// Append new links
        urlHolder = urlHolder.concat(content);
        // Remove Duplicates
        urlHolder = s.removeDuplicates(urlHolder);

        urlHolder = removeAllWithout(urlHolder, startingUrl);

        console.log(urlHolder);
        console.log(currentLen)
        console.log(x);

        // Call again with new links or console.log all links
        if (x === currentLen - 1) {
          if (called === limit) {
            fs.writeFileSync('links-html.json', JSON.stringify(urlHolder));
            
            console.log('Finished');
          } else {
            crawlHeldLinks(urlHolder);
            console.log('Restart Recursion:' + called);
          }
        
        } else {
        	console.log('Continuing');
        }

      });
    });

  };
};


// Returns only string that have
function removeAllWithout(array, stringToCheckFor) {
	 return _.filter(array, function(el, i){
		return (el.substr(0, stringToCheckFor.length) === stringToCheckFor) ? true : false
	});
};



// Executes Callback every one second
function waitAndFire(min, max, callback) {

  if (min < max) {

    setTimeout(function() {
      callback(min);

      waitAndFire(++min, max, callback);
    }, 1000);
  }
}

crawlForLinks(urlToIndex, 2);




// Promise.all(promiseHolder).then(function(promises) {
//   console.log(promises);
//   promises.forEach(function(urlWContent, index) {
//     rClient.hmset(urlToIndex, urlWContent.url, urlWContent.content, function(err, reply) {
//       console.log(err);
//       console.log(reply);
//     });

//   });


// }, function(err) {
//   console.log(err);
// });



// function scrapeContent(url) {
//   return new Promise(function(resolve, reject) {
//     xray(url, 'body @text')(function(err, content) {
//       (err) ? reject(err) : resolve({
//         url: url,
//         content: content
//       });
//     });
//   });
// }