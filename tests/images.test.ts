import rewriteImages, { parseImages } from "../src/rewriteImages";
import { settings } from "./test-helpers";

const contentAndImages = {
	content: [
		`<Image src={anElephantSittingStill_1} alt="" />`,
		`<Image src={aPngNow} alt="" />`,
	].join("\n"),
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

describe("parseImages", () => {
	test("returns nextContent and imports as expected", async () => {
		const content = [
			"![[An.Elephant.Sitting.Still-1.jpg]]",
			"![[a-png-now.png]]",
		].join("\n");
		const output = parseImages({ content, slug: "", settings });
		expect(output).toEqual(contentAndImages);
	});
});

test("rewriteImages", () => {
	const content = [
		"---",
		"title: hello",
		"---",
		"text",
		"![[An.Elephant.Sitting.Still-1.jpg]]",
		"![[a-png-now.png]]",
	].join("\n");
	const output = rewriteImages({ content, slug: "slug", settings });
	const expected = `---
title: hello
---
import { Image } from "astro:assets";
import anElephantSittingStill_1 from "./slug/An.Elephant.Sitting.Still-1.jpg";
import aPngNow from "./slug/a-png-now.png";

text
<Image src={anElephantSittingStill_1} alt="" />
<Image src={aPngNow} alt="" />`;
	expect(output.content).toEqual(expected);
});
