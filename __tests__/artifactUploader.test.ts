/* eslint @typescript-eslint/no-explicit-any: off */
import { Artifact } from '../src/main/artifact';
import { GitHubArtifactUploader } from '../src/main/artifactUploader';
import { Release } from '../src/main/release';

const artifacts = [
  new Artifact('dist/file1.js'),
  new Artifact('dist/file2.exe'),
];

const fileContents = Buffer.from('test file contents', 'utf-8');
const contentLength = 100;
const uploadMock = jest.fn();
const url = 'https://api.example.com';

jest.mock('fs', () => ({
  readFileSync: (): Buffer => fileContents,
  statSync: (): { size: number } => ({ size: contentLength }),
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
  function createUploader(): GitHubArtifactUploader {
    const MockRelease = jest.fn<Release, any>(() => ({
      create: jest.fn(),
      uploadAsset: uploadMock,
      deleteByTag: jest.fn(),
    }));
    return new GitHubArtifactUploader(new MockRelease());
  }
});
