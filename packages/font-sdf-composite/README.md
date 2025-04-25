# @mapka/font-sdf-composite

This is an re-write of [glyph-pbf-composite](https://github.com/mapbox/glyph-pbf-composite).

## Install

```sh
npm install @mapka/font-sdf-composite
  or
yarn add @mapka/font-sdf-composite
```

## Usage

```js
import { combine} from "@mapka/glyph-sdf-composite";

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
