var Feature =  require('./feature');

var toMidpoint = require('../lib/to_midpoint');
var toVertex = require('../lib/to_vertex');

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
}

LineString.prototype.removeCoordinate = function(path) {
  this.selectedCoords = {};
  var id = parseInt(path, 10);
  this.coordinates.splice(id, 1);
  if (this.coordinates.length < 2) {
    this.ctx.store.delete(this.id);
  }
  this.ctx.store.render();
}

LineString.prototype.getCoordinate = function(path) {
  var id = parseInt(path, 10);
  return JSON.parse(JSON.stringify(this.coordinates[id]));
}

LineString.prototype.getSourceFeatures = function() {
  var geojson = this.internalGeoJSON();
  var midpoints = [];
  var vertices = [];

  if (this.drawProperties.direct_selected === 'true') {
    for (var i = 0; i<geojson.geometry.coordinates.length; i++) {
      var coord = geojson.geometry.coordinates[i];
      var path = `${i}`;
      vertices.push(toVertex(this.id, coord, path, this.selectedCoords[path]));

      if (i > 0) {
        var start = vertices[i-1];
        var end = vertices[i];
        midpoints.push(toMidpoint(this.id, start, end, this.ctx.map));
      }
    }
  }

  return [geojson].concat(midpoints).concat(vertices);
}

module.exports = LineString;

