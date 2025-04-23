import { decode, encode, type Glyphs, type Glyph } from "@mapka/glyph-pbf";

function compareId(a: Glyph, b: Glyph) {
	return a.id - b.id;
}


/**
 * When combining fonts use first font as result font
 * and combine all other fonts into it.
 * Use font stack name as result font name.
 */
function combineNamed([first, ...rest]: Buffer[], fontStack: string) {
  const coverage: Record<number, boolean> = {};
  const result: Glyphs = decode(first);
  const {
    stacks: [resultStack],
  } = result;

  resultStack.name = fontStack;
  for (const glyph of resultStack.glyphs) {
    coverage[glyph.id] = true;
  }

  for (const buf of rest) {
    const decoded: Glyphs = decode(buf);
    const {
      stacks: [decodedStack],
    } = decoded;

    for (const glyph of decodedStack.glyphs) {
      if (!coverage[glyph.id]) {
        resultStack.glyphs.push(glyph);
        coverage[glyph.id] = true;
      }
    }
  }
	resultStack.glyphs.sort(compareId);
  return encode(result);
}

/**
 * When combining fonts use first font as result font
 * and combine all other fonts into it.
 * Create font stack name from font names.
 */
function combineAuto([first, ...rest]: Buffer[]) {
  const coverage: Record<number, boolean> = {};
  const result: Glyphs = decode(first);
  const {
    stacks: [resultStack],
  } = result;

  for (const glyph of resultStack.glyphs) {
    coverage[glyph.id] = true;
  }

  for (const buf of rest) {
    const decoded: Glyphs = decode(buf);
    const {
      stacks: [decodedStack],
    } = decoded;

    for (const glyph of decodedStack.glyphs) {
      if (!coverage[glyph.id]) {
        resultStack.glyphs.push(glyph);
        coverage[glyph.id] = true;
      }
    }
    resultStack.name = `${resultStack.name}, ${decodedStack.name}`;
  }
	resultStack.glyphs.sort(compareId);
  return encode(result);
}

/**
 * Combine any number of glyph (SDF) PBFs.
 * Returns a re-encoded PBF with the combined
 * font faces, composited using array order
 * to determine glyph priority.
 */
export function combine(buffers: Buffer[], fontStack?: string): Buffer {
  if (!buffers.length) {
    throw new Error("No buffers provided");
  }

  return fontStack 
		? combineNamed(buffers, fontStack) 
		: combineAuto(buffers);
}
