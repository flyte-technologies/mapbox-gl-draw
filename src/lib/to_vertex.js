
module.exports = function(parent, coord, path, selected) {
  return {
      type: 'Feature',
      properties: {
        meta: 'vertex',
        parent: parent,
        path: path,
        active: ''+selected
      },
      geometry: {
        type: 'Point',
        coordinates: coord
      }
    }
}
