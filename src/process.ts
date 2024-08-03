import * as fs from "node:fs/promises";
import { basename as pathBasename } from "node:path";
import { Notice, parseYaml } from "obsidian";
import slugify from "slugify";
import type Publish from "../main";
import pipe from "./pipe";
import removeNotes from "./processors/removeNotes";
import wikilinks from "./processors/wikilinks";
import rewriteImages from "./rewriteImages";
import type { PublishSettings } from "./types";

interface Process {
	basename: string | undefined;
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
		wikilinks,
		removeNotes,
		rewriteImages,
	)({ content, slug, settings });
	const outputDir = [settings.outputPath, frontmatter.type || defaultSubdir]
		.filter(Boolean)
		.join("/");
	const outputFile = [outputDir, `${slug}.mdx`].filter(Boolean).join("/");

	const images = new ImageProcessor({ settings, plugin, outputDir, slug });

	await fs.mkdir(outputDir, { recursive: true });
	await fs.writeFile(outputFile, outputContent);
	return outputFile;
}

interface ImageFile {
	arrayBuffer: Promise<ArrayBuffer>;
}

class ImageProcessor {
	outputDir: string;
	slug: string;

	constructor({
		settings,
		plugin,
		outputDir,
		slug,
	}: {
		settings: PublishSettings;
		plugin: Publish;
		outputDir: string;
		slug: string;
	}) {
		this.outputDir = outputDir;
		this.slug = slug;

		const images = this.get({ settings, plugin });
		this.copy(images);
	}
	get({
		settings,
		plugin,
	}: {
		settings: PublishSettings;
		plugin: Publish;
	}): ImageFile[] {
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
		const images: ImageFile[] = links
			.filter((link) =>
				settings.imageFileExtensions.some((ext) => link.endsWith(ext)),
			)
			.map((path): ImageFile => {
				const file = plugin.app.vault.getFileByPath(path);
				if (!file) {
					throw new Error(`Couldn't get the file ${path}`);
				}
				const arrayBuffer = plugin.app.vault.readBinary(file);
				return { path, arrayBuffer };
			});
		return images;
	}

	async copy(images: ImageFile[]) {
		for (const source of images) {
			try {
				const dir = `${this.outputDir}/${this.slug}`;
				await fs.mkdir(dir, { recursive: true });
				const buffer = Buffer.from(await source.arrayBuffer);
				const file = `${dir}/${pathBasename(source.path)}`;
				await fs.writeFile(file, buffer);
			} catch (error: unknown) {
				new Notice(`${error}`);
			}
		}
	}
}
