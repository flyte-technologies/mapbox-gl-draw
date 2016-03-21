module.exports = function() {
  var isStillAlive = this.ctx.map.getSource('draw') !== undefined;
  if (isStillAlive) { // checks to make sure we still have a map
    var mode = this.ctx.events.currentModeName();
    var featureBuckets = Object.keys(this.features).reduce((buckets, id) => {
      let featureInternal = this.features[id].internal();
      featureInternal.properties.mode = mode;
      let modeFeatures = this.ctx.events.currentModeRender(featureInternal);

      if (!Array.isArray(modeFeatures)) {
        modeFeatures = [modeFeatures];
      }

      buckets.hot = buckets.hot.concat(modeFeatures);
      return buckets;

    }, { cold: [], hot: [] });

    this.ctx.map.getSource('draw-cold').setData({
      type: 'FeatureCollection',
      features: featureBuckets.cold
    });

    this.ctx.map.getSource('draw-hot').setData({
      type: 'FeatureCollection',
      features: featureBuckets.hot
    });
  }
};
