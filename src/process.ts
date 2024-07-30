import { camelCase } from "change-case";
import * as fs from "node:fs/promises";
import slugify from "slugify";
import { parse as parseYaml } from "yaml";
import pipe from "./pipe";

interface Process {
	basename: string | undefined;
	content: string;
	defaultSubdir?: string;
	outputPath: string;
}

export default async function process({
	basename,
	content,
	defaultSubdir,
	outputPath,
}: Process): Promise<string> {
	const split = content.split("---");
	if (split.length !== 3) {
		throw new Error("Invalid file: needs both frontmatter and content");
	}
	if (!basename) {
		throw new Error("Give me the basename");
	}

	const frontmatter = parseYaml(split[1]) || {};
	// use slug from frontmatter, else slugify original filename
	const slug = slugify(frontmatter.slug || basename, {
		lower: true,
		strict: true,
	});
	const outputContent = pipe(stripWikilinks, removeNotes, rewriteImages)(content);
	const outputFile = [
		outputPath,
		frontmatter.type || defaultSubdir,
		`${slug}.mdx`,
	]
		.filter(Boolean)
		.join("/");

	await fs.writeFile(outputFile, outputContent);
	return outputFile;
}

const removeNotes = (content: string): string =>
	content.replace(/## Notes.*/s, "");

const stripWikilinks = (content: string): string => {
	// ([^\!]) capture, any char that isn't ! (to exclude media embeds)
	// \[\[
	// ([^\]]+) capture, any characters that aren't ]] or newline
	// \]\]
	return content.replace(
		/([^\!])\[\[([^\]]+)\]\]/gm,
		(match, before, linkText) => {
			return `${before}${linkText}`;
		},
	);
};

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
