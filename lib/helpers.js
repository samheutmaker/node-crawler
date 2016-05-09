const _ = require('lodash');

const helpers = {
  // Returns only strings that have second parameter as beginning
  removeAllWithout: function(array, stringToCheckFor) {
    return _.filter(array, function(el, i) {
      return (el.substr(0, stringToCheckFor.length) === stringToCheckFor) ? true : false
    });
  },
  // Executes Callback every one second
  waitAndFire: function(min, max, callback) {
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
  },
  removeFromArray: function(array, terms) {
    var holder = {};
    _.each(array, function(arrayItem, itemIndex) {
      holder[arrayItem] = itemIndex;
    });
    _.each(terms, function(termItem, termIndex) {
      if (holder.hasOwnProperty(termItem)) {
        array[holder[termItem]] = null;
      }
    });
    return array;
  },
  sortByCount: function (a, b) {
    if (a.count < b.count)
      return 1;
    else if (a.count > b.count)
      return -1;
    else
      return 0;
  }
};


module.exports = exports = helpers;