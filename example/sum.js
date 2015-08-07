/**
 * This example aggregates values from an array,
 * each operation is performed in a separate worker
 * thread.
 */
var Workers = require('../lib/workers');
var Job = require('../lib/job');

/**
 * @constructor
 */
var SumJob = function() {
  Job.call(this);
};

SumJob.prototype = new Job();

/**
 * Defines the job that is performed,
 * individually by each worker.
 *
 * @method run
 * @param {Array} data
 */
SumJob.prototype.subproblem = function(data) {
  return data;
};

/**
 * Defines the operation that merges data
 * whenever a subproblem is completed.
 *
 * @param {Array} current
 * @param {Array} previous
 */
SumJob.prototype.merge = function(current, previous) {
  if (typeof previous === 'undefined') {
    previous = 0;
  }
  return current + previous;
};

// Example code
var sumjob = new SumJob();
sumjob.run([1, 2, 3, 4, 5]).ready(function(result) {
  console.log('the result is ' + result);
});
