var ModeHandler = require('./lib/mode_handler');
var findTargetAt = require('./lib/find_target_at');

var modes = {
  'default': require('./modes/default'),
  'direct_select': require('./modes/direct_select'),
  'draw_point': require('./modes/draw_point'),
  'draw_line_string': require('./modes/draw_line_string'),
  'draw_polygon': require('./modes/draw_polygon')
};

module.exports = function(ctx) {

  var isDown = false;

  var events = {};
  var currentModeName = 'default';
  var currentMode = ModeHandler(modes.default(ctx), ctx);

  events.drag = function(event) {
    currentMode.drag(event);
  };

  events.click = function(event) {
    var target = findTargetAt(event, ctx);
    event.featureTarget = target;
    currentMode.click(event);
  };

  events.doubleclick = function(event) {
    var target = findTargetAt(event, ctx);
    event.featureTarget = target;
    currentMode.doubleclick(event);
  };

  events.mousemove = function(event) {
    if (isDown) {
      events.drag(event);
    }
    else {
      var target = findTargetAt(event, ctx);
      event.featureTarget = target;
      currentMode.mousemove(event);
    }
  };

  events.mousedown = function(event) {
    isDown = true;
    var target = findTargetAt(event, ctx);
    event.featureTarget = target;
    currentMode.mousedown(event);
  };

  events.mouseup = function(event) {
    isDown = false;
    var target = findTargetAt(event, ctx);
    event.featureTarget = target;
    currentMode.mouseup(event);
  };

  events.trash = function() {
    currentMode.trash();
  };


  var isKeyModeValid = (code) => !(code === 8 || (code >= 48 && code <= 57));

  events.keydown = function(event) {
    console.log(event.keyCode);
    if (event.keyCode === 8) {
      event.preventDefault();
      api.fire('trash');
    }
    else if (isKeyModeValid(event.keyCode)) {
      currentMode.keydown(event);
    }
    else if (event.keyCode === 49) {
      ctx.api.changeMode('draw_point');
    }
    else if (event.keyCode === 50) {
      ctx.api.changeMode('draw_line_string');
    }
    else if (event.keyCode === 51) {
      ctx.api.changeMode('draw_polygon');
    }
  };

  events.keyup = function(event) {
    if (isKeyModeValid(event.keyCode)) {
      currentMode.keyup(event);
    }
  }

  var api = {
    currentModeName: function() {
      return currentModeName;
    },
    currentModeRender: function(geojson) {
      return currentMode.render(geojson);
    },
    changeMode: function(modename, opts) {
      currentMode.stop();
      var modebuilder = modes[modename];
      if (modebuilder === undefined) {
        throw new Error(`${modename} is not valid`);
      }
      currentModeName = modename;
      var mode = modebuilder(ctx, opts);
      currentMode = ModeHandler(mode, ctx);
      ctx.store.render();
    },
    fire: function(name, event) {
      if (events[name]) {
        events[name](event);
      }
    },
    addEventListeners: function() {
      ctx.map.on('click', events.click);
      ctx.map.on('dblclick', events.doubleclick);
      ctx.map.on('mousemove', events.mousemove);

      ctx.map.on('mousedown', events.mousedown);
      ctx.map.on('mouseup', events.mouseup);

      ctx.container.addEventListener('keydown', events.keydown);
      ctx.container.addEventListener('keyup', events.keyup);
    },
    removeEventListeners: function() {
      ctx.map.off('click', events.click);
      ctx.map.off('dblclick', events.doubleclick);
      ctx.map.off('mousemove', events.mousemove);
      ctx.container.removeEventListener('mousedown', events.mousedown);
      ctx.container.removeEventListener('mouseup', events.mouseup);
      ctx.container.removeEventListener('keydown', events.keydown);
      ctx.container.removeEventListener('keyup', events.keyup);
    }
  };

  return api;
};
