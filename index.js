const xray = require('x-ray');

const urlToIndex = 'https://www.distelli.com/docs';

xray(urlToIndex, 'a @href')(function(content) {
	console.log(content);
});
