import type { ProcessorParams, PublishSettings } from "../src/types";

export const settings: PublishSettings = {
	outputPath: "tests/output",
	defaultSubdir: "",
	imageFileExtensions: ["jpg", "png", "jpeg", "webp"],
};
export const slug = "slug";

export const makeParams = (
	override: Partial<ProcessorParams> = {},
): ProcessorParams => {
	return {
		settings,
		slug,
		content: "",
		basename: "default-basename",
		...override,
	};
};

export const makeContent = (strings: TemplateStringsArray, ...values: any[]): string => {
    const result = strings.reduce((acc, str, i) => {
        return acc + str + (values[i] || '');
    }, '');
    return result
        .replace(/^( {2}|\t)*/gm, '')  // Remove leading whitespace
        .replace(/\n+$/, '\n')  // Ensure only one trailing newline
        .trim();  // Remove leading/trailing whitespace
};

