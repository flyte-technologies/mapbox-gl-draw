var hat = require('hat');

var featureTypes = {
  "Polygon": require('./feature_types/polygon'),
  "LineString": require('./feature_types/line_string'),
  "Point": require('./feature_types/point')
}

var API = module.exports = function(ctx) {

  return {
    add: function (geojson, opts) {
      var geojson = JSON.parse(JSON.stringify(geojson));
      if (geojson.type === 'FeatureCollection') {
        return geojson.features.map(feature => this.add(feature, options));
      }

      if (!geojson.geometry) {
        geojson = {
          type: 'Feature',
          id: geojson.id,
          properties: geojson.properties || {},
          geometry: geojson
        };
      }

      geojson.id = geojson.id || hat();
      var model = featureTypes[geojson.geometry.type];

      if(model === undefined) {
        throw new Error('Invalid feature type. Must be Point, Polygon or LineString');
      }

      var feature = new model(ctx, geojson);
      return ctx.store.add(feature);
    },
    get: function (id) {
      var feature = ctx.store.get(id);
      if (feature) {
        return feature.toGeoJSON();
      }
    },
    getAll: function() {
      return {
        type: 'FeatureCollection',
        features: ctx.store.getAll().map(feature => feature.toGeoJSON())
      }
    },
    delete: function(id) {
      ctx.store.delete(id);
    },
    deleteAll: function() {
      ctx.store.getAll().forEach(feature => ctx.store.delete(feature.id));
    },
    deleteSelected: function() {
      ctx.store.getAll().forEach(feature => {
        if (feature.isSelected() ) {
          ctx.store.delete(feature.id);
        }
        else if (feature.deleteSelectedCoords) {
          feature.deleteSelectedCoords();
        }
      });
    },
    changeMode: function(mode, opts) {
      ctx.events.changeMode(mode, opts);
    },
    trash: function() {
      ctx.events.fire('trash');
    }
  }
}
