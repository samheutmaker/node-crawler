const fs = require('fs');
const s = require('staff');
const _ = require('lodash');
const urlToIndex = 'https://www.distelli.com/docs';

var links = JSON.parse(fs.readFileSync('links-html.json', 'utf8'));

console.log(links.length);
console.log(s.removeDuplicates(links).length);
console.log(removeAllWithout(links, urlToIndex).length);


function removeAllWithout(array, stringToCheckFor) {
	 return _.filter(array, function(el, i){
		return (el.substr(0, stringToCheckFor.length) === stringToCheckFor) ? true : false
	});
};

