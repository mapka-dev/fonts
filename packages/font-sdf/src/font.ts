import { readFile } from "node:fs/promises";
import type { Font } from "opentype.js";
import opentype from "opentype.js";
import { PbfWriter } from "pbf";
import { writeglyphs } from "./glyphs.js";
import { decode, encode, type FontStack, type Glyph } from "./pbf.js";
import { glyphToSDF } from "./sdf.js";

/**
 * opentype.js 2 dropped load(); parse() takes the font bytes.
 * Default import: its CommonJS entry exposes no named exports to Node ESM.
 */
export async function readFont(filename: string): Promise<Font> {
  return opentype.parse(await readFile(filename));
}

export interface FontName {
  family: string | undefined;
  style: string | undefined;
}

/**
 * Family and style of a font, as used in its font stack name.
 * Read the name here rather than from font.tables.name: opentype.js 2
 * keys that table by platform (windows, macintosh, unicode).
 */
export function fontName(font: Font): FontName {
  return {
    family: font.getEnglishName("preferredFamily") || font.getEnglishName("fontFamily"),
    style: font.getEnglishName("preferredSubfamily") || font.getEnglishName("fontSubfamily"),
  };
}

const fontSize = 24;
const buffer = 3;
const cutoff = 2 / 8;

/**
 * Convert opentype font to glyphs sdf.
 */
export function fontToGlyphs(font: Font, from = 0, to = 65535) {
  const pbf = new PbfWriter();

  const { family, style } = fontName(font);

  const basename = `${family} ${style}`;

  const fontStack: FontStack = {
    name: basename,
    range: `${from}-${to}`,
    glyphs: [],
  };

  for (let i = from; i <= to; i++) {
    const char = String.fromCharCode(i);
    const glyph = font.charToGlyph(char);

    if (glyph.index > 0) {
      const sdf = glyphToSDF(font, glyph, fontSize, buffer, cutoff);

      /**
       * Base sdf glyph
       */
      const sdfGlyph: Glyph = {
        id: i,
        bitmap: null,
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
  }
  writeglyphs({ stacks: [fontStack] }, pbf);
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

  first.range = `${from}-${to}`;
  first.glyphs = first.glyphs.filter((glyph) => glyph.id >= from && glyph.id <= to);

  return encode(result);
}
