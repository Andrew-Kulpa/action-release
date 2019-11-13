"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint @typescript-eslint/no-explicit-any: off */
const mockGetInput = jest.fn();
const mockWarning = jest.fn();
const mockGlob = jest.fn();
const mockReadFileSync = jest.fn();
const mockStatSync = jest.fn();
const mockExistsSync = jest.fn(x => true); // used by github actions `new Context()`
const context_1 = require("@actions/github/lib/context");
const inputs_1 = require("../src/main/inputs");
const artifact_1 = require("../src/main/artifact");
const FILES = [
    new artifact_1.Artifact('a/art1'),
    new artifact_1.Artifact('b/art2'),
];
const TAR_OPTIONS = ['tar', 'gz', 'tgz', 'tar.gz'];
const multiLine = `
dist/file1
dist/file2
`;
jest.mock('@actions/core', () => ({
    getInput: mockGetInput,
    warning: mockWarning,
}));
jest.mock('fs', () => ({
    readFileSync: mockReadFileSync,
    statSync: mockStatSync,
    existsSync: mockExistsSync,
}));
describe('inputs', () => {
    let context;
    let inputs;
    beforeEach(() => {
        mockGetInput.mockReset();
        mockReadFileSync.mockReturnValue('{}'); // used by github actions `new Context()`
        context = new context_1.Context();
        mockReadFileSync.mockReset();
        inputs = new inputs_1.ActionInputs(createGlobber(), context);
    });
    it('returns commit', () => {
        context.sha = 'de9f2c7f';
        expect(inputs.commit).toBe('de9f2c7f');
    });
    it('returns token', () => {
        mockGetInput.mockReturnValue('sometoken');
        expect(inputs.token).toBe('sometoken');
    });
    describe('files', () => {
        it('returns empty artifacts', () => {
            mockGetInput.mockReturnValueOnce('')
                .mockReturnValueOnce('');
            expect(inputs.files).toEqual([]);
            expect(mockGlob).toHaveBeenCalledTimes(0);
        });
        it('returns input.files', () => {
            mockGetInput.mockReturnValueOnce(multiLine);
            expect(inputs.files).toEqual(FILES);
            expect(mockGlob).toHaveBeenCalledTimes(1);
            expect(mockGlob).toHaveBeenCalledWith(multiLine);
        });
        it('returns input.file', () => {
            mockGetInput.mockReturnValueOnce('')
                .mockReturnValueOnce('art2');
            expect(inputs.files).toEqual(FILES);
            expect(mockGlob).toHaveBeenCalledTimes(1);
            expect(mockGlob).toHaveBeenCalledWith('art2');
        });
    });
    describe('body', () => {
        it('returns input body', () => {
            mockGetInput.mockReturnValueOnce('')
                .mockReturnValueOnce('body');
            expect(inputs.body).toBe('body');
        });
        it('returns body file contents', () => {
            mockGetInput.mockReturnValueOnce('a/path');
            mockReadFileSync.mockReturnValue('file');
            expect(inputs.body).toBe('file');
        });
        it('returns empty', () => {
            mockGetInput.mockReturnValueOnce('')
                .mockReturnValueOnce('');
            expect(inputs.body).toBe('');
        });
    });
    describe('draft', () => {
        it('returns false', () => {
            expect(inputs.draft).toBe(false);
        });
        it('returns true', () => {
            mockGetInput.mockReturnValue('true');
            expect(inputs.draft).toBe(true);
        });
    });
    describe('name', () => {
        it('returns input name', () => {
            mockGetInput.mockReturnValue('name');
            expect(inputs.name).toBe('name');
        });
        it('returns tag', () => {
            mockGetInput.mockReturnValue('');
            context.ref = 'refs/tags/sha-tag';
            expect(inputs.name).toBe('sha-tag');
        });
    });
    describe('tag', () => {
        it('returns input tag', () => {
            mockGetInput.mockReturnValue('tag');
            expect(inputs.tag).toBe('tag');
        });
        it('returns context sha when input is empty', () => {
            mockGetInput.mockReturnValue('');
            context.ref = 'refs/tags/sha-tag';
            expect(inputs.tag).toBe('sha-tag');
        });
        it('returns context sha when input is null', () => {
            mockGetInput.mockReturnValue(null);
            context.ref = 'refs/tags/sha-tag';
            expect(inputs.tag).toBe('sha-tag');
        });
        it('throws if no tag', () => {
            expect(() => inputs.tag).toThrow();
        });
    });
    describe('type', () => {
        it('returns zip', () => {
            mockGetInput.mockReturnValue('zip');
            expect(inputs.type).toBe('zip');
        });
        it('returns tar', () => {
            TAR_OPTIONS.forEach((option) => {
                mockGetInput.mockReturnValue(option);
                expect(inputs.type).toBe('tar');
            });
        });
        it('returns empty when input type is unsupported', () => {
            mockGetInput.mockReturnValue('jpeg');
            expect(inputs.type).toBe('');
        });
        it('returns empty when input is empty', () => {
            mockGetInput.mockReturnValue('');
            expect(inputs.type).toBe('');
        });
    });
    /**
     * @return {ArtifactGlobber}
     */
    function createGlobber() {
        const MockGlobber = jest.fn(() => ({
            globArtifactString: mockGlob,
        }));
        mockGlob.mockImplementation(() => FILES);
        return new MockGlobber();
    }
});
