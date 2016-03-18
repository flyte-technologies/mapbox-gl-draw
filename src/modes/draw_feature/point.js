var {isEnterKey, isEscapeKey} = require('../common_selectors');
var Point = require('../../feature_types/point');

module.exports = function(ctx) {

  var geojson = {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "Point",
      "coordinates": [0,0]
    }
  }

  var feature = new Point(ctx, geojson);

  var stopDrawingAndRemove = function() {
    ctx.events.changeMode('default');
    ctx.store.delete(feature.id);
  }

  var onMouseMove = function(e) {
    feature.updateCoordinate('', e.lngLat.lng, e.lngLat.lat);
  }

  var onClick = function(e) {
    ctx.events.changeMode('default');
  }

  return {
    start: function() {
      ctx.ui.setClass('mapbox-gl-draw_mouse-add');
      this.on('mousemove', () => true, onMouseMove);
      this.on('click', () => true, onClick);
      this.on('keyup', isEscapeKey, stopDrawingAndRemove);
      this.on('keyup', isEnterKey, stopDrawingAndRemove);
    },
    stop: function() {
      ctx.ui.clearClass();
    },
    render: function(geojson) {
      geojson.properties.active = geojson.properties.id === feature.id ? 'true' : 'false';
      return geojson;
    }
  }
}
