"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint @typescript-eslint/no-explicit-any: off */
const artifact_1 = require("../src/main/artifact");
const artifactUploader_1 = require("../src/main/artifactUploader");
const artifacts = [
    new artifact_1.Artifact('dist/file1.js'),
    new artifact_1.Artifact('dist/file2.exe'),
];
const fileContents = Buffer.from('test file contents', 'utf-8');
const contentLength = 100;
const uploadMock = jest.fn();
const url = 'https://api.example.com';
jest.mock('fs', () => ({
    readFileSync: () => fileContents,
    statSync: () => ({ size: contentLength }),
}));
describe('ArtifactUploader', () => {
    it('uploads artifacts', () => {
        const uploader = createUploader();
        uploader.uploadArtifacts(artifacts, url);
        expect(uploadMock).toHaveBeenCalledTimes(2);
        expect(uploadMock)
            .toHaveBeenCalledWith({
            url,
            headers: {
                'content-length': contentLength,
                'content-type': 'application/javascript',
            },
            file: fileContents,
            name: 'file1.js',
        });
        expect(uploadMock)
            .toHaveBeenCalledWith({
            url,
            headers: {
                'content-length': contentLength,
                'content-type': 'application/octet-stream',
            },
            file: fileContents,
            name: 'file2.exe',
        });
    });
    /**
     * @return {GitHubArtifactUploader}
     */
    function createUploader() {
        const MockRelease = jest.fn(() => ({
            create: jest.fn(),
            uploadAsset: uploadMock,
            deleteByTag: jest.fn(),
        }));
        return new artifactUploader_1.GitHubArtifactUploader(new MockRelease());
    }
});
