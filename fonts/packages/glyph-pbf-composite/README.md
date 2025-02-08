# @mapka/glyph-pbf-composite

This is fork og [glyph-pbf-composite](https://github.com/mapbox/glyph-pbf-composite) with some changes.

```sh
npm install @mapka/glyph-pbf-composite
  or
yarn add @mapka/glyph-pbf-composite
```

## Usage

```js
import { 
  combine, 
  debug, 
  decode, 
  encode 
  } from "@mapka/glyph-pbf-composite";

// Without a font stack name
const pbf = combine([
  fs.readFileSync("fonts/OpenSans-Regular.pbf"),
  fs.readFileSync("fonts/ArialUnicodeMS-Regular.pbf"),
]);

// With a font stack name
const pbf2 = combine([
  fs.readFileSync("fonts/OpenSans-Regular.pbf"),
  fs.readFileSync("fonts/ArialUnicodeMS-Regular.pbf"),
], "Open Sans Regular,Arial Unicode MS Regular");


// Debug a PBF without decoding
console.log(debug(pbf));

// Debug a PBF with decoded glyphs.
console.log(debug(pbf, true));

// Decode a PBF font stack.
decode(fs.readFileSync("fonts/OpenSans-Regular.pbf"));

// Encode a PBF font stack.
encode(decode(fs.readFileSync("fonts/OpenSans-Regular.pbf")));

```
