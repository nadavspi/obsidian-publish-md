import rewriteImages, { parseImages } from "../src/processors/rewriteImages";
import { makeContent, makeParams } from "./test-helpers";

const contentAndImages = {
	content: makeContent`
        <Image src={anElephantSittingStill_1} alt="" />
        <Image src={aPngNow} alt="" />
    `,
	images: [
		{
			ext: "jpg",
			filename: "An.Elephant.Sitting.Still-1",
			name: "anElephantSittingStill_1",
		},
		{
			ext: "png",
			filename: "a-png-now",
			name: "aPngNow",
		},
	],
};

test("parseImages returns nextContent and imports as expected", () => {
	const params = makeParams({
		content: makeContent`
            ![[An.Elephant.Sitting.Still-1.jpg]]
            ![[a-png-now.png]]
        `,
	});
	const output = parseImages(params);
	expect(output).toEqual(contentAndImages);
});

describe("rewriteImages", () => {
	test("works as expected", () => {
		const params = makeParams({
			content: makeContent`
            ---
            title: hello
            ---
            text
            ![[An.Elephant.Sitting.Still-1.jpg]]
            ![[a-png-now.png]]
        `,
			slug: "slug",
		});
		const output = rewriteImages(params);
		const expected = makeContent`
        ---
        title: hello
        ---
        import { Image } from "astro:assets";
        import anElephantSittingStill_1 from "./slug/An.Elephant.Sitting.Still-1.jpg";
        import aPngNow from "./slug/a-png-now.png";

        text
        <Image src={anElephantSittingStill_1} alt="" />
        <Image src={aPngNow} alt="" />
    `;
		expect(output.content).toEqual(expected);
	});

	test("works on files with --- in the content", () => {
		const params = makeParams({
			content: makeContent`
            ---
            title: hello
            ---
            text
            ![[An.Elephant.Sitting.Still-1.jpg]]
            ![[a-png-now.png]]

			---
			watch out now
        `,
			slug: "slug",
		});
		const output = rewriteImages(params);
		const expected = makeContent`
        ---
        title: hello
        ---
        import { Image } from "astro:assets";
        import anElephantSittingStill_1 from "./slug/An.Elephant.Sitting.Still-1.jpg";
        import aPngNow from "./slug/a-png-now.png";

        text
        <Image src={anElephantSittingStill_1} alt="" />
        <Image src={aPngNow} alt="" />

		---
		watch out now
    `;
		expect(output.content).toEqual(expected);
	});
});
