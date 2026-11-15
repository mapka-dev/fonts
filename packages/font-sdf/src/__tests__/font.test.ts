import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fontName, fontToGlyphs, readFont } from "../font.js";

const robotoTtf = join(import.meta.dirname, "../../../fonts/fonts/Roboto/Roboto-Regular.ttf");

/**
 * Generated with opentype.js 1.3.4, pbf 4 and rbush 1.3 (font-sdf 0.5.0).
 * Dependency upgrades must keep the SDF output byte-identical.
 */
const roboto0to255 = readFileSync(join(import.meta.dirname, "fixtures/roboto-regular.0.255.pbf"));

describe("readFont", () => {
  it("reads family and style", async () => {
    const font = await readFont(robotoTtf);

    expect(fontName(font)).toEqual({ family: "Roboto", style: "Regular" });
  });

  it("rejects a missing file", async () => {
    await expect(readFont(join(import.meta.dirname, "missing.ttf"))).rejects.toThrow(/ENOENT/);
  });
});

describe("fontToGlyphs", () => {
  it("matches the reference SDF glyphs", async () => {
    const font = await readFont(robotoTtf);

    expect(fontToGlyphs(font, 0, 255).equals(roboto0to255)).toBe(true);
  });
});
