# @mapka/glyph-pbf-composite

This is fork of [glyph-pbf-composite](https://github.com/mapbox/glyph-pbf-composite) with some changes.

```sh
npm install @mapka/glyph-pbf-composite
  or
yarn add @mapka/glyph-pbf-composite
```

## Usage

```js
import { 
  combine
} from "@mapka/glyph-pbf-composite";

// Without a font stack name
const pbfBuffer1 = combine([
  fs.readFileSync("fonts/OpenSans-Regular.pbf"),
  fs.readFileSync("fonts/ArialUnicodeMS-Regular.pbf"),
]);

// With a font stack name
const pbfBuffer2 = combine([
  fs.readFileSync("fonts/OpenSans-Regular.pbf"),
  fs.readFileSync("fonts/ArialUnicodeMS-Regular.pbf"),
], "Open Sans Regular,Arial Unicode MS Regular");

```
