import * as fs from "node:fs/promises";
import { parseImages } from "../src/rewriteImages";
import { i } from "./test-helpers";

describe("parseImages", () => {
	test("returns nextContent and imports as expected", async () => {
		const basename = "with-images";
		const input = await fs.readFile(i(basename));
		const content = [
			"![[An.Elephant.Sitting.Still-1.jpg]]",
			"![[a-png-now.png]]",
		].join("\n");
		const output = parseImages(content);
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
