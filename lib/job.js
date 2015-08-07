var Workers = require('../lib/workers');

/**
 * @constructor
 */
var Job = function() {
};

/**
 * @method run
 */
Job.prototype.run = function() {
  var workers = new Workers();
  workers.init(this);

  var args = Array.prototype.slice.call(arguments);

  return {
    ready: function(callback) {
      workers.process.apply(workers, args).ready(callback, 'a');
    }
  };
};

/**
 * To be implemented by child objects.
 * @method merge
 */
Job.prototype.merge = function() {};

/**
 * To be implemented by child objects.
 * @method subproblem
 */
Job.prototype.subproblem = function() {};

module.exports = Job;
