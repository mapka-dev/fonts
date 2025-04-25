import { decode } from "@mapka/font-sdf";
import { existsSync, readFileSync } from "node:fs";


export function inspect(path: string) {
  if(!existsSync(path)) {
    throw new Error(`File not found: ${path}`);
  }

  const pbf = readFileSync(path);
  const glyphs = decode(pbf);
}