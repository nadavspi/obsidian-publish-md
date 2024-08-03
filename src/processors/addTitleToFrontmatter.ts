import type { ProcessorParams } from "../types";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const addTitleToFrontmatter = (params: ProcessorParams): ProcessorParams => {
    const [, frontmatterContent, ...body] = params.content.split("---");
    const frontmatter = parseYaml(frontmatterContent) || {};

    if (!frontmatter.title) {
        frontmatter.title = params.basename;
    }

    const updatedFrontmatter = stringifyYaml(frontmatter);
    const content = `---\n${updatedFrontmatter}---${body.join("---")}`;

    return {
        ...params,
        content,
    };
};

export default addTitleToFrontmatter;
