module.exports = [
  {
    'id': 'gl-draw-selected-line',
    'type': 'line',
    'filter': ['all',
      ['==', '$type', 'LineString'],
      ['==', 'selected', 'true']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#000000',
      'line-dasharray': [0, 2],
      'line-width': 3
    },
    'interactive': true
  },
  {
    'id': 'gl-draw-selected-polygon',
    'type': 'fill',
    'filter': ['all', ['==', 'selected', 'true'], ['==', '$type', 'Polygon']],
    'paint': {
      'fill-color': '#000000',
      'fill-opacity': 0.25
    },
    'interactive': true
  },
  {
    'id': 'gl-draw-selected-polygon-stroke',
    'type': 'line',
    'filter': ['all', ['==', 'selected', 'true'], ['==', '$type', 'Polygon']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#000000',
      'line-dasharray': [2, 2],
      'line-width': 3
    },
    'interactive': true
  },
  {
    'id': 'gl-draw-selected-point-highlight',
    'type': 'circle',
    'filter': ['all',
      ['==', '$type', 'Point'],
      ['!=', 'meta', 'midpoint'],
      ['==', 'selected', 'true']],
    'paint': {
      'circle-radius': 7,
      'circle-color': '#ff0000'
    },
    'interactive': true
  },
  {
    'id': 'gl-draw-selected-point',
    'type': 'circle',
    'filter': ['all',
      ['==', '$type', 'Point'],
      ['==', 'selected', 'true'],
      ['!=', 'meta', 'midpoint']
    ],
    'paint': {
      'circle-radius': 5,
      'circle-color': '#000000'
    },
    'interactive': true
  },
  {
    'id': 'gl-draw-point-mid',
    'type': 'circle',
    'filter': ['all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'midpoint']],
    'paint': {
      'circle-radius': 4,
      'circle-color': '#000000'
    },
    'interactive': true
  },
  {
    'id': 'gl-draw-polygon',
    'type': 'fill',
    'filter': ['all', ['==', 'selected', 'false'], ['==', '$type', 'Polygon']],
    'paint': {
      'fill-color': '#ff00ff',
      'fill-outline-color': '#ff00ff',
      'fill-opacity': 0.25
    },
    'interactive': true
  },
  {
    'id': 'gl-draw-polygon-stroke',
    'type': 'line',
    'filter': ['all', ['==', 'selected', 'false'], ['==', '$type', 'Polygon']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#ff00ff',
      'line-width': 2
    },
    'interactive': true
  },
  {
    'id': 'gl-draw-line',
    'type': 'line',
    'filter': ['all', ['==', 'selected', 'false'], ['==', '$type', 'LineString']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#ff00ff',
      'line-width': 2
    },
    'interactive': true
  },
  {
    'id': 'gl-draw-point',
    'type': 'circle',
    'filter': ['all', ['==', 'selected', 'false'], ['==', '$type', 'Point']],
    'paint': {
      'circle-radius': 5,
      'circle-color': '#ff00ff'
    },
    'interactive': true
  }
];
