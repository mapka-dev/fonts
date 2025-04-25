import { describe, expect, it } from "vitest";
import { debug } from "../pbf.js";
import { join } from "node:path";
import { readFileSync } from "node:fs";

const openSans512: Buffer = readFileSync(
  join(import.meta.dirname, "/fixtures/opensans.512.767.pbf")
);

describe("debug", () => {
  it("debug method shows decoded glyphs", () => {
    const something = debug(openSans512, true);

    expect(JSON.parse(something).stacks[0].glyphs.length).toBe(16);
  });

  it("debug without decoded glyphs", () => {
    const something = debug(openSans512);
    expect(JSON.parse(something).stacks[0].glyphs.length).toBe(16);
  });
});
