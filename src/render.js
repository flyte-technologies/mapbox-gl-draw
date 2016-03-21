module.exports = function() {
  var isStillAlive = this.ctx.map.getSource('draw-hot') !== undefined;
  if (isStillAlive) { // checks to make sure we still have a map
    var mode = this.ctx.events.currentModeName();
    var features = [];
    Object.keys(this.features).forEach((id) => {
      let featureInternal = this.features[id].internal(mode);
      let modeFeatures = this.ctx.events.currentModeRender(featureInternal);

      if (modeFeatures !== undefined && !Array.isArray(modeFeatures)) {
        features.push(modeFeatures);
      }
      else if (modeFeatures !== undefined){
        features = features.concat(modeFeatures);
      }
    });

    this.ctx.map.getSource('draw-cold').setData({
      type: 'FeatureCollection',
      features: []
    });

    this.ctx.map.getSource('draw-hot').setData({
      type: 'FeatureCollection',
      features: features
    });
  }
};
