import type { ProcessorParams } from "../types";

const removeNotes = (params: ProcessorParams): ProcessorParams => {
	const content = params.content.replace(/## Notes.*/s, "").trim();
	return {
		...params,
		content: `${content}\n`,
	};
};

export default removeNotes;
