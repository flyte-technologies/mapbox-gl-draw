var Feature = require('./feature');

var LineString = function(ctx, geojson) {
  Feature.call(this, ctx, geojson);
  this.selectedCoords = {};
};

LineString.prototype = Object.create(Feature.prototype);

LineString.prototype.addCoordinate = function(path, lng, lat) {
  this.selectedCoords = {};
  var id = parseInt(path, 10);
  this.coordinates.splice(id, 0, [lng, lat]);
  this.ctx.store.render();
};

LineString.prototype.removeCoordinate = function(path) {
  this.selectedCoords = {};
  var id = parseInt(path, 10);
  this.coordinates.splice(id, 1);
  if (this.coordinates.length < 2) {
    this.ctx.store.delete(this.id);
  }
  this.ctx.store.render();
};

LineString.prototype.getCoordinate = function(path) {
  var id = parseInt(path, 10);
  return JSON.parse(JSON.stringify(this.coordinates[id]));
};

module.exports = LineString;

