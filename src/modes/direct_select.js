var {noFeature, isOfMetaType, isShiftDown} = require('./lib/common_selectors');

module.exports = function(ctx, featureId) {

  var isThisFeature = function(e) {
    return e.featureTarget && e.featureTarget.properties.parent == featureId;
  }

  var feature = ctx.store.get(featureId);

  var onVertex = function(e) {
    if (isThisFeature(e)) {
      var about = e.featureTarget.properties;
      if (isShiftDown(e) === false) {
        //ctx.api.unselectAll();
      }

      feature.selectCoordinate(about.path);
      ctx.events.changeMode('one_drag', {
        featureId: featureId,
        startPos: e.lngLat
      });
    }
  }

  var selectVertex = function(e) {
    var about = e.featureTarget.properties;
    if (isShiftDown(e) === false && feature.selectedCoords) {
      feature.selectedCoords = {};
    }

    feature.selectCoordinate(about.path);
  }

  var onMidpoint = function(e) {
    var about = e.featureTarget.properties;
    feature.addCoordinate(about.path, about.lng, about.lat);
    feature.selectCoordinate(about.path);
    ctx.events.changeMode('one_drag', {
      featureId: featureId,
      startPos: e.lngLat
    });
  }

  return {
    start: function() {
      ctx.ui.setClass('mapbox-gl-draw_mouse-direct-select');
      feature.drawProperties.direct_selected = 'true';
      this.on('mousedown', isOfMetaType('vertex'), onVertex);
      this.on('mousedown', isOfMetaType('midpoint'), onMidpoint);
      this.on('click', isOfMetaType('vertex'), selectVertex);
      this.on('doubleclick', () => true, function(e) {
        ctx.events.changeMode('default', [featureId]);
      });
      this.on('click', noFeature, function(e) {
        feature.selectedCoords = {};
        ctx.store.render();
      });
      this.on('trash', function() {
        if (feature.deleteSelectedCoords) {
          feature.deleteSelectedCoords();
          if (ctx.store.get(featureId) === undefined) {
            ctx.events.changeMode('default');
          }
        }
      });
    },
    stop: function() {
      ctx.ui.clearClass();
      feature.drawProperties.direct_selected = 'false';
    }
  }
}
