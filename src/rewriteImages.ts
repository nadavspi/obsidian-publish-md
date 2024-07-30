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
export const parseImages = (content: string): ContentAndImages => {
	const images: Image[] = [];
	const nextContent = content.replace(
		/!\[\[([^\]]+)\.(jpg|png|jpeg|webp)\]\]/gm,
		(match, filename, ext) => {
			const name = camelCase(filename);
			images.push({ ext, filename, name });
			return `<Image src={${name}} alt="" />`;
		},
	);
	return { content: nextContent, images };
};

const rewriteImages = (params: ProcessorParams): ProcessorParams => {
	const { content: nextContent, images } = parseImages(params.content);
	if (!images.length) {
		return params;
	}

	const [, frontmatter, body] = nextContent.split("---");
	const imports = images.map(({ name, filename, ext }) => {
		return `import ${name} from "./${filename}.${ext}";`;
	});

	const outputFrontmatter = ["---", frontmatter, "---"].join("");
	return {
		...params,
		content: [outputFrontmatter, imports.join("\n"), body].join("\n"),
	};
};
export default rewriteImages;
