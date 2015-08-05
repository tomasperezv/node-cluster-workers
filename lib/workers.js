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
  this._targetSize = 0;
  this._processedSize = 0;
  this._onReadyListeners = [];
  this._result;
};

/**
 * Initializes a number of child worker processes.
 *
 * @method run
 * @param {Function} init
 */
Workers.prototype.init = function(job, merge) {

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
          self._processedSize++;
          // Merge the data
          self._result = merge(data, self._result);

          if (self._processedSize === self._targetSize) {
            self.onReady();
          }

        });

      })(newWorker);

    }
  } else {
    // Run the process in the worker children
    process.on('message', function(data) {
      if (typeof data === 'undefined' || data.length === 0) {
        // Ignore empty messages
        return;
      }
      var result = job(data);
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
 * @param {Object} data
 * @param {Function} onComplete
 * @method process
 * @return {Function}
 */
Workers.prototype.process = function(data) {

  if (cluster.isMaster) {
    this._targetSize = data.length;
    var i;
    var bucketSize = Math.floor(data.length/this._n);
    for (i = 0; i <= this._n ; i++) {
      this.findWorkerAndProcess(data.slice(i*bucketSize, i*bucketSize+bucketSize));
    }
  }

  var self = this;
  return {
    ready: function(callback) {
      self._onReadyListeners.push(callback);
    }
  };

};

module.exports = Workers;
