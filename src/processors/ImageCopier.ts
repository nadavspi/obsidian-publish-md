import * as fs from "node:fs/promises";
import { basename as pathBasename } from "node:path";
import { Notice } from "obsidian";
import type Publish from "../../main";
import type { PublishSettings } from "../types";

interface ImageFile {
	arrayBuffer: Promise<ArrayBuffer>;
	path: string;
}

class ImageCopier {
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

export default ImageCopier;
