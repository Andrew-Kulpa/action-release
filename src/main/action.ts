import { Inputs } from './inputs';
import { Release } from './release';
import { ArtifactUploader } from './artifactUploader';
import { Artifact } from './artifact';
import { ArtifactArchiver } from './artifactArchiver';

/**
 * Action creates GitHub release action
 */
export class Action {
  /**
   * Action takes an object containing the inputs from the config file,
   * an object implementing the release interface functions,
   * and an artifact uploader which uploads a list of artifact files to GitHub actions
   * @param {Inputs} inputs
   * @param {Release} release
   * @param {ArtifactUploader} uploader
   */
  constructor(
    private readonly inputs: Inputs,
    private readonly release: Release,
    private readonly uploader: ArtifactUploader,
  ) { }

  /**
   * Runs the GitHub action
   * @return {Promise<void>}
   */
  async run(): Promise<void> {
    if (this.inputs.overwrite) {
      await this.release.deleteByTag(this.inputs.tag);
    }

    const release = await this.release.create({
      tag_name: this.inputs.tag,
      body: this.inputs.body,
      target_commitish: this.inputs.commit,
      draft: this.inputs.draft,
      prerelease: this.inputs.prerelease,
      name: this.inputs.name,
    });

    const zipFile = async (): Promise<Artifact[]> => {
      const archive = new ArtifactArchiver(this.inputs.type);
      await archive.compressArtifacts(this.inputs.files, __dirname + this.inputs.outputName);
      return [new Artifact(this.inputs.outputName)];
    };

    const files = (this.inputs.type) ? await zipFile() : this.inputs.files;

    if (files.length > 0) {
      this.uploader.uploadArtifacts(files, release.data.upload_url);
    }
  }
}
