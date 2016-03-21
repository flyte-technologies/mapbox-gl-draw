var {isEnterKey, isEscapeKey} = require('../lib/common_selectors');
var LineString = require('../feature_types/line_string');

module.exports = function(ctx) {

  var feature = new LineString(ctx, {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'LineString',
      'coordinates': [[0, 0],[0, 0]]
    }
  });

  var stopDrawingAndRemove = function() {
    ctx.events.changeMode('default');
    ctx.store.delete(feature.id);
  };

  var pos = 0;

  var onMouseMove = function(e) {
    if(pos === 0) {
      feature.updateCoordinate(0, e.lngLat.lng, e.lngLat.lat);
      feature.updateCoordinate(1, e.lngLat.lng, e.lngLat.lat);
    }
    else {
      feature.updateCoordinate(pos, e.lngLat.lng, e.lngLat.lat);
    }
  };

  var onClick = function() {
    // did we click on the last point
    // did we click on the first point
    pos++;
  };

  var onFinish = function() {
    if(pos < 2) {
      stopDrawingAndRemove();
    }
    else {
      ctx.events.changeMode('default');
    }
  };

  return {
    start: function() {
      ctx.ui.setClass('mapbox-gl-draw_mouse-add');
      this.on('mousemove', () => true, onMouseMove);
      this.on('click', () => true, onClick);
      this.on('keyup', isEscapeKey, stopDrawingAndRemove);
      this.on('keyup', isEnterKey, onFinish);
    },
    stop: function() {
      ctx.ui.clearClass();
    },
    render: function(geojson) {
      geojson.properties.active = geojson.properties.id === feature.id ? 'true' : 'false';

      if (geojson.properties.active === 'true' && pos === 0) {
        var coords = [geojson.geometry.coordinates[0][0], geojson.geometry.coordinates[0][1]];
        geojson = {
          'type': 'Feature',
          'properties': geojson.properties,
          'geometry': {
            'coordinates': coords,
            'type': 'Point'
          }
        };
      }
      return geojson;
    }
  };
};
