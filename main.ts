import { promises as fs } from "fs";
import {
    App,
    Editor,
    MarkdownView,
    Plugin,
    PluginSettingTab,
    Setting
} from "obsidian";
import { basename } from "path";
import slugify from "slugify";
import { parse as parseYaml } from "yaml";

interface PublishSettings {
	targetPath: string;
}

const DEFAULT_SETTINGS: PublishSettings = {
	targetPath: "default",
};

export default class Publish extends Plugin {
	settings: PublishSettings;

	async onload() {
		await this.loadSettings();

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal {
	constructor(app: App) {}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: Publish;

	constructor(app: App, plugin: Publish) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.targetPath)
					.onChange(async (value) => {
						this.plugin.settings.targetPath = value;
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
