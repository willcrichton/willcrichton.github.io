/**
 * util.js: Contains some utility functions.
 */

define(function(require) {
  var Util = {};

  Util.randElem = function(arr) {
    if (!arr || !arr.length) {
      return;
    }

    var i = Math.floor(Math.random() * arr.length);
    return arr[i];
  };

  /* Random string of length n */
  Util.randString = function(len) {
    return Math.random().toString(35).substr(2, len);
  };

  /* Splits arr into n buckets, deterministically. */
  Util.makeBuckets = function(arr, n) {
    var lists = _.groupBy(arr, function(x, i) {
      return Math.floor(i % n);
    });
    return _.toArray(lists);
  };

  Util.connectFirebase = function(url) {
    return new Firebase('https://timegroup.firebaseio.com' + url);
  };

  return Util;
});
