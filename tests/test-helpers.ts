import type { ProcessorParams, PublishSettings } from "../src/types";

export const settings: PublishSettings = {
	outputPath: "tests/output",
	defaultSubdir: "",
	imageFileExtensions: ["jpg", "png", "jpeg", "webp"],
};
export const slug = "slug";

export const makeParams = (override: object): ProcessorParams => {
	return { settings, slug, content: "", ...override };
};
