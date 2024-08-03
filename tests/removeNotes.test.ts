import removeNotes from "../src/processors/removeNotes";
import { makeParams, makeContent } from "./test-helpers";

test("remove notes from the end of the file", () => {
    const params = makeParams({
        content: makeContent`
            ---
            ---
            content

            ## Notes

            big secrets here
        `
    });
    const expected = makeContent`
        ---
        ---
        content
    ` + '\n'; // removeNotes puts a single newline at the end

    const output = removeNotes(params);
    expect(output.content).toEqual(expected);
});
