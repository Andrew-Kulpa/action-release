import { Globber, FileGlobber } from './globber';
import { Artifact } from './artifact';

export interface ArtifactGlobber {
  globArtifactString(artifact: string): Artifact[]
}

/**
 * FileArtifactGlobber implements ArtifactGlobber
 */
export class FileArtifactGlobber implements ArtifactGlobber {
  /**
   * Takes an object satisfying the 'Globber' interface
   * @param {Globber} globber
   */
  constructor(
    private readonly globber: Globber = new FileGlobber(),
  ) { }

  /**
   * Globs a list of paths and creates Artifacts from them
   * @param {string} artifact
   * @return {Artifact[]}
   */
  globArtifactString(artifact: string): Artifact[] {
    return artifact.split(/\r?\n/)
      .map((path) => this.globber.glob(path))
      .reduce((accumulated, current) => accumulated.concat(current))
      .map((path) => new Artifact(path));
  }
}
