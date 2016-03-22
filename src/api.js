var hat = require('hat');

var featureTypes = {
  'Polygon': require('./feature_types/polygon'),
  'LineString': require('./feature_types/line_string'),
  'Point': require('./feature_types/point')
};

module.exports = function(ctx) {

  return {
    add: function (geojson) {
      geojson = JSON.parse(JSON.stringify(geojson));
      if (geojson.type === 'FeatureCollection') {
        return geojson.features.map(feature => this.add(feature));
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

      var internalFeature = new model(ctx, geojson);
      var id = ctx.store.add(internalFeature);
      ctx.store.render();
      return id;
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
      };
    },
    delete: function(id) {
      ctx.store.delete(id);
      ctx.store.render();
    },
    deleteAll: function() {
      ctx.store.getAll().forEach(feature => ctx.store.delete(feature.id));
      ctx.store.render();
    },
    changeMode: function(mode, opts) {
      ctx.events.changeMode(mode, opts);
    },
    trash: function() {
      ctx.events.fire('trash');
    }
  };
};
