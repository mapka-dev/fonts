import { decode } from "@mapka/font-sdf";
import { existsSync, readFileSync } from "node:fs";

export function inspectRaw(path: string) {
  if(!existsSync(path)) {
    throw new Error(`File not found: ${path}`);
  }

  const pbf = readFileSync(path);
  const {
    stacks: [first],
  } = decode(pbf);
  console.info(`Font: ${first.name}`);
  console.info(`Range: ${first.range}`);
  console.table(first.glyphs.map((glyph) => ({
    ...glyph,
    bitmap: glyph.bitmap ? `<Buffer ${glyph.bitmap.length}>` : null,
  })));
}

export function inspectHtml(path: string) {
  if(!existsSync(path)) {
    throw new Error(`File not found: ${path}`);
  }

  const pbf = readFileSync(path);
  const glyphs = decode(pbf);

  console.log(glyphs)
}