# API Reference

In order to use GL Draw you must instantiate the draw class like so:

```js
var Draw = mapboxgl.Draw({ options });
map.addControl(Draw);
```

Draw only works after the map has loaded so it is wise to perform any interactions in the `load` event callback of mapbox-gl:

```js
map.on('load', function() {
    Draw.add({ ... });
    console.log(Draw.getAll());
    ...
});
```

## Options

option | values | function
--- | --- | ---
drawing | boolean | The ability to draw and delete features - default: `true`
interactive | boolean | Keep all features permanently in selected mode - default: `false`
keybindings | boolean | Keyboard shortcuts for drawing - default: `true`
displayControlsDefault | boolean | Sets default value for the control keys in the control option - default `true`
controls | Object | Lets you hide or show individual controls. See `displayControlsDefault` for default. Available options are: point, line, polygon and trash.
style | Object | An array of style objects (as described below) - default: see default style.

### Styling Draw

Draw is styled by the [Mapbox GL Style Spec](https://www.mapbox.com/mapbox-gl-style-spec/) with a preset list of properties.

The `GL Style Spec` requires each layer to have a source. **DO NOT PROVIDE THIS** for styling draw.

Draw moves features between sources for performence gains, because of this it is recommeneded that you **DO NOT** provide a source for a stlye despite the fact the `GL Style Spec` requires a source. **Draw will provide the source for you automaticlly**.

If you need to stlye gl-draw for debugging sources the source names are `mapbox-gl-draw_hot` and `mapbox-gl-draw_cold`.

property | values | function
--- | --- | ---
meta | feature, midpoint, vertex, too-small, too-big | `midpoint` and `vertex` are used on points added to the map to communicate polygon and line handles. `feature` is used for all features added by the user. `too-small` is used to indicate a point that represents the center of a collection of features that are too small at the current zoom level to be seen. `too-big` is used to exclude features from rendering. You can style these features like `meta=feature` to force them to show.
active | true, false | A feature is active when it is 'selected' in the current mode. `true` and `false` are strings.
mode |  default, direct_select, draw_point, draw_line, draw_polygon | Indicates which mode Draw is currently in.
count | number | This is only present when `meta` is `too-small`. It represents the number of features this one feature represents.
hover | true, false | `true` and `false` are strings. `hover` is true when the mouse is over the feature.

Draw also provides a few more properties, but they should not be used for styling. For details on them, see `Using Draw with map.queryRenderFeatures`.

#### Example Custom Style

With this style all Point features are blue and have a black halo when active. No other features are rendered, even if they are present.

```js
mapbox.Draw({
  style: [
    {
      'id': 'highlight-active-points',
      'type': 'circle',
      'filter': ['all',
        ['==', '$type', 'Point'],
        ['==', 'meta', 'feature'],
        ['==', 'active', 'true']],
      'paint': {
        'circle-radius': 7,
        'circle-color': '#000000'
      },
      'interactive': true
    },
    {
      'id': 'points-are-blue',
      'type': 'circle',
      'filter': ['all',
        ['==', '$type', 'Point'],
        ['==', 'meta', 'feature'],
        ['==', 'active', 'true']],
      'paint': {
        'circle-radius': 5,
        'circle-color': '#000088'
      },
      'interactive': true
    }
  ]
});
```

## API Methods

`mapboxgl.Draw()` returns an instance of the `Draw` class which has the following public API methods for getting and setting data:

###`.add(Object: GeoJSONFeature, [Object]: options) -> String`

This method takes any valid GeoJSON and adds it to Draw. The object will be turned into a GeoJSON feature and will be assigned a unique `drawId` that can be used to identify it. This method return the new feature's `drawId`. If an id is provided with the feature that ID will be used.

The second argument is an optional options object to add information to the geometry when creating the new element. Currently the only used option is `permanent`, which, if set to true, will cause the element to ignore click events, `Draw.select(:id:)` and `Draw.selectAll()`.

Draw does not enforce unique IDs to be passed to `.add`, but it does enforce unique ids inside of it. This means that if you provide an id for a feature that is not unqiue, Draw will override the exhisting feature with your new feature. You can think of this like PUT in http verbs.

If a FeatureCollection is provided to `.add` Draw will break it up into many features as if you looped through the features in the collection and added them one at a time. This is good for bulk adding, though it is no faster than looping yourself.

Example:

```js
var feature = { type: 'Point', coordinates: [0, 0] };
var featureId = Draw.add(feature);
console.log(Draw.get(featureId));
//=> { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }
```

Example with ID:

```js
var feature = { type: 'Point', coordinates: [0, 0], id: 'unique-id' };
var featureId = Draw.add(feature);
console.log(featureId) //=> unique-id
console.log(Draw.get('unique-id'));
//=> { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0], id: 'unique-id' }
```

---
###`.get(String: drawId) -> Object`

This method takes the `drawId` of a feature and returns its GeoJSON object.

Example:

```js
var id = Draw.add({ type: 'Point', coordinates: [0, 0] });
console.log(Draw.get(id));
//=> { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] } }
```

---
###`.getAll() -> Object`

This method returns all features added to Draw in a single GeoJSON FeatureCollection. The each feature's unique id will be found on the `id` attribute of the feature.


Example:

```js
Draw.add({ type: 'Point', coordinates: [0, 0] });
Draw.add({ type: 'Point', coordinates: [1, 1] });
Draw.add({ type: 'Point', coordinates: [2, 2] });
console.log(Draw.getAll());
// => {
//  type: 'FeatureCollection',
//  features: [
//    {
//      type: 'Feature',
//      geometry: {
//        type: 'Point',
//        coordinates: [0, 0]
//      }
//    },
//    {
//      type: 'Feature',
//      geometry: {
//        type: 'Point',
//        coordinates: [1, 1]
//      }
//    },
//        {
//      type: 'Feature',
//      geometry: {
//        type: 'Point',
//        coordinates: [2, 2]
//      }
//    }
//  ]
//}
```
---

###`.getSelected() -> Object`

Get all selected features.

---

###`.select(String: drawId) -> Draw`

This method takes the `drawId` of a feature and selects it. It returns `this` to allow for method chaining.

---

###`.selectAll() -> Draw`

This method selects all features. It returns `this` to allow for method chaining.

---

###`.deselect(String: drawId) -> Draw`

This method takes the `drawId` of a feature and deselects it if selected. It returns `this` to allow for method chaining.

---

####`.deselectAll() -> Draw`

This method deselects all features. It returns `this` to allow for method chaining.

---

###`.destroy(String: drawId) -> Draw`

This method takes the `drawId` of feature and removes it from draw. It returns `this` to allow for method chaining.

Example:

```js
var feature = { type: 'Point', coordinates: [0, 0] };
var id = draw.add(feature)
Draw
  .destroy(id)
  .getAll();
// => { type: 'FeatureCollection', features: [] }
```

---

###`.update(String: drawId, Object: GeoJSONFeature) -> Draw`

This method takes the `drawId` of an existing feature and a GeoJSON object and replaces that feature in draw with the new feature. It returns `this`.

Example:

```js
var id = Draw.add({ type: 'Point', coordinates: [0, 0] });
var newFeature = Draw
  .update(id, { type: 'Point', coordinates: [1, 1] })
  .get(id);
console.log(newFeature);
//=> { type: 'Feature', geometry: { type: 'Point', coordinates: [1, 1] } }
```

---

###`.clear() -> Draw`

This method removes all geometries in Draw.

Example:

```js
Draw.add({ type: 'Point', coordinates: [0, 0] });
Draw
  .clear()
  .getAll();
// => { type: 'FeatureCollection', features: [] }
```

---

###`.startDrawing(Enum: { Draw.types.POINT | Draw.types.LINE | Draw.types.POLYGON })`

This method initiates drawing the specified type. The types are defined in constants in draw under `Draw.types.*`. The argument should be one of

- `Draw.types.POINT`
- `Draw.types.LINE`
- `Draw.types.POLYGON`

Example:

```js
Draw.startDrawing(Draw.types.LINE);
```

## Events

Draw fires off a number of events on draw and select actions. All of these events are name spaced `draw` inside of the mapboxgl event emitter.

### draw.set

This is fired every time a feature is committed via escape or the double click. The payload is an object with the `mapbox-gl-draw` feature id and the GeoJSON representation of the feature.

### draw.delete

This is fired every time a feature is deleted inside of `mapbox-gl-draw`. The payload is an object with the `mapbox-gl-draw` feature id of the feature that was deleted and the GeoJSON representation of the feature just before it was deleted.

### draw.select.start

Fired every time a feature is selected. The payload is an object with the `mapbox-gl-draw` feature id and the GeoJSON representation of the feature.

### draw.select.end

Fired every time a feature is deselected. The payload is an object with the `mapbox-gl-draw` feature id.

## Using Draw with `map.queryRenderFeatures`

property | values | function
--- | --- | ---
id | string | only available when `meta` is `feature`
parent | string | only avaible when `meta` is not `feature`
coord_path | string | a `.` seporated path to one [lon, lat] entity in the parents coordinates
lon | number | the longitude value of a handle. Only available when `meta` is ` midpoint`.
bbox | array | the bounding box of the hidden features. Only available when `meta` is `too-small`.
