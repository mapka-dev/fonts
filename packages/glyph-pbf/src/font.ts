import Pbf from "pbf";
import { load } from "opentype.js";
import type { Font } from "opentype.js";
import { decode, encode, type Glyph, type FontStack } from "./pbf.js";
import { writefontstack } from "./glyphs.js";
import { glyphToSDF } from "./sdf.js";

export async function readFont(filename: string): Promise<Font> {
  return new Promise<Font>((resolve, reject) => {
    load(filename, (err, font) => {
      if (err || !font) {
        reject(err);
      } else {
        resolve(font);
      }
    });
  });
}

const fontSize = 24;
const buffer = 3;
const cutoff = 2 / 8;

/**
 * Convert opentype font to glyphs sdf.
 */
export function fontToGlyphs(font: Font, from = 0, to = 65535): Buffer {
  const pbf = new Pbf();

  const family = font.tables.name.preferredFamily || font.tables.name.fontFamily;
  const style = font.tables.name.preferredSubfamily || font.tables.name.fontSubfamily;

  const basename = `${family} ${style}`;

  const max = Math.min(font.glyphs.length, to);

  const fontStack: FontStack = {
    name: basename,
    range: `${from} - ${max}`,
    glyphs: [],
  };

  for (let i = 0; i < max; i++) {
    const glyph = font.glyphs.get(i);
    const sdf = glyphToSDF(font, glyph, fontSize, buffer, cutoff);

    /**
     * Base sdf glyph 
     */
    const sdfGlyph: Glyph = {
      id: i,
      width: sdf.glyphWidth,
      height: sdf.glyphHeight,
      left: sdf.glyphBearingX,
      top: sdf.glyphTop,
      advance: sdf.glyphAdvance,
    };

    /**
     * If the glyph has no bitmap data, don't include it.
     * For example, the space character has no bitmap data.
     */
    if (sdf.data) {
      sdfGlyph.bitmap = Buffer.from(sdf.data);
    }
    fontStack.glyphs.push(sdfGlyph);
  }
  writefontstack(fontStack, pbf);
  const view = pbf.finish();

  return Buffer.from(view);
}

/**
 * Filter glyphs by range.
 */
export function glyphsRange(fontStack: Buffer, from = 0, to = 65535): Buffer {
  const result = decode(fontStack);

  const {
    stacks: [first],
  } = result;

  first.glyphs = first.glyphs.filter((glyph) => glyph.id >= from && glyph.id <= to);

  return encode(result);
}
