import * as fs from "node:fs/promises";
import { parseYaml } from "obsidian";
import slugify from "slugify";
import type Publish from "../main";
import pipe from "./pipe";
import ImageCopier from "./processors/ImageCopier";
import removeNotes from "./processors/removeNotes";
import wikilinks from "./processors/wikilinks";
import rewriteImages from "./processors/rewriteImages";
import type { PublishSettings } from "./types";

interface Process {
	basename: string;
	content: string;
	defaultSubdir?: string;
	settings: PublishSettings;
	plugin: Publish;
}

export default async function process({
	basename,
	content,
	defaultSubdir,
	settings,
	plugin,
}: Process): Promise<string> {
	const split = content.split("---");
	if (split.length < 3) {
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
	const { content: outputContent } = pipe(
		wikilinks,
		removeNotes,
		rewriteImages,
	)({ content, slug, settings, basename });
	const outputDir = [settings.outputPath, frontmatter.type || defaultSubdir]
		.filter(Boolean)
		.join("/");
	const outputFile = [outputDir, `${slug}.mdx`].filter(Boolean).join("/");

	const images = new ImageCopier({ settings, plugin, outputDir, slug });

	await fs.mkdir(outputDir, { recursive: true });
	await fs.writeFile(outputFile, outputContent);
	return outputFile;
}
