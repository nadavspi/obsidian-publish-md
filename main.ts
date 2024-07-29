import * as fs from "node:fs/promises";
import {
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  type App,
  type Editor
} from "obsidian";
import slugify from "slugify";
import { parse as parseYaml } from "yaml";
import pipe from "./src/pipe";

interface PublishSettings {
	outputPath: string;
}

const DEFAULT_SETTINGS: PublishSettings = {
	outputPath: "~/src/nadav.is/src/content/media/",
};

export default class Publish extends Plugin {
	settings: PublishSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "publish-current-file",
			name: "Publish current file",
			editorCallback: async (editor: Editor) => {
				try {
					const content = editor.getValue();
					const basename = this.app.workspace.getActiveFile()?.basename;
					const output = await process({
						content,
						basename,
						outputPath: this.settings.outputPath,
					});
					new Notice(`Copied "${basename}"`);
				} catch (error: unknown) {
					new Notice(`${error}`);
				}
			},
		});

		this.addSettingTab(new Settings(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class Settings extends PluginSettingTab {
	plugin: Publish;

	constructor(app: App, plugin: Publish) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Output path")
			.setDesc("Absolute path, no trailing slash")
			.addText((text) =>
				text
					.setPlaceholder("/home/user/docs")
					.setValue(this.plugin.settings.outputPath)
					.onChange(async (value) => {
						this.plugin.settings.outputPath = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}

interface Process {
	basename: string | undefined;
	content: string;
	outputPath: string;
}

export async function process({
	basename,
	content,
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
	const outputContent = pipe(stripWikilinks, removeNotes)(content);
	const outputFile = [outputPath, frontmatter.type, `${slug}.mdx`]
		.filter(Boolean)
		.join("/");

	await fs.writeFile(outputFile, outputContent);
	return outputFile;
}

const removeNotes = (content: string): string =>
	content.replace(/## Notes.*/s, "");

const stripWikilinks = (content: string): string => {
	return content.replace(/\[\[([^\]]+)\]\]/gm, (match, linkText) => {
		return linkText;
	});
};
