import { Artifact } from './artifact';
import { Release } from './release';
export interface ArtifactUploader {
  uploadArtifacts(artifacts: Artifact[], uploadUrl: string): void
}

/**
 * GitHubArtifactUploader uploads a list of artifacts to GitHub releases
 */
export class GitHubArtifactUploader implements ArtifactUploader {
  /**
   * Takes an object satisfying the Release interface
   * @param {Release} release
   */
  constructor(
    private readonly release: Release,
  ) { }

  /**
   * Uploads a list of artifacts to GitHub Releases
   * @param {Artifact[]} artifacts
   * @param {string} url
   */
  async uploadArtifacts(artifacts: Artifact[], url: string): Promise<void> {
    artifacts.forEach(async (artifact) => {
      await this.release.uploadAsset({
        url,
        headers: {
          'content-length': artifact.contentLength,
          'content-type': artifact.contentType,
        },
        file: artifact.readFile(),
        name: artifact.name,
      });
    });
  }
}
