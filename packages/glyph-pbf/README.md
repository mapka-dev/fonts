# @mapka/glyph-pbf

=======

Generates [Signed Distance Field](https://en.wikipedia.org/wiki/Signed_distance_function) glyphsets from
OpenType fonts.

This is fork of [fontnik](https://github.com/mapbox/fontnik) with some changes.

```ts
import { 
  fontToGlyphs,
  readFont
} from "@mapka/glyph-pbf";

const font = readFont("fonts/OpenSans-Regular.ttf");
const pbfBuffer = fontToGlyphs(font, 0, 255);

```
