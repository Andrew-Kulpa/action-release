/* eslint @typescript-eslint/no-explicit-any: off */
import { FileArtifactGlobber } from '../src/main/artifactGlobber';
import { Globber } from '../src/main/globber';
import { Artifact } from '../src/main/artifact';

const globResults = ['file1', 'file2'];
const artifacts = `path1
path2`;

describe('ArtifactGlobber', () => {
  it('globs simple path', () => {
    const globber = createArtifactGlobber();

    const expectedArtifacts =
      globResults.map((path) => new Artifact(path));

    expect(globber.globArtifactString('path'))
      .toEqual(expectedArtifacts);
  });

  it('splits multiple paths', () => {
    const globber = createArtifactGlobber();

    const expectedArtifacts =
      globResults
        .concat(globResults)
        .map((path) => new Artifact(path));

    expect(globber.globArtifactString(artifacts))
      .toEqual(expectedArtifacts);
  });

  /**
   * @return {FileArtifactGlobber}
   */
  function createArtifactGlobber(): FileArtifactGlobber {
    const MockGlobber = jest.fn<Globber, any>(() => ({ glob: (): string[] => globResults }));
    return new FileArtifactGlobber(new MockGlobber());
  }
});
