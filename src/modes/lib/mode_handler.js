var ModeHandler = function(mode, DrawContext) {

  var handlers = {
    drag: [],
    click: [],
    doubleclick: [],
    mousemove: [],
    mousedown: [],
    mouseup: [],
    keydown: [],
    keyup: [],
    delete: []
  };

  var lastClass = '';

  var ctx = {
    on: function(event, selector, fn) {
      if (handlers[event] === undefined) {
        throw new Error(`Invalid event type: ${event}`);
      }
      handlers[event].push({
        selector: selector,
        fn: fn
      });
    },
    off: function(event, selector, fn) {
      handlers[event] = handlers[event].filter(handler => {
        return handler.selector !== selector || handler.fn !== fn;
      });
    }
  }

  function delegate(eventName, event) {
    var handles = handlers[eventName];
    var iHandle = handles.length;
    while (iHandle--) {
      var handle = handles[iHandle];
      if (handle.selector(event)) {
        handle.fn.call(ctx, event);
        DrawContext.store.render();
        break;
      }
    }
  }

  mode.start.call(ctx);

  return {
    render: mode.render || function(geojson) {return geojson; },
    stop: mode.stop || function() {},
    drag: function(event) {
      delegate('drag', event);
    },
    click: function(event) {
      delegate('click', event);
    },
    doubleclick: function(event) {
      delegate('doubleclick', event);
    },
    mousemove: function(event) {
      delegate('mousemove', event);
    },
    mousedown: function(event) {
      delegate('mousedown', event);
    },
    mouseup: function(event) {
      delegate('mouseup', event);
    },
    keydown: function(event) {
      delegate('keydown', event);
    },
    keyup: function(event) {
      delegate('keyup', event);
    },
    delete: function(event) {
      delegate('delete', event);
    }
  }
}

module.exports  = ModeHandler;
