# @mapka/font-sdf-inspect

Inspect a font-sdf font glyphs.
This is an re-write of [glyph-inspector](https://github.com/mapbox/glyph-inspect).

## Install

```sh
npm install @mapka/font-sdf-inspect
  or
yarn add @mapka/font-sdf-inspect
```

## Usage

With npx:

```sh
# Print glyphs as a table to the console
npx @mapka/font-sdf-inspect ./0-255.pbf

# Generate an HTML report 0-255.html
npx @mapka/font-sdf-inspect ./0-255.pbf --html

```

When installed as a package:

```sh
yarn inspect ./0-255.pbf --raw

yarn inspect  ./0-255.pbf --html
```
