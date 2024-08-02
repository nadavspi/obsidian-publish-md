import type { ProcessorParams } from "../types";
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

export default stripWikilinks;
