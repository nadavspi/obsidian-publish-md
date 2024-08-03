import wikilinks from "../src/processors/wikilinks";
import { makeParams, makeContent } from "./test-helpers";

test("remove wikilinks", () => {
    const params = makeParams({
        content: makeContent`
            ---
            ---
            boom
            here is [[a link]]. and [[another]]
            and [[even more]]!
        `
    });

    const expected = makeContent`
        ---
        ---
        boom
        here is a link. and another
        and even more!
    `;
    const output = wikilinks(params);
    expect(output.content).toEqual(expected);
});
