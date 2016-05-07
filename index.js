const fs = require('fs');
const xray = require('x-ray')();
const s = require('staff');
const _ = require('lodash');
var rClient = require(__dirname + '/lib/redis-connect');

const urlToIndex = process.argv[3] || 'https://www.distelli.com/docs';

// Initialize
crawlForLinks(urlToIndex, 2);

// Build Links Recursively and stores them in Redis
function crawlForLinks(startingUrl, limit) {

  // Holds URLS
  var urlHolder = [];

  // Add one url as seed
  urlHolder.push(startingUrl);

  // For tracking recursion
  var called = 0;

  // Initialize
  crawlHeldLinks();


  // -== Called Recursively to build links
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
        // Remove all that dont fit url
        urlHolder = removeAllWithout(urlHolder, startingUrl);

        // Log
        console.log(urlHolder);
        console.log(currentLen)
        console.log(x);

        // Call again with new links or console.log all links
        if (x === currentLen - 1) {
          if (called === limit) {
            fs.writeFileSync('links-html.json', JSON.stringify(urlHolder));

            // Create hash
            var redisHash = {};

            // Add all links Redis
            _.each(urlHolder, function(linkToHash, linkIndex) {
              rClient.set(linkToHash, linkToHash);
            });

           	// Scrape Content
            getContent();

            // Log
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
}; // End crawlForLinks 


// Scrape all content from links in Redis
function getContent() {
  rClient.keys('*', function(err, reply) {
  	var replyArray = _.map(reply, function(el, i) {
  		return el;
  	});

    waitAndFire(0, replyArray.length, function(x) {
      xray(replyArray[x], 'body @text')(function(err, content) {
   		if(err) {
   			console.log(err);
   			console.log('There was an error scraping');
   		} else {
   			rClient.set(replyArray[x], content, function(err, reply1) {
   				console.log(reply1);
   			});
   		}

      });
    }); 
  });
};



// --=== (Mostly) Functional Helpers

// Returns only string that have
function removeAllWithout(array, stringToCheckFor) {
  return _.filter(array, function(el, i) {
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
};
