# node-cluster-workers
A wrapper on top of cluster to abstract parallel computation for divide and conquer algorithms.

### Example of usage

```javascript
/**
 * This example aggregates values from an array,
 * each operation is performed in a separate worker
 * thread.
 */
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

// Instantiates the job object and solves an example
var sumjob = new SumJob();
sumjob.run([1, 2, 3, 4, 5]).ready(function(result) {
  console.log('the result is ' + result);
});
```

Author
----------
Tomas Perez - tom@0x101.com

http://www.tomasperez.com

License
-----------
Public Domain.

No warranty expressed or implied. Use at your own risk.
