var QuickSort = function() {
};

/**
 * @param {Array} a
 * @param {Number} left
 * @param {Number} right
 */
QuickSort.prototype.solve = function(a, left, right) {

  if (typeof left === 'undefined') {
    left = 0;
  }

  if (typeof right === 'undefined') {
    right = a.length - 1;
  }

  if (left >= right) {
    return;
  }

  var pivot = Math.floor((left+right)/2);
  var pivotPos = this.partition(a, left, right, pivot);
  this.solve(a, left, pivotPos-1);
  this.solve(a, pivotPos+1, right);
};

/**
 * @method partition
 * @param {Array} a
 * @param {Number} left
 * @param {Number} right
 * @return {Number}
 */
QuickSort.prototype.partition = function(a, left, right, pivot) {

  this.swap(a, pivot, right);
  var i, j;
  j = left;

  for (i = left; i < right; i++) {
    if (a[i] <= a[right]) {
      this.swap(a, i, j);
      j++;
    }
  }

  this.swap(a, right, j);
  return j;

};

/**
 * @method swap
 * @param {Array} a
 * @param {Number} i
 * @param {Number} j
 */
QuickSort.prototype.swap = function(a, i, j) {
  var tmp = a[i];
  a[i] = a[j];
  a[j] = tmp;
};

module.exports = QuickSort;
