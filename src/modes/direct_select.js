var {noFeature, isOfMetaType, isShiftDown} = require('./lib/common_selectors');

var toMidpoint = require('../lib/to_midpoint');
var toVertex = require('../lib/to_vertex');

module.exports = function(ctx, featureId) {
  var feature = ctx.store.get(featureId);

  var dragging = false;
  var startPos = null;
  var coordPos = null;
  var numCoords = null;

  var selectedCoordPaths = [];


  var onVertex = function(e) {
    dragging = true;
    startPos = e.lngLat;
    var about = e.featureTarget.properties;
    var selectedIndex = selectedCoordPaths.indexOf(about.path);
    if (!isShiftDown(e) && selectedIndex === -1) {
      selectedCoordPaths = [about.path];
    }
    else if (isShiftDown(e) && selectedIndex === -1) {
      selectedCoordPaths.push(about.path);
    }
  }

  var onMidpoint = function(e) {
    dragging = true;
    startPos = e.lngLat;
    var about = e.featureTarget.properties;
    feature.addCoordinate(about.path, about.lng, about.lat);
    selectedCoordPaths  = [about.path];
  }

  var setupCoordPos = function() {
    coordPos = selectedCoordPaths.map(path => feature.getCoordinate(path));
    numCoords = coordPos.length;
  }

  return {
    start: function() {
      ctx.ui.setClass('mapbox-gl-draw_mouse-direct-select');
      this.on('mousedown', isOfMetaType('vertex'), onVertex);
      this.on('mousedown', isOfMetaType('midpoint'), onMidpoint);
      this.on('drag', () => dragging, function(e) {
        e.originalEvent.stopPropagation();
        if (coordPos === null) {
          setupCoordPos();
        }
        var lngChange = e.lngLat.lng - startPos.lng;
        var latChange = e.lngLat.lat - startPos.lat;

        for (var i=0; i<numCoords; i++) {
          var path = selectedCoordPaths[i];
          var pos = coordPos[i];
          var lng = pos[0] + lngChange;
          var lat = pos[1] + latChange;
          feature.updateCoordinate(path, lng, lat);
        }
      });
      this.on('mouseup', () => true, function() {
        dragging = false;
        coordPos = null;
        numCoords = null;
        startPos = null;
      });
      this.on('doubleclick', () => true, function(e) {
        e.originalEvent.stopPropagation();
        ctx.events.changeMode('default', [featureId]);
      });
      this.on('click', noFeature, function(e) {
        selectedCoordPaths = [];
      });
      this.on('trash', function() {
        feature.deleteCoordinates(selectedCoordPaths);
        if (feature.isValid() === false) {
          ctx.store.delete(id);
          ctx.events.changeMode('default');
        }
      });
    },
    stop: function() {
      ctx.ui.clearClass();
    },
    render: function(geojson) {
      geojson.properties.active = featureId === geojson.properties.id ? 'true' : 'false';
      var midpoints = [];
      var vertices = [];
      for (var i = 0; i<geojson.geometry.coordinates.length; i++) {
        var ring = geojson.geometry.coordinates[i];
        for (var j = 0; j<ring.length-1; j++) {
          var coord = ring[j];
          var path = `${i}.${j}`;

          vertices.push(toVertex(feature.id, coord, path, selectedCoordPaths.indexOf(path) > -1));

          if (j > 0) {
            var start = vertices[j-1];
            var end = vertices[j];
            midpoints.push(toMidpoint(feature.id, start, end, ctx.map));
          }
        }
      }
      return [geojson].concat(midpoints).concat(vertices);
    }
  }
}
