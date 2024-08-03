import removeNotes from "../src/processors/removeNotes";
import wikilinks from "../src/processors/wikilinks";
import { settings, slug } from "./test-helpers";

test("remove notes from the end of the file", async () => {
	const content = `---
---
content

## Notes

big secrets here
`;
	const expected = `---
---
content

`;

	const output = removeNotes({ content, settings, slug });
	expect(output.content).toEqual(expected);
});

test("remove wikilinks", async () => {
	const content = `---
---
boom
here is [[a link]]. and [[another]]
and [[even more]]!
`;

	const expected = `---
---
boom
here is a link. and another
and even more!
`;
	const output = wikilinks({ content, settings, slug });
	expect(output.content).toEqual(expected);
});
