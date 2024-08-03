import addTitleToFrontmatter from '../src/processors/addTitleToFrontmatter';
import { makeParams, makeContent } from './test-helpers';

test('adds title to frontmatter when no title is present', () => {
    const params = makeParams({
        content: makeContent`
            ---
            key: value
            ---
            Some content here.
        `,
        basename: 'Test File'
    });
    const result = addTitleToFrontmatter(params);
    expect(result.content).toEqual(makeContent`
        ---
        key: value
        title: Test File
        ---
        Some content here.
    `);
});

test('does not modify frontmatter when title is already present', () => {
    const params = makeParams({
        content: makeContent`
            ---
            title: Existing Title
            key: value
            ---
            Some content here.
        `,
        basename: 'Test File'
    });
    const result = addTitleToFrontmatter(params);
    expect(result.content).toEqual(params.content);
});

test('handles empty frontmatter', () => {
    const params = makeParams({
        content: makeContent`
            ---
            ---
            Some content here.
        `,
        basename: 'Test File'
    });
    const result = addTitleToFrontmatter(params);
    expect(result.content).toEqual(makeContent`
        ---
        title: Test File
        ---
        Some content here.
    `);
});

test('preserves other frontmatter properties', () => {
    const params = makeParams({
        content: makeContent`
            ---
            date: 2023-04-01
            key: value
            ---
            Some content here.
        `,
        basename: 'Test File'
    });
    const result = addTitleToFrontmatter(params);
    expect(result.content).toEqual(makeContent`
        ---
        date: 2023-04-01
        key: value
        title: Test File
        ---
        Some content here.
    `);
});

test('preserves --- within the content', () => {
    const params = makeParams({
        content: makeContent`
            ---
            ---
            Some content here.

			---
			this is all content now
        `,
        basename: 'Test File'
    });
    const result = addTitleToFrontmatter(params);
    expect(result.content).toEqual(makeContent`
        ---
        title: Test File
        ---
        Some content here.

		---
		this is all content now
    `);
});
