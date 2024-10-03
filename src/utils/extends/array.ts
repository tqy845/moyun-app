Array.prototype.isEmpty = function () {
  return this.length === 0
}

Array.prototype.peek = function () {
  return this[this.length - 1]
}

Array.prototype.clear = function () {
  this.length = 0
}
