import { camelCase } from "change-case";
import { type ProcessorParams } from "./process";

interface Image {
	filename: string;
	ext: string;
	name: string;
}
interface ContentAndImages {
	content: string;
	images: Image[];
}
export const parseImages = (params: ProcessorParams): ContentAndImages => {
	const images: Image[] = [];
	const extensions = params.settings.imageFileExtensions.join("|");
	const nextContent = params.content.replace(
		// have to double escape \ (once for the string, once for the regexp)
		new RegExp(`!\\[\\[([^\\]]+)\\.(${extensions})\\]\\]`, "gm"),
		(match, filename, ext) => {
			const name = camelCase(filename);
			images.push({ ext, filename, name });
			return `<Image src={${name}} alt="" />`;
		},
	);
	return { content: nextContent, images };
};

const rewriteImages = (params: ProcessorParams): ProcessorParams => {
	const { content: nextContent, images } = parseImages(params);
	if (!images.length) {
		return params;
	}

	const [, frontmatter, body] = nextContent.split("---");
	const imports = images.map(({ name, filename, ext }) => {
		return `import ${name} from "./${params.slug}/${filename}.${ext}";`;
	});

	const imageComponent = `import { Image } from "astro:assets";`;

	const outputFrontmatter = ["---", frontmatter, "---"].join("");
	return {
		...params,
		content: [outputFrontmatter, imageComponent, imports.join("\n"), body].join("\n"),
	};
};
export default rewriteImages;
