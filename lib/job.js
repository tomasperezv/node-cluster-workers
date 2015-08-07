var Workers = require('../lib/workers');

/**
 * @constructor
 */
var Job = function() {
  /**
   * @type {Workers|null}
   */
  this._workers = null;

  /**
   * @type {Array|null}
   */
  this._input = null;

  /**
   * @type {Function|null}
   */
  this._merge = null;

  /**
   * @type {Function|null}
   */
  this._subproblem = null;
};

/**
 * Sets the input for a problem
 * @method run
 */
Job.prototype.input = function() {
  this._input = Array.prototype.slice.call(arguments);
  this._workers = new Workers();
  this._workers.init(this);
  return this;
};

/**
 * @method done
 * @param {Function} callback
 */
Job.prototype.done = function(callback) {
  this._workers.process.apply(this._workers, this._input)
    .ready(callback);
};

/**
 * @method merge
 */
Job.prototype.merge = function() {
  var args = Array.prototype.slice.call(arguments);
  return this._merge.apply(this, args);
};

/**
 * @method subproblem
 */
Job.prototype.subproblem = function() {
  var args = Array.prototype.slice.call(arguments);
  return this._subproblem.apply(this, args);
};

/**
 * Defines the operation that merges data
 * whenever a subproblem is completed.
 * @method conquer
 * @param callback
 */
Job.prototype.conquer = function(callback) {
  this._merge = callback;
  return this;
};

/**
 * Defines the job that is performed,
 * individually by each worker.
 * @method divide
 */
Job.prototype.divide = function(callback) {
  this._subproblem = callback;
  return this;
};

module.exports = Job;
