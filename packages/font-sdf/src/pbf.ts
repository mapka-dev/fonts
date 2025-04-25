import Pbf from "pbf";
import { 
  readglyphs, 
  writeglyphs 
} from "./glyphs.js";

export interface Glyph {
  id: number;
  bitmap: Buffer | null;
  width: number;
  height: number;
  left: number;
  top: number;
  advance: number;
}

export interface FontStack {
  name?: string;
  range?: string;
  glyphs: Glyph[];
}

export interface Glyphs {
  stacks: FontStack[];
}

/**
 * 
 * @param buffer A PBF buffer.
 * @returns {Glyphs} A Glyphs message.
 */
export function decode(buffer: Buffer): Glyphs {
  const pbf = new Pbf(buffer);
  return readglyphs(pbf);
}

/**
 * Encode a Glyphs message.
 * @param {Glyphs} message A Glyphs message.
 * @returns {Buffer} A PBF buffer.
 */
export function encode(message: Glyphs): Buffer {
  const pbf = new Pbf();
  writeglyphs(message, pbf);
  const view = pbf.finish();
  
  return Buffer.from(view);
}

/**
 * Debug a PBF.
 * @param {Buffer} buffer A PBF buffer.
 * @param {boolean} decoded Decode the buffer before stringify.
 */
export function debug(buffer: Buffer, decoded = true) {
  let result: Buffer | Glyphs = buffer
  if (decoded) {
    result = decode(buffer);
  }

  return JSON.stringify(
    result,
    (k, v) => {
      if (k !== "bitmap") return v;
      return v ? v.data.length : v;
    },
    2,
  );
}
