var events = require('./events');
var Store = require('./store');
var ui = require('./ui');

var theme = require('./lib/theme');

module.exports = function(ctx) {

  ctx.events = events(ctx);

  ctx.map = null;
  ctx.container = null;
  ctx.store = null;
  ui(ctx);

  var setup = {
    addTo: function(map) {
        ctx.map = map;
        setup.onAdd(map);
        return this;
    },
    remove: function() {
      setup.onRemove();
      ctx.map = null;
      ctx.container = null;
      ctx.store = null;
      return this;
    },
    onAdd: function(map) {
      ctx.container = map.getContainer();
      ctx.store = new Store(ctx);

      if (ctx.options.drawing) {
        ctx.ui.addButtons();
      }

      if (map.style.loaded()) { // not public
        ctx.events.addEventListeners();
        setup.addLayers();
      } else {
        map.on('load', () => {
          ctx.events.addEventListeners();
          setup.addLayers();
        });
      }
    },
    onRemove: function() {
      setup.removeLayers();
      ctx.ui.removeButtons();
      ctx.events.removeEventListeners();
    },
    addLayers: function() {
      ctx.map.batch((batch) => {
        // drawn features style
        batch.addSource('draw-cold', {
          data: {
            type: 'FeatureCollection',
            features: []
          },
          type: 'geojson'
        });

        // hot features style
        batch.addSource('draw-hot', {
          data: {
            type: 'FeatureCollection',
            features: []
          },
          type: 'geojson'
        });

        for (let i = 0; i < theme.length; i++) {
          let style = theme[i];
          style.source = 'draw-hot';
          // TODO: this should be on both sources...
          // TODO: let users overwrite this...
          batch.addLayer(style);
        }
        ctx.store.render();
      });
    },
    removeLayers: function() {
      ctx.map.batch(function (batch) {
        for (let i = 0; i < theme.length; i++) {
          let { id } = theme[i];
          batch.removeLayer(id);
        }

        batch.removeSource('draw-cold');
        batch.removeSource('draw-hot');
      });
    }
  };

  return setup;
};
