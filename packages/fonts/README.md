# Open Font Glyphs for GL Styles

This project packages the most common free fonts with `@mapka/font-sdf` for usage in Maplibre and Mapbox GL JS.

- [MapLibre Glyphs](https://maplibre.org/maplibre-style-spec/glyphs/)
- [Mapbox GL Style JSON](https://docs.mapbox.com/api/maps/fonts/#retrieve-font-glyph-ranges)

## Supported Font Families

The following fonts that are available in Mapbox Studio are supported.

- Noto Sans (patched by Klokan Technologies)
- Open Sans
- PT Sans
- Roboto
- Metropolis

## Package the Fonts

Install required packages:

```sh
yarn install
or 
npm install
```

Generate fonts:

```sh
yarn generate
or
npm run generate
```

The PBFs will created be in the `dist` directory.

## Font License

Please mind the license of the original fonts.
All fonts are either licensed under OFL, UFL or Apache.
