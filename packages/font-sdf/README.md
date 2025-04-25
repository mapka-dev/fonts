# @mapka/font-sdf

Generates [Signed Distance Field](https://en.wikipedia.org/wiki/Signed_distance_function) glyphsets from
OpenType fonts.

This is fork of [fontnik](https://github.com/mapbox/fontnik) with some changes.

## Install

```sh
npm install @mapka/glyph-pbf
or
yarn add @mapka/glyph-pbf
```

## Usage

```ts
import { 
  fontToGlyphs,
  readFont
} from "@mapka/glyph-pbf";

const font = readFont("fonts/OpenSans-Regular.ttf");
const buffer = fontToGlyphs(font, 0, 255);
```
