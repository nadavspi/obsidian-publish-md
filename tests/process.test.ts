import * as fs from "node:fs/promises";
import removeNotes from "../src/processors/removeNotes";
import stripWikilinks from "../src/processors/stripWikilinks";
import { i, o, settings, slug } from "./test-helpers";

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

test("strip wikilinks", async () => {
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
	const output = stripWikilinks({ content, settings, slug });
	expect(output.content).toEqual(expected);
});
