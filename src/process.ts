import * as fs from "node:fs/promises";
import slugify from "slugify";
import { parse as parseYaml } from "yaml";
import Publish from "../main";
import pipe from "./pipe";
import rewriteImages from "./rewriteImages";
import type { PublishSettings } from "./types";

interface Process {
	basename: string | undefined;
	content: string;
	defaultSubdir?: string;
	settings: PublishSettings;
	plugin: Publish;
}

export interface ProcessorParams {
	content: string;
	slug: string;
	settings: PublishSettings;
}

export default async function process({
	basename,
	content,
	defaultSubdir,
	settings,
	plugin,
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
	const { content: outputContent } = pipe(
		stripWikilinks,
		removeNotes,
		rewriteImages,
	)({ content, slug, settings });
	const outputFile = [
		settings.outputPath,
		frontmatter.type || defaultSubdir,
		`${slug}.mdx`,
	]
		.filter(Boolean)
		.join("/");

	const images = await getImages({ settings, plugin });

	await fs.writeFile(outputFile, outputContent);
	return outputFile;
}

const removeNotes = (params: ProcessorParams): ProcessorParams => {
	return {
		...params,
		content: params.content.replace(/## Notes.*/s, ""),
	};
};

const stripWikilinks = (params: ProcessorParams): ProcessorParams => {
	return {
		...params,
		content: params.content.replace(
			// ([^\!]) capture, any char that isn't ! (to exclude media embeds)
			// \[\[
			// ([^\]]+) capture, any characters that aren't ]] or newline
			// \]\]
			/([^\!])\[\[([^\]]+)\]\]/gm,
			(match, before, linkText) => {
				return `${before}${linkText}`;
			},
		),
	};
};

const getImages = ({
	settings,
	plugin,
}: { settings: PublishSettings; plugin: Publish }): string[] => {
	const file = plugin.app.workspace.getActiveFile()?.path;
	if (!file) {
		throw new Error("No active file");
	}
	const links: string[] = Object.keys(
		plugin.app.metadataCache.resolvedLinks[
			// @ts-ignore we checked that there's a file
			plugin.app.workspace.getActiveFile().path
		],
	);
	const images = links.filter((link) =>
		settings.imageFileExtensions.some((ext) => link.endsWith(ext)),
	);
	console.log({ links, images });
	return images;
};
