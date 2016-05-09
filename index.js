const fs = require('fs');
const xray = require('x-ray')();
const h = require(__dirname + '/lib/helpers');
const _ = require('lodash');
const rClient = require(__dirname + '/lib/redis-connect');

// Read config.son
try {
  const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
} catch (e) {
  console.log('There was an error reading the configuration file');
}

// Set congfiguration variables
const startingUrl = config.url || process.argv[3];
const limit = parseInt(config.linkBuild) || process.argv[4];




var tasks = [buildLinks, populateRedisFromKeys];

tasks.reduce(function(cur, next) {
  return cur.then(next);
}, Promise.resolve()).then(function() {
  console.log('Complete');
});




// Build Links Recursively and stores them in Redis
function buildLinks() {

  return new Promise(function(resolve, reject) {

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
      h.waitAndFire(0, urlHolder.length, function(x) {

        xray(urlHolder[x], ['a @href'])(function(err, content) {
          if (err) reject(err);
          // Append new links
          urlHolder = urlHolder.concat(content);
          // Remove Duplicates
          urlHolder = h.removeDuplicates(urlHolder);
          // Remove all that dont fit url
          urlHolder = h.removeAllWithout(urlHolder, startingUrl);

          // Log
          console.log(urlHolder);
          console.log(currentLen)
          console.log(x);

          // Call again with new links or console.log all links
          if (x === currentLen - 1) {
            if (called === limit) {
              // Create hash
              var redisHash = {};

              // Add all links Redis as keys and values
              _.each(urlHolder, function(linkToHash, linkIndex) {
                rClient.set(linkToHash, linkToHash);
              });

              // Log
              console.log('Finished');
              resolve();

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
  })
}; // End crawlForLinks 


// Scrape all content from links in Redis
function populateRedisFromKeys() {
  return new Promise(function(resolve, reject) {
    console.log('Begin Populating Redis');

    // Get all key from redis
    rClient.keys('*', function(err, reply) {

      // Create an array of URLS out of redis keys
      var replyArray = _.map(reply, function(el, i) {
        return el;
      });

      // Iterate over URL array 1/second and scrape content
      h.waitAndFire(0, replyArray.length, function(x) {
        xray(replyArray[x], 'body @text')(function(err, content) {
          if (err) {
            reject(err);
          } else {
            rClient.set(replyArray[x], content, function(err, reply1) {
              console.log(reply1);
            });
          }
        });

        if (x === replyArray.length - 2) {
          resolve();
        }
      });
    });
  })
};