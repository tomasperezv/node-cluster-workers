/**
 * This example aggregates values from an array,
 * each operation is performed in a separate worker
 * thread.
 */
var Job = require('../lib/job');

// This example aggregates values from an array,
// each operation is performed in a separate worker
// thread.
new Job()
  // The problem to solve with its input data
  .input([1, 2, 3, 4, 5])
  // Defines the job that is performed,
  // individually by each worker.
  .divide(function(data) {
    return data;
  })
  // Defines the operation that merges data
  // whenever a subproblem is completed.
  .conquer(function(current, previous) {
    if (typeof previous === 'undefined') {
      previous = 0;
    }
    return current + previous;
  })
  // When the process is completed this callback is
  // run.
  .done(function(result) {
    console.log('the result is ' + result);
  });
