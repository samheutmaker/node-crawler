const _ = require('lodash');

const helpers = {
  // Returns only strings that have second parameter as beginning
  removeAllWithout: function(array, stringToCheckFor) {
    return _.filter(array, function(el, i) {
      return (el.substr(0, stringToCheckFor.length) === stringToCheckFor) ? true : false
    });
  },
  // Executes Callback every one second
  waitAndFire: function (min, max, callback) {
    if (min < max) {
      setTimeout(function() {
        callback(min);
        helpers.waitAndFire(++min, max, callback);
      }, 1000);
    }
  },
  removeDuplicates: function(array) {
  	var toReturn = [];
    var helper = {};
    _.each(array, function(el, i) {
      helper[el] = true;
    })
    for (var i in helper) {
      toReturn.push(i);
    }
    return toReturn;
  }
};


module.exports = exports = helpers;