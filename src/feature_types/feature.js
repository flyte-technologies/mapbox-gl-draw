var hat = require('hat');

var Feature = function(ctx, geojson) {
  this.ctx = ctx;
  this.userProperties = geojson.properties || {};
  this.coordinates = geojson.geometry.coordinates;
  this.id = geojson.id || hat();
  this.type = geojson.geometry.type;

  this.drawProperties = {
    id: this.id,
    type: this.type,
    meta: 'feature',
    selected: 'false',
    direct_selected: 'false'
  }

  ctx.store.add(this);
}

Feature.prototype.updateCoordinate = function(path, lng, lat) {
  path = path + '';
  var ids = path === '' ? [] : path.split('.').map(x => parseInt(x, 10));
  if (this.coordinates[ids[0]] === undefined && ids.length > 0) {
    this.coordinates[ids[0]] = []
  }
  var coordinate = ids.length === 0 ? this.coordinates : (this.coordinates[ids[0]] || []);
  for(var i=1; i<ids.length; i++) {
    if (coordinate[ids[i]] === undefined) {
      coordinate.push([]);
    }
    coordinate = coordinate[ids[i]];
  }
  coordinate[0] = lng;
  coordinate[1] = lat;
  this.ctx.store.render();
}

Feature.prototype.update = function(geojson) {
  this.userProperties = geojson.properties || this.userProperties;
  this.coordinates = geojson.coordinates || geojson.geometry.coordinates;
  this.ctx.store.render();
}

Feature.prototype.getCoordinates = function() {
  return JSON.parse(JSON.stringify(this.coordinates));
}

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
}

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
    }
}

module.exports = Feature;
