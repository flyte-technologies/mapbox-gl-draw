var {noFeature, isShiftDown, isFeature, isFeatureButNotPoint} = require('../lib/common_selectors');

module.exports = function(ctx) {

  var selectedFeaturesById = {};

  var startPos = null;
  var dragging = false;
  var featureCoords = null;
  var features = null;
  var numFeatures = null;

  var buildFeatureCoords = function() {
    var featureIds = Object.keys(selectedFeaturesById);
    featureCoords = featureIds.map(id => selectedFeaturesById[id].getCoordinates());
    features = featureIds.map(id => selectedFeaturesById[id]);
    numFeatures = featureIds.length;
  };

  return {
    start: function() {
      this.on('click', noFeature, function() {
        selectedFeaturesById = {};
      });

      this.on('mousedown', isFeature, function(e) {
        dragging = true;
        startPos = e.lngLat;
        var id = e.featureTarget.properties.id;

        var isSelected = selectedFeaturesById[id] !== undefined;

        if (isSelected && isShiftDown(e)) {
          // unselect
          delete selectedFeaturesById[id];
        }
        else if (isSelected && isShiftDown(e)) {
          // add to selected
          selectedFeaturesById[id] = ctx.store.get(id);
        }
        else {
          //make selected
          selectedFeaturesById = {};
          selectedFeaturesById[id] = ctx.store.get(id);
        }
      });

      this.on('mouseup', () => true, function() {
        dragging = false;
        featureCoords = null;
        features = null;
        numFeatures = null;
      });

      this.on('drag', () => dragging, function(e) {
        e.originalEvent.stopPropagation();
        if (featureCoords === null) {
          buildFeatureCoords();
        }

        var lngD = e.lngLat.lng - startPos.lng;
        var latD = e.lngLat.lat - startPos.lat;

        var coordMap = (coord) => [coord[0] + lngD, coord[1] + latD];
        var ringMap = (ring) => ring.map(coord => [coord[0] + lngD, coord[1] + latD]);

        for (var i = 0; i < numFeatures; i++) {
          var feature = features[i];
          if (feature.type === 'Point') {
            feature.coordinates[0] = featureCoords[i][0] + lngD;
            feature.coordinates[1] = featureCoords[i][1] + latD;
          }
          else if (feature.type === 'LineString') {
            feature.coordinates = featureCoords[i].map(coordMap);
          }
          else if (feature.type === 'Polygon') {
            feature.coordinates = featureCoords[i].map(ringMap);
          }
        }
      });

      this.on('doubleclick', isFeatureButNotPoint, function(e) {
        e.originalEvent.stopPropagation();
        ctx.api.changeMode('direct_select', e.featureTarget.properties.id);
      });

      this.on('trash', () => true, function() {
        dragging = false;
        featureCoords = null;
        features = null;
        numFeatures = null;
        Object.keys(selectedFeaturesById).forEach(id => ctx.store.delete(id));
        selectedFeaturesById = {};
        console.log('woot');
      });
    },
    render: function(geojson) {
      geojson.properties.active = selectedFeaturesById[geojson.properties.id] ? 'true' : 'false';
      return geojson;
    }
  };
};
