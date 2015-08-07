var cluster = require('cluster');
  var os = require('os');

/**
 * Abstraction on top of Node.js cluster to spawn
 * worker processes.
 *
 * The limit is defined by the number of system CPU's.
 *
 * @constructor
 */
var Workers = function() {
  this._n = os.cpus().length;
  this._workers = {};
  this._targetBuckets = 0;
  this._processedBuckets = 0;
  this._onReadyListeners = [];
  this._result = null;
};

/**
 * Initializes a number of child worker processes.
 *
 * @method run
 * @param {Job} job
 */
Workers.prototype.init = function(job) {

  if (cluster.isMaster) {

    var i;

    for (i = 1; i <= this._n; i++) {
      cluster.fork();
      var newWorker = cluster.workers[i];
      var self = this;
      this._workers[newWorker.id] = {
        worker: newWorker,
        busy: false,
        count: 0
      };

      (function(newWorker) {
        newWorker.on('message', function(data) {
          self._workers[newWorker.id].busy = false;
          self._processedBuckets++;

          // Merge the data
          self._result = job.merge(data, self._result);

          if (self._processedBuckets === self._targetBuckets) {
            self.onReady();
          }

        });

      })(newWorker);

    }
  } else {
    // Run the process in the worker children
    process.on('message', function(data) {

      var converted = 0;
      data.map(function(i) {
        converted += i;
      });

      var result = job.subproblem(converted);
      // Send the result to the parent
      process.send(result);
    });
  }
};

/**
 * @method findWorkerAndProcess
 * @param {Array} data
 */
Workers.prototype.findWorkerAndProcess = function(data) {
  var self = this;
  var id, intervalId;
  intervalId = setInterval(function() {
    for (id in self._workers) {
      if (!self._workers[id].busy) {
        try {
          // Lock the worker and send message
          self._workers[id].busy = true;
          self._workers[id].worker.send(data);
          clearInterval(intervalId);
        } catch (e) {
        }
        break;
      }
    }
  }, 300);
};

/**
 * @method onReady
 */
Workers.prototype.onReady = function() {
  var self = this;
  this._onReadyListeners.map(function(current) {
    current(self._result);
  });

  if (cluster.isMaster) {
    for (var id in this._workers) {
      this._workers[id].worker.disconnect();
    }
  }

};

/**
 * Finds an available worker, determined by the
 * available CPU cores and sends the data.
 *
 * Provides a callback for when the data is ready.
 *
 * @method process
 * @return {Function}
 */
Workers.prototype.process = function() {

  var divRate = 0.5;

  if (cluster.isMaster) {
    var blocksPerWorker = arguments[0].length * divRate;
    this._targetBuckets = 1 / divRate;
    if ((1 / divRate) % 1 !== 0) {
      this._targetBuckets++;
    }

    var i;
    for (i = 0; i < this._targetBuckets; i++) {
      var subdata = [];
      if (i === (this._targetBuckets - 1)) {
        // The last item might have extra left elements
        // as a consequence of a uneven distribution.
        subdata = arguments[0].slice(i*blocksPerWorker);
      } else {
        subdata = arguments[0].slice(i*blocksPerWorker, i*blocksPerWorker+blocksPerWorker);
      }
      this.findWorkerAndProcess(subdata);

    }
  }

  var self = this;
  return {
    ready: function(callback, a) {
      if (cluster.isMaster) {
        self._onReadyListeners.push(callback);
      }
    }
  };

};

module.exports = Workers;
