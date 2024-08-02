import type { ProcessorParams } from "../types";
const removeNotes = (params: ProcessorParams): ProcessorParams => {
	return {
		...params,
		content: params.content.replace(/## Notes.*/s, ""),
	};
};

export default removeNotes;
