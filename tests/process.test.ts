import * as fs from "node:fs/promises";
import { rimraf } from "rimraf";
import process from "../src/process";
import { i, o, outputPath } from "./test-helpers";

beforeAll(async () => {
	await rimraf("tests/output/**/*.mdx", { glob: true });
});

test("should abort on files without frontmatter", async () => {
	const basename = "no-frontmatter";
	const input = await fs.readFile(i(basename));
	await expect(
		process({ basename, content: input.toString("utf8"), outputPath }),
	).rejects.toThrow("Invalid file: needs both frontmatter and content");
});

test("copy a simple file", async () => {
	const basename = "simple";
	const input = await fs.readFile(i(basename));
	await process({ basename, content: input.toString("utf8"), outputPath });
	const output = await fs.readFile(o(basename));
	expect(input).toEqual(output);
});

describe("slugify the filename", () => {
	test("based on the original filename", async () => {
		const basename = "Careful Now";
		const input = await fs.readFile(i(basename));
		await process({ basename, content: input.toString("utf8"), outputPath });
		const output = await fs.readFile(o("careful-now"));
		expect(input).toEqual(output);
	});

	test("based on the frontmatter", async () => {
		const basename = "custom-slug";
		const input = await fs.readFile(i(basename));
		await process({ basename, content: input.toString("utf8"), outputPath });
		const output = await fs.readFile(o("fancy-custom-slug"));
		expect(input).toEqual(output);
	});
});

test("remove notes from the end of the file", async () => {
	const basename = "with-private-notes";
	const input = await fs.readFile(i(basename));
	await process({ basename, content: input.toString("utf8"), outputPath });
	const output = await fs.readFile(o("with-private-notes"));
	const expected = `---
---
content

`;

	expect(output.toString("utf8")).toEqual(expected);
});

test("strip wikilinks", async () => {
	const basename = "with-wikilinks";
	const input = await fs.readFile(i(basename));
	await process({ basename, content: input.toString("utf8"), outputPath });
	const output = await fs.readFile(o("with-wikilinks"));
	const expected = `---
---
boom
here is a link. and another
and even more!
`;

	expect(output.toString("utf8")).toEqual(expected);
});

describe("put files in a subdirectory", () => {
	test("based on type frontmatter property", async () => {
		const basename = "with-type";
		const input = await fs.readFile(i(basename));
		await process({ basename, content: input.toString("utf8"), outputPath });
		const output = await fs.readFile(o(`media/${basename}`));
		expect(input).toEqual(output);
	});

	test("based on defaultSubdir setting", async () => {
		const basename = "simple";
		const input = await fs.readFile(i(basename));
		await process({
			basename,
			content: input.toString("utf8"),
			defaultSubdir: "media",
			outputPath,
		});
		const output = await fs.readFile(o(`media/${basename}`));
		expect(input).toEqual(output);
	});
});

test("rewrite image embeds", async () => {
	const basename = "with-images";
	const input = await fs.readFile(i(basename));
	await process({ basename, content: input.toString("utf8"), outputPath });
	const output = await fs.readFile(o(basename));
	const expected = `---
titleTranslated: A League of Nobleman
title: 君子盟
date: 2024-07-27
yearPublished: 2023
category: TV
---
import anElephantSittingStill_1 from "./An.Elephant.Sitting.Still-1.jpg";
import aPngNow from "./a-png-now.png";
import aJpegWithSpacesInTheName from "./a jpeg with spaces in the name.jpeg";

we've got images

<Image src={anElephantSittingStill_1} alt="" />

<Image src={aPngNow} alt="" />

<Image src={aJpegWithSpacesInTheName} alt="" />
`;

	expect(output.toString("utf8")).toEqual(expected);
});
