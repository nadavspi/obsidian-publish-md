import { promises as fs } from "fs";
import { rimraf } from "rimraf";
import { process } from "../main";

beforeAll(async () => {
	await rimraf("tests/output/*", { glob: true });
});

const i = (x: string): string => `tests/input/${x}.md`;
const o = (x: string): string => `tests/output/${x}.mdx`;

test("should abort on files without frontmatter", async () => {
	await expect(
		process("tests/input/no-frontmatter.md", "tests/output/"),
	).rejects.toThrow("Invalid file: needs both frontmatter and content");
});

test("copies a simple file", async () => {
	await process("tests/input/simple.md", "tests/output/");
	const input = await fs.readFile(i("simple"));
	const output = await fs.readFile(o("simple"));
	expect(input).toEqual(output);
});

describe("slugify the filename", () => {
	test("based on the original filename", async () => {
		await process(i("/Careful Now"), "tests/output/");
		const input = await fs.readFile(i("Careful Now"));
		const output = await fs.readFile(o("careful-now"));
		expect(input).toEqual(output);
	});

	test("based on the frontmatter", async () => {
		await process(i("custom-slug"), "tests/output/");
		const input = await fs.readFile(i("custom-slug"));
		const output = await fs.readFile(o("fancy-custom-slug"));
		expect(input).toEqual(output);
	});
});
