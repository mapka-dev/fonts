# @mapka/font-sdf

Generates [Signed Distance Field](https://en.wikipedia.org/wiki/Signed_distance_function) glyphsets from OpenType fonts. Generated glyphs are stored in [protobuf](https://developers.google.com/protocol-buffers).

This is fork of [fontnik](https://github.com/mapbox/fontnik) with some changes.

## Install

```sh
npm install @mapka/font-sdf
or
yarn add @mapka/font-sdf
```

## Usage

```ts
import { 
  fontName,
  fontToGlyphs,
  readFont,
  decode
} from "@mapka/font-sdf";

// Read a font saved as a PBF and decode it.
const sdf = readFileSync("fonts/OpenSans-Regular.pbf");
const pbf = decode(sdf);

// Read a font and generate glyphs for the range 0-255.
const font = await readFont("fonts/OpenSans-Regular.ttf");
const buffer = fontToGlyphs(font, 0, 255);

// Family and style used in the font stack name, e.g. { family: "Open Sans", style: "Regular" }.
// Use this rather than font.tables.name: opentype.js 2 keys that table by platform.
const { family, style } = fontName(font);
```
