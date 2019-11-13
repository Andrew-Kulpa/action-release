"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const artifact_1 = require("../src/main/artifact");
const fileContents = Buffer.from('test file contents', 'utf-8');
const contentLength = 2;
jest.mock('fs', () => ({
    readFileSync: () => fileContents,
    statSync: () => ({ size: contentLength }),
}));
describe('Artifact', () => {
    it('generates name from path', () => {
        const artifact = new artifact_1.Artifact('some/artifact');
        expect(artifact.name).toBe('artifact');
    });
    it('provides contentLength', () => {
        const artifact = new artifact_1.Artifact('some/artifact');
        expect(artifact.contentLength).toBe(contentLength);
    });
    it('provides path', () => {
        const artifact = new artifact_1.Artifact('some/artifact');
        expect(artifact.path).toBe('some/artifact');
    });
    it('reads artifact', () => {
        const artifact = new artifact_1.Artifact('some/artifact');
        expect(artifact.readFile()).toBe(fileContents);
    });
});
