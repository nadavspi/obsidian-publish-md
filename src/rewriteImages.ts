import { camelCase } from "change-case";

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

const rewriteImages = (content: string): string => {
	const { content: nextContent, images } = parseImages(content);
	if (!images.length) {
		return content;
	}

	const [, frontmatter, body] = nextContent.split("---");
	const imports = images.map(({ name, filename, ext }) => {
		return `import ${name} from "./${filename}.${ext}";`;
	});

	const outputFrontmatter = ["---", frontmatter, "---"].join("");
	return [outputFrontmatter, imports.join("\n"), body].join("\n");
};
export default rewriteImages;
