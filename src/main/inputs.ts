import { getInput, warning } from '@actions/core';
import { Context } from '@actions/github/lib/context';
import { readFileSync } from 'fs';
import { Artifact } from './artifact';
import { ArtifactGlobber } from './artifactGlobber';

const TAR_OPTIONS = ['tar', 'gz', 'tgz', 'tar.gz'];

export interface Inputs {
  readonly files: Artifact[]
  readonly body: string
  readonly commit: string
  readonly overwrite: boolean
  readonly draft: boolean
  readonly prerelease: boolean
  readonly name: string
  readonly outputName: string
  readonly type: string
  readonly tag: string
  readonly token: string
}

/**
 * ActionInputs implements the Inputs interface
 */
export class ActionInputs implements Inputs {
  /**
   * Action inputs takes an artifact globber and the current GitHub context
   * @param {ArtifactGlobber} artifactGlobber
   * @param {Context} context
   */
  constructor(
    private readonly artifactGlobber: ArtifactGlobber,
    private context: Context,
  ) { }

  /**
   * Returns a list of artifacts
   * @return {Artifact[]}
   */
  get files(): Artifact[] {
    const files = getInput('files') || getInput('file');
    return (files) ? this.artifactGlobber.globArtifactString(files) : [];
  }

  /**
   * Returns the body of the release (either from a file or directly specified)
   * @return {string}
   */
  get body(): string {
    const bodyFilePath = getInput('bodyFile');
    return bodyFilePath ? this.stringFromFile(bodyFilePath) : getInput('body');
  }

  /**
   * Returns the output file name
   * @return {string}
   */
  get outputName(): string {
    return `/${this.name}${this.extension}`;
  }

  /**
   * Returns the type of compression to use (zip, gzip, or none)
   * @return {string}
   */
  get type(): string {
    const format = getInput('archiveType');
    if (TAR_OPTIONS.includes(format)) {
      return 'tar';
    }
    if (!format || format === 'zip') {
      return format;
    }

    warning(`Unsupported format ${format}. Failing back to default.`);
    return '';
  }

  /**
   * Returns the name of the release (defaults to the name of the tag)
   * @return {string}
   */
  get name(): string {
    return getInput('name') || this.tag;
  }

  /**
   * Returns whether the release should be marked as a draft
   * @return {boolean}
   */
  get draft(): boolean {
    return getInput('draft') === 'true';
  }

  /**
   * Returns whether to overwrite an existing release
   * @return {boolean}
   */
  get overwrite(): boolean {
    return getInput('overwrite') === 'true';
  }

  /**
   * Returns whether the release is a prerelease
   * @return {boolean}
   */
  get prerelease(): boolean {
    return getInput('prerelease') === 'true';
  }

  /**
   * Returns the commit sha
   * @return {string}
   */
  get commit(): string {
    return this.context.sha;
  }

  /**
   * Returns the release tag (defaults to ref tag)
   * @return {string}
   */
  get tag(): string {
    const tag = getInput('tag');
    if (tag) {
      return tag;
    }

    const ref = this.context.ref;
    const tagPath = 'refs/tags/';
    if (ref && ref.startsWith(tagPath)) {
      return ref.substr(tagPath.length, ref.length);
    }

    throw new Error('No tag found in ref or input!');
  }

  /**
   * Returns the specified GitHub API token
   * @return {string}
   */
  get token(): string {
    return getInput('token', { required: true });
  }

  /**
   * Returns the extension of the output file (based on compression type)
   * @return {string}
   */
  get extension(): string {
    const type = this.type;
    if (!type) {
      return '';
    }

    return (type === 'tar') ? `.${type}.gz` : `.${type}`;
  }

  /**
   * Given a path, reads in the contents of a file into a string
   * @param {string} path
   * @return {string}
   */
  stringFromFile(path: string): string {
    return readFileSync(path, 'utf-8');
  }
}
