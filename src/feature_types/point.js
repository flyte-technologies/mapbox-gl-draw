var Feature =  require('./feature');

var Point = function(ctx, geojson) {
  Feature.call(this, ctx, geojson);
};

Point.prototype = Object.create(Feature.prototype);

module.exports = Point;
