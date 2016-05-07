const xray = require('x-ray')();

var redis = require('redis');

var rClient = redis.createClient();

// Connect to Redis
rClient.on('connect', function() {
	console.log('Connected to Redis');
});



const urlToIndex = 'https://www.distelli.com/docs';

var query = "agent";


var promiseHolder = [];
var allContent = {};

xray(urlToIndex, ['a @href'])(function(err, content) {
	content.forEach(function(el, index) {

		if(el.indexOf(urlToIndex) > -1) {
			promiseHolder.push(scrapeContent(el))
		}

	})

	Promise.all(promiseHolder).then(function(promises) {
		console.log(promises);
		promises.forEach(function(urlWContent, index) {
			rClient.hmset(urlToIndex, urlWContent.url, urlWContent.content, function(err, reply) {
				console.log(err);
				console.log(reply);
			});

		});


	}, function(err) {
		console.log(err);
	})
});




function scrapeContent(url){
	return new Promise(function(resolve, reject) {
		xray(url, 'body @text')(function(err, content) {
			(err) ? reject(err) : resolve({url: url, content: content});
		});
	});
}
