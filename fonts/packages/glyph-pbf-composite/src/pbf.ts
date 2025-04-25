import Pbf from "pbf";
import { 
  readglyphs, 
  writeglyphs 
} from "./glyphs.js";

export interface Glyph {
  id: number;
  bitmap?: Buffer;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
  advance?: number;
}

interface FontStack {
  name?: string;
  range?: string;
  glyphs: Glyph[];
}

export interface Glyphs {
  stacks: FontStack[];
}

export function decode(buffer: Buffer) {
  const pbf = new Pbf(buffer);
  return readglyphs(pbf) as Glyphs;
}

export function encode(message: Glyphs) {
  const pbf = new Pbf();
  writeglyphs(message, pbf);
  return Buffer.from(pbf.finish());
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
