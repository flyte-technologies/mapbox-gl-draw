var Feature =  require('./feature');



var Polygon = function(ctx, geojson) {
  Feature.call(this, ctx, geojson);
  this.coordinates = this.coordinates.map(coords => coords.slice(0, -1));
};

Polygon.prototype = Object.create(Feature.prototype);

Polygon.prototype.addCoordinate = function(path, lng, lat) {
  var ids = path.split('.').map(x => parseInt(x, 10));

  var ring = this.coordinates[ids[0]];

  ring.splice(ids[1], 0, [lng, lat]);
  this.ctx.store.render();
}

Polygon.prototype.removeCoordinate = function(path) {
  var ids = path.split('.').map(x => parseInt(x, 10));
  var ring = this.coordinates[ids[0]];
  if (ring) {
    ring.splice(ids[1], 1);
    if (ring.length < 3) {
      this.coordinates.splice(ids[0], 1);
    }
    this.ctx.store.render();
  }
}

Polygon.prototype.getCoordinate = function(path) {
  var ids = path.split('.').map(x => parseInt(x, 10));
  var ring = this.coordinates[ids[0]];
  return JSON.parse(JSON.stringify(ring[ids[1]]));
}

Polygon.prototype.getCoordinates = function() {
  return this.coordinates.map(coords => coords.concat([coords[0]]));
}

Polygon.prototype.getSourceFeatures = function() {
  var geojson = this.internalGeoJSON();
  var midpoints = [];
  var vertices = [];

  if (this.drawProperties.direct_selected === 'true') {
    for (var i = 0; i<geojson.geometry.coordinates.length; i++) {
      var ring = geojson.geometry.coordinates[i];
      for (var j = 0; j<ring.length-1; j++) {
        var coord = ring[j];
        var path = `${i}.${j}`;
        vertices.push(toVertex(this.id, coord, path, this.selectedCoords[path] || false));

        if (j > 0) {
          var start = vertices[j-1];
          var end = vertices[j];
          midpoints.push(toMidpoint(this.id, start, end, this.ctx.map));
        }
      }
    }
  }

  // we could rewind once if we did it at the start.
  return [rewind(geojson, true)].concat(midpoints).concat(vertices);
}

module.exports = Polygon;

