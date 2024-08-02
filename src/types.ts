export interface PublishSettings {
	outputPath: string;
	defaultSubdir: string;
	imageFileExtensions: string[];
}

export interface ProcessorParams {
	content: string;
	slug: string;
	settings: PublishSettings;
}

