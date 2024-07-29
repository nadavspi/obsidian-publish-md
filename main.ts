import { promises as fs } from "fs";
import { Plugin, PluginSettingTab, Setting, type App } from "obsidian";
import { basename } from "path";
import slugify from "slugify";
import { parse as parseYaml } from "yaml";

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

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "publish-current-file",
			name: "Publish current file",
			callback: () => {
				console.log("cool");
				// process(inputFile, this.settings.outputPath)
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
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
			.setDesc(
				"Where should we put the processed files?\nInclude trailing slash.",
			)
			.addText((text) =>
				text
					.setPlaceholder("~/docs/")
					.setValue(this.plugin.settings.outputPath)
					.onChange(async (value) => {
						this.plugin.settings.outputPath = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}

export async function process(
	inputFile: string,
	outputPath: string,
): Promise<string> {
	const fileContent = await fs.readFile(inputFile, "utf8");
	const split = fileContent.split("---");
	if (split.length !== 3) {
		throw new Error("Invalid file: needs both frontmatter and content");
	}

	const frontmatter = parseYaml(split[1]) || {};
	// use slug from frontmatter, else slugify original filename
	const slug = slugify(frontmatter.slug || basename(inputFile, ".md"), {
		lower: true,
		strict: true,
	});
	const content = fileContent.replace(/## Notes.*/s, "");

	const outputFile = `${outputPath}/${slug}.mdx`;
	await fs.writeFile(outputFile, content);
	return outputFile;
}
