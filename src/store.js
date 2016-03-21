var {throttle} = require('./lib/util');
var render = require('./render');

var Store = module.exports = function(ctx) {
  this.ctx = ctx;
  this.features = {};
  this.render = throttle(render, 16, this);
};

Store.prototype.add = function(feature) {
  this.features[feature.id] = feature;
  this.render();
  return feature.id;
};

Store.prototype.get = function(id) {
  return this.features[id];
};

Store.prototype.getAll = function() {
  return Object.keys(this.features).map(id => this.features[id]);
};

Store.prototype.delete = function (id) {
  var feature = this.get(id);
  this.render();
  if (feature) {
    delete this.features[id];
    this.render();
  }
};
