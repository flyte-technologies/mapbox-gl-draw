var hat = require('hat');

var Feature = function(ctx, geojson) {
  this.ctx = ctx;
  this.userProperties = geojson.properties || {};
  this.coordinates = geojson.geometry.coordinates;
  this.id = geojson.id || hat();
  this.type = geojson.geometry.type;

  ctx.store.add(this);
};

Feature.prototype.updateCoordinate = function(path, lng, lat) {
  path = path + '';
  var ids = path === '' ? [] : path.split('.').map(x => parseInt(x, 10));
  if (this.coordinates[ids[0]] === undefined && ids.length > 0) {
    this.coordinates[ids[0]] = [];
  }
  var coordinate = ids.length === 0 ? this.coordinates : (this.coordinates[ids[0]] || []);
  for(var i = 1; i < ids.length; i++) {
    if (coordinate[ids[i]] === undefined) {
      coordinate.push([]);
    }
    coordinate = coordinate[ids[i]];
  }
  coordinate[0] = lng;
  coordinate[1] = lat;
};

Feature.prototype.isValid = function() {
  if (this.type === 'Point') {
    return typeof this.coordinates[0] === 'number';
  }
  else if (this.type === 'LineString') {
    return this.coordinates.length > 1;
  }
  else {
    return this.coordinates.every(function(ring) {
      return ring.length > 2;
    });
  }
};

Feature.prototype.getCoordinate = function(path) {
  path = path + '';
  var ids = path === '' ? [] : path.split('.').map(x => parseInt(x, 10));
  if (this.coordinates[ids[0]] === undefined && ids.length > 0) {
    this.coordinates[ids[0]] = [];
  }
  var coordinate = ids.length === 0 ? this.coordinates : (this.coordinates[ids[0]] || []);
  for(var i = 1; i < ids.length; i++) {
    if (coordinate[ids[i]] === undefined) {
      coordinate.push([]);
    }
    coordinate = coordinate[ids[i]];
  }
  return coordinate;
};

Feature.prototype.deleteCoordinates = function(paths) {
  paths.sort();
  var iPath = paths.length;
  var toInt = (x) => parseInt(x, 10);
  while (iPath--) {
    var data = this.coordinates;
    var path = paths[iPath];
    var pathParts = path.split('.').map(toInt);
    var end = pathParts.length - 1;
    for (var i = 0; i < end; i++) {
      data = data[pathParts[i]];
    }
    data.splice(pathParts[end], 1);
  }
};

Feature.prototype.update = function(geojson) {
  this.userProperties = geojson.properties || this.userProperties;
  this.coordinates = geojson.coordinates || geojson.geometry.coordinates;
};

Feature.prototype.getCoordinates = function() {
  return JSON.parse(JSON.stringify(this.coordinates));
};

Feature.prototype.toGeoJSON = function() {
  return JSON.parse(JSON.stringify({
    'id': this.id,
    'type': 'Feature',
    'properties': this.userProperties,
    'geometry': {
      'coordinates': this.getCoordinates(),
      'type': this.type
    }
  }));
};

Feature.prototype.internal = function() {
  return {
    'type': 'Feature',
    'properties': {
      'id': this.id,
      'meta': 'feature',
      'active': 'false'
    },
    'geometry': {
      'coordinates': this.getCoordinates(),
      'type': this.type
    }
  };
};

module.exports = Feature;
