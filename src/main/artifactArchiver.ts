import archiver from 'archiver';
import { createWriteStream } from 'fs';
import { Artifact } from './artifact';

/**
 * Artifact Archiver takes a list of files and creates a zip archive
 * (zip and tar.gz supported)
 */
export class ArtifactArchiver {
  private readonly archiver: archiver.Archiver;
  /**
   * Takes a string specifying the format of the zip archive
   * @param {string} format
   */
  constructor(
    readonly format: string,
  ) {
    const options = {
      gzip: (format === 'tar'),
      zlib: { level: 9 },
    };
    this.archiver = archiver(format as archiver.Format, options);
  }

  /**
   * Compresses a list of artifacts into a zipfile with name {outputFile}
   * @param {Artifact[]} artifacts
   * @param {string} outputFile
   * @return {Promise<void>}
   */
  async compressArtifacts(artifacts: Artifact[], outputFile: string): Promise<void> {
    try {
      const output = createWriteStream(outputFile);
      this.archiver.pipe(output);

      artifacts.forEach((artifact) => {
        this.archiver.file(artifact.path, {});
      });
      await this.archiver.finalize();
    } catch (error) {
      throw new Error(`Failed to archive files: ${error.message}`);
    }
  }
}
