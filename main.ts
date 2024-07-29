import {
    Notice,
    Plugin,
    PluginSettingTab,
    Setting,
    type App,
    type Editor
} from "obsidian";
import process from "./src/process";

interface PublishSettings {
	outputPath: string;
	defaultSubdir: string;
}

const DEFAULT_SETTINGS: PublishSettings = {
	outputPath: "~/src/nadav.is/src/content/media/",
	defaultSubdir: "",
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
						basename,
						content,
						defaultSubdir: this.settings.defaultSubdir,
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

		new Setting(containerEl)
			.setName("Default subdirectory (optional)")
			.setDesc("Put files without a frontmatter `type` in this subdirectory")
			.addText((text) =>
				text
					.setPlaceholder("name")
					.setValue(this.plugin.settings.defaultSubdir)
					.onChange(async (value) => {
						this.plugin.settings.defaultSubdir = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
