import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { decode, encode } from "@mapka/font-sdf";
import { combine } from "../combine.js";

const openSans512: Buffer = readFileSync(
	join(import.meta.dirname, "/fixtures/opensans.512.767.pbf")
);
const arialUnicode512: Buffer = readFileSync(
	join(import.meta.dirname, "/fixtures/arialunicode.512.767.pbf"),
);
const league512: Buffer = readFileSync(
	join(import.meta.dirname, "/fixtures/league.512.767.pbf")
);
const composite512: Buffer = readFileSync(
	join(import.meta.dirname, "/fixtures/opensans.arialunicode.512.767.pbf"),
);
const triple512: Buffer = readFileSync(
	join(import.meta.dirname, "/fixtures/league.opensans.arialunicode.512.767.pbf"),
);

describe("combine", () => {
	describe("two pbfs", () => {
		const composite = decode(
			combine([openSans512, arialUnicode512])
		);
		const expected = decode(composite512);

		it("has stacks", () => {
			expect(composite.stacks).toBeTruthy();
			expect(composite.stacks.length).toBe(1);
		});

		it("is a named stack", () => {
			expect(composite.stacks[0].name).toBeTruthy();
		});

		it("has a glyph range", () => {
			expect(composite.stacks[0].range).toBeTruthy();
		});

		it("equals a server-composited stack", () => {
			expect(composite).toEqual(expected);
		});

		const composite2 = encode(composite);
		const expected2 = encode(expected);
		it("re-encodes nicely", () => {

			expect(composite2).toEqual(expected2);
		});

		const reComposite = decode(combine([league512, composite2]));
		const reExpect = decode(triple512);

		it("can add on a third for good measure", () => {
			expect(reComposite).toEqual(reExpect);
		});
	});


	describe("with fontstack string name", () => {
		const name = "Open Sans Regular,Arial Unicode MS Regular";
		const compositeName = decode(
			combine([openSans512, arialUnicode512], name)
		);
		const compositeNoname = decode(
			combine([openSans512, arialUnicode512])
		);
		const expected = decode(composite512);

		it("has stacks", () => {
			expect(compositeName.stacks).toBeTruthy();
			expect(compositeName.stacks.length).toBe(1);
		});

		it("no name", () => {
			expect(compositeNoname).toEqual(expected);
		});

		it("not equal when provided non-spaced stack name", () => {
			expect(compositeName).not.toEqual(expected);
		});

		it("composite named and unnamed stacks", () => {
			expect(compositeName.stacks[0].glyphs).toEqual(compositeNoname.stacks[0].glyphs);
			expect(compositeName.stacks[0].range).toEqual(compositeNoname.stacks[0].range);
		});

		it("returns stacks with provided name", () => {
			expect(compositeName.stacks[0].name).toBe(name);
		});
	});

	it("throws when no buffers provided", () => {
		expect(() => combine([])).toThrow();
	});

	it("can composite only one pbf", () => {
		const composite = decode(combine([openSans512]));
		const expected = decode(openSans512);

		expect(composite).toEqual(expected);
	});

	it("can composite more than two", () => {
		const composite = decode(
			combine([league512, openSans512, arialUnicode512]),
		);
		const expected = decode(triple512);

		expect(composite).toEqual(expected);
	});
});
