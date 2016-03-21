var {isEnterKey, isEscapeKey} = require('../lib/common_selectors');
var Polygon = require('../feature_types/polygon');
const types = require('../lib/types');

module.exports = function(ctx) {

  var feature = new Polygon(ctx, {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'Polygon',
      'coordinates': [[]]
    }
  });

  var stopDrawingAndRemove = function() {
    ctx.events.changeMode('default');
    ctx.store.delete(feature.id);
  };

  var pos = 0;

  var onMouseMove = function(e) {
    feature.updateCoordinate(`0.${pos}`, e.lngLat.lng, e.lngLat.lat);
  };

  var onClick = function() {
    // did we click on the last point
    // did we click on the first point
    pos++;
  };

  var onFinish = function() {
    feature.removeCoordinate(`0.${pos}`);
    pos--;
    if(pos < 2) {
      stopDrawingAndRemove();
    }
    else {
      ctx.events.changeMode('default');
    }
  };

  return {
    start: function() {
      ctx.ui.setButtonActive(types.POLYGON);
      ctx.ui.setClass('mapbox-gl-draw_mouse-add');
      this.on('mousemove', () => true, onMouseMove);
      this.on('click', () => true, onClick);
      this.on('keyup', isEscapeKey, stopDrawingAndRemove);
      this.on('keyup', isEnterKey, onFinish);
      this.on('trash', () => true, stopDrawingAndRemove);
    },
    stop: function() {
      ctx.ui.setButtonInactive(types.POLYGON);
      ctx.ui.clearClass();
      if (!feature.isValid()) {
        ctx.store.delete(feature.id);
      }
    },
    render: function(geojson) {
      geojson.properties.active = geojson.properties.id === feature.id ? 'true' : 'false';

      if (geojson.properties.active === 'true' && geojson.geometry.coordinates[0][0] === undefined) {
        return undefined;
      }

      if (geojson.properties.active === 'true' && pos === 0) {
        let coords = [geojson.geometry.coordinates[0][0][0], geojson.geometry.coordinates[0][0][1]];
        return {
          'type': 'Feature',
          'properties': geojson.properties,
          'geometry': {
            'coordinates': coords,
            'type': 'Point'
          }
        };
      }

      if (geojson.properties.active === 'true' && pos === 1) {
        let coords = [[geojson.geometry.coordinates[0][0][0], geojson.geometry.coordinates[0][0][1]], [geojson.geometry.coordinates[0][1][0], geojson.geometry.coordinates[0][1][1]]];
        return {
          'type': 'Feature',
          'properties': geojson.properties,
          'geometry': {
            'coordinates': coords,
            'type': 'LineString'
          }
        };
      }

      return geojson;
    }
  };
};
