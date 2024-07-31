import * as fs from "node:fs/promises";
import { parseImages } from "../src/rewriteImages";
import { i, o, settings } from "./test-helpers";
import process from "../src/process";

describe("parseImages", () => {
	test("returns nextContent and imports as expected", async () => {
		const basename = "with-images";
		const input = await fs.readFile(i(basename));
		const content = [
			"![[An.Elephant.Sitting.Still-1.jpg]]",
			"![[a-png-now.png]]",
		].join("\n");
		const output = parseImages({ content, slug: "", settings });
		const expected = {
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
		expect(output).toEqual(expected);
	});
});

test("rewrite image embeds", async () => {
	const basename = "with-images";
	const input = await fs.readFile(i(basename));
	await process({ basename, content: input.toString("utf8"), settings });
	const output = await fs.readFile(o(basename));
	const expected = `---
titleTranslated: A League of Nobleman
title: 君子盟
date: 2024-07-27
yearPublished: 2023
category: TV
---
import blackSquare from "./with-images/black square.jpg";
import whiteSquare from "./with-images/white-square.png";
import square from "./with-images/square.jpeg";

we've got images

<Image src={blackSquare} alt="" />

<Image src={whiteSquare} alt="" />

<Image src={square} alt="" />
`;

	expect(output.toString("utf8")).toEqual(expected);
});
