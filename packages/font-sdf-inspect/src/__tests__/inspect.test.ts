import { describe, it, expect, vi, type Mock } from "vitest";
import { inspectRaw, inspectHtml } from "../inspect.js";
import { resolve } from "node:path";
import { existsSync, writeFileSync } from "node:fs";

vi.mock("node:fs", async () => {
  const originalFs = await vi.importActual<typeof import("node:fs")>("node:fs");
  return {
    ...originalFs,
    writeFileSync: vi.fn(),
  };
});

describe("Font SDF Inspection", () => {
  const fixturesDir = resolve(import.meta.dirname, "./fixtures");
  const pbfFilePath = resolve(fixturesDir, "0-255.pbf");

  it("inspects raw font data and logs output correctly", () => {
    expect(existsSync(pbfFilePath)).toBe(true);
    const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const consoleTableSpy = vi.spyOn(console, "table").mockImplementation(() => {});

    inspectRaw(pbfFilePath);

    expect(consoleSpy.mock.calls).toMatchSnapshot();
    expect(consoleTableSpy.mock.calls).toMatchSnapshot();

    consoleSpy.mockRestore();
    consoleTableSpy.mockRestore();
  });

  it("generates correct HTML output for SDF font", () => {
    expect(existsSync(pbfFilePath)).toBe(true);

    inspectHtml(pbfFilePath);

    expect(writeFileSync).toHaveBeenCalledOnce();

    const [, htmlContent] = (writeFileSync as Mock).mock.calls[0];
    expect(htmlContent).toMatchSnapshot();
  });
});
