"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint @typescript-eslint/no-explicit-any: off */
const artifactGlobber_1 = require("../src/main/artifactGlobber");
const artifact_1 = require("../src/main/artifact");
const globResults = ['file1', 'file2'];
const artifacts = `path1
path2`;
describe('ArtifactGlobber', () => {
    it('globs simple path', () => {
        const globber = createArtifactGlobber();
        const expectedArtifacts = globResults.map((path) => new artifact_1.Artifact(path));
        expect(globber.globArtifactString('path'))
            .toEqual(expectedArtifacts);
    });
    it('splits multiple paths', () => {
        const globber = createArtifactGlobber();
        const expectedArtifacts = globResults
            .concat(globResults)
            .map((path) => new artifact_1.Artifact(path));
        expect(globber.globArtifactString(artifacts))
            .toEqual(expectedArtifacts);
    });
    /**
     * @return {FileArtifactGlobber}
     */
    function createArtifactGlobber() {
        const MockGlobber = jest.fn(() => ({ glob: () => globResults }));
        return new artifactGlobber_1.FileArtifactGlobber(new MockGlobber());
    }
});
