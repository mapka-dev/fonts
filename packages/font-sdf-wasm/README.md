# @mapka/font-sdf-wasm

Current impl is based on `mapbox/fontnik` but mapbox use `mapbox/node-fontnik`, maptiler is using `maplibre/font-maker` and stadia is using `stadiamaps/sdf_font_tools`

Should we invest time into re-writing font-sdf ? or we should migrate approach similar to to `maplibre/font-maker` or write our own implementation ?

What can be made better?

- Better performance vs js implementation?
- Better memory usage vs js implementation?
- Fixing existing bugs?
  - [self-intersecting contours](https://github.com/mapbox/sdf-glyph-foundry/issues/3)
  - [Bitmaps Getting Cut Off](https://github.com/mapbox/node-fontnik/issues/90)
