/**
 * This example aggregates values from an array,
 * each operation is performed in a separate worker
 * thread.
 */
var Workers = require('../lib/workers');

// Defines the job that is performed,
// individually by each worker
var job = function(data) {
  return data;
};

// Defines the operation that merges data
// whenever a worker finishes
var merge = function(current, previous) {
  if (typeof previous === 'undefined') {
    previous = 0;
  }
  return current + previous;
};

var workers = new Workers();
workers.init(job, merge);
workers.process([1, 2, 3, 4]).ready(function(result) {
  console.log('The result is ' + result);
});
