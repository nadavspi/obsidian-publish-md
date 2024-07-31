import type { PublishSettings } from "../src/types";

export const i = (basename: string): string => `tests/input/${basename}.md`;
export const o = (basename: string): string => `tests/output/${basename}.mdx`;
export const settings: PublishSettings = {
	outputPath: "tests/output",
	defaultSubdir: "",
	imageFileExtensions: ["jpg", "png", "jpeg", "webp"],
}
